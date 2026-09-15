import { pool } from '../db/pool.js';
export async function audit(userId, action, entityType, entityId, metadata = {}) {
  await pool.query('INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata) VALUES ($1,$2,$3,$4,$5)', [userId || null, action, entityType, entityId || null, metadata]);
}
