import { Router } from 'express';
import { pool } from '../db/pool.js';
import { verifyChain } from '../lib/hash.js';

const router = Router();

router.get('/:passportId', async (req, res, next) => {
  try {
    const idOrPassport = req.params.passportId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrPassport);
    const query = isUuid
      ? 'SELECT p.id,p.passport_id,p.name,p.sku,p.category,p.description,p.batch_number,p.origin,p.status,p.created_at,u.name manufacturer_name,u.organization FROM products p JOIN users u ON u.id=p.manufacturer_id WHERE p.id=$1'
      : 'SELECT p.id,p.passport_id,p.name,p.sku,p.category,p.description,p.batch_number,p.origin,p.status,p.created_at,u.name manufacturer_name,u.organization FROM products p JOIN users u ON u.id=p.manufacturer_id WHERE p.passport_id=$1';

    const { rows: [product] } = await pool.query(query, [idOrPassport]);
    if (!product) return res.status(404).json({ error: 'Passport not found' });

    const { rows: events } = await pool.query(
      'SELECT sequence_no,event_type,event_date,location,details,actor_name,previous_hash,current_hash FROM lifecycle_events WHERE product_id=$1 ORDER BY sequence_no',
      [product.id]
    );

    res.json({ product, events, integrity: verifyChain(events) });
  } catch (e) {
    next(e);
  }
});

export default router;
