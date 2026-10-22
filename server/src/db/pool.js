import pg from 'pg';
import 'dotenv/config';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { GENESIS_HASH, hashEvent } from '../lib/hash.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let realPool = null;
let pgliteDb = null;

const postgresUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dpp_msme';

try {
  const tempPool = new pg.Pool({
    connectionString: postgresUrl,
    connectionTimeoutMillis: 10000,
  });
  await tempPool.query('SELECT 1');
  realPool = tempPool;
  console.log('Connected to PostgreSQL (Supabase) database.');
} catch (err) {
  console.log('PostgreSQL host not available (' + err.message + '). Using embedded PGlite database...');
  const { PGlite } = await import('@electric-sql/pglite');
  const dbPath = path.join(__dirname, '../../.dpp_data');
  pgliteDb = new PGlite(dbPath);

  try {
    const { rows } = await pgliteDb.query("SELECT to_regclass('public.users') as exists");
    if (!rows[0] || !rows[0].exists) {
      console.log('Initializing PGlite database schema & seed data...');
      let schema = await readFile(path.join(__dirname, 'schema.sql'), 'utf8');
      schema = schema.replace(/CREATE EXTENSION IF NOT EXISTS "pgcrypto";/gi, '');
      await pgliteDb.exec(schema);
      await autoSeedPgLite(pgliteDb);
    }
  } catch (err) {
    console.error('Error initializing PGlite schema:', err);
  }
}

async function autoSeedPgLite(db) {
  const pwd = await bcrypt.hash('Demo@123', 12);
  const makerRes = await db.query(
    'INSERT INTO users(name,email,password_hash,role,organization) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name RETURNING *',
    ['Ananya Rao', 'manufacturer@greenweave.demo', pwd, 'manufacturer', 'GreenWeave Textiles']
  );
  const maker = makerRes.rows[0];

  await db.query(
    'INSERT INTO users(name,email,password_hash,role,organization) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name RETURNING *',
    ['System Admin', 'admin@passport.demo', pwd, 'admin', 'DPP Authority']
  );

  const prodRes = await db.query(
    "INSERT INTO products(passport_id,name,sku,category,description,batch_number,origin,status,manufacturer_id) VALUES('DPP-GW-2026-0001','Organic Cotton Tote Bag','GW-TOTE-01','Textiles','Handcrafted reusable tote using certified organic cotton.','GW-SEP-26','Tiruppur, Tamil Nadu','Shipping',$1) ON CONFLICT(passport_id) DO UPDATE SET name=EXCLUDED.name RETURNING *",
    [maker.id]
  );
  const p = prodRes.rows[0];

  const existing = await db.query('SELECT id FROM lifecycle_events WHERE product_id=$1', [p.id]);
  if (!existing.rows.length) {
    let prev = GENESIS_HASH;
    const seed = [
      ['manufacturing', '2026-09-01T09:00:00.000Z', 'Tiruppur, Tamil Nadu', 'Product batch completed using organic cotton fabric.', 'GreenWeave Production Team'],
      ['inspection', '2026-09-02T11:00:00.000Z', 'Tiruppur, Tamil Nadu', 'Stitching, dimensions and fabric quality approved.', 'GreenWeave Quality Team'],
      ['shipping', '2026-09-03T08:30:00.000Z', 'Chennai, Tamil Nadu', 'Batch handed to logistics partner for dispatch.', 'GreenWeave Logistics']
    ];
    for (let i = 0; i < seed.length; i++) {
      const [type, date, location, details, actor] = seed[i];
      const e = { sequence_no: i + 1, event_type: type, event_date: date, location, details, actor_name: actor };
      const hash = hashEvent(prev, e);
      await db.query(
        'INSERT INTO lifecycle_events(product_id,sequence_no,event_type,event_date,location,details,actor_name,actor_id,previous_hash,current_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [p.id, e.sequence_no, type, date, location, details, actor, maker.id, prev, hash]
      );
      prev = hash;
    }
  }
  console.log('PGlite auto-seed complete. Demo password: Demo@123');
}

export const pool = {
  async query(text, params) {
    if (realPool) return realPool.query(text, params);
    const res = await pgliteDb.query(text, params);
    return {
      rows: res.rows || [],
      fields: res.fields || [],
      rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
    };
  },
  async connect() {
    if (realPool) return realPool.connect();
    return {
      query: async (text, params) => {
        const res = await pgliteDb.query(text, params);
        return {
          rows: res.rows || [],
          fields: res.fields || [],
          rowCount: res.affectedRows ?? (res.rows ? res.rows.length : 0),
        };
      },
      release: () => {},
    };
  },
  async end() {
    if (realPool) return realPool.end();
    if (pgliteDb) return pgliteDb.close();
  }
};
