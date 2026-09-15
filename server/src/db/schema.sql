CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('manufacturer', 'admin');
CREATE TYPE lifecycle_type AS ENUM ('manufacturing', 'inspection', 'shipping', 'ownership_transfer');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'manufacturer', organization VARCHAR(160), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), passport_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(160) NOT NULL, sku VARCHAR(80) NOT NULL, category VARCHAR(100) NOT NULL,
  description TEXT, batch_number VARCHAR(100), origin VARCHAR(120), status VARCHAR(50) NOT NULL DEFAULT 'Registered',
  manufacturer_id UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sequence_no INT NOT NULL, event_type lifecycle_type NOT NULL, event_date TIMESTAMPTZ NOT NULL,
  location VARCHAR(180), details TEXT NOT NULL, actor_name VARCHAR(160) NOT NULL, actor_id UUID REFERENCES users(id),
  previous_hash CHAR(64) NOT NULL, current_hash CHAR(64) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, sequence_no)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id), action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL, entity_id TEXT, metadata JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_product ON lifecycle_events(product_id, sequence_no);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
