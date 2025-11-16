CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_nodes (
  id UUID PRIMARY KEY,
  root_id UUID NOT NULL,
  parent_id UUID NULL,
  left_value DOUBLE PRECISION NOT NULL,
  op TEXT NULL,
  right_value DOUBLE PRECISION NULL,
  result DOUBLE PRECISION NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calc_root_id ON calculation_nodes(root_id);
CREATE INDEX IF NOT EXISTS idx_calc_parent_id ON calculation_nodes(parent_id);