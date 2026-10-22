import { Router } from 'express';
import { pool } from '../db/pool.js';
import { audit } from '../lib/audit.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/email-passport/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows: [record] } = await pool.query(
      `SELECT p.id, p.passport_id, p.name, p.sku, p.category, p.status,
              p.description, p.origin, u.id AS owner_id,
              recipient.name AS recipient_name, recipient.email AS recipient_email
       FROM products p
       JOIN users u ON u.id = p.manufacturer_id
       JOIN users recipient ON recipient.id = $2
       WHERE p.id = $1`,
      [req.params.id, req.user.id]
    );

    if (!record) return res.status(404).json({ error: 'Product not found' });
    if (req.user.role !== 'admin' && record.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your product' });
    }
    if (!process.env.AGENT_SERVICE_URL || !process.env.AGENT_SERVICE_API_KEY) {
      return res.status(503).json({ error: 'Email agent is not configured on the server.' });
    }

    const { rows: events } = await pool.query(
      `SELECT event_type, event_date, location, details, actor_name
       FROM lifecycle_events
       WHERE product_id = $1
       ORDER BY sequence_no`,
      [record.id]
    );

    let response;
    try {
      response = await fetch(`${process.env.AGENT_SERVICE_URL.replace(/\/$/, '')}/email/passport`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Agent-API-Key': process.env.AGENT_SERVICE_API_KEY
        },
        body: JSON.stringify({
          recipient_email: record.recipient_email,
          recipient_name: record.recipient_name,
          product: {
            name: record.name,
            passport_id: record.passport_id,
            sku: record.sku,
            category: record.category,
            status: record.status,
            description: record.description,
            origin: record.origin
          },
          events
        }),
        signal: AbortSignal.timeout(60000)
      });
    } catch (error) {
      console.error('Email agent request failed:', error);
      return res.status(502).json({ error: 'The email agent could not be reached. Please try again.' });
    }

    if (!response.ok) {
      console.error(`Email agent returned HTTP ${response.status}: ${await response.text()}`);
      return res.status(502).json({ error: 'The email agent could not generate or send the email.' });
    }

    await audit(req.user.id, 'EMAIL_PASSPORT_SUMMARY', 'product', record.id);
    res.json({ status: 'sent', recipientEmail: record.recipient_email });
  } catch (error) {
    next(error);
  }
});

export default router;
