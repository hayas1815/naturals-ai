-- ==============================================================================
-- MIGRATION: Add audit_logs table (run this if schema was already applied)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read all audit logs
CREATE POLICY "Admins can read all audit logs"
ON audit_logs FOR SELECT
USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND role = 'admin')
);

-- Users can view only their own audit logs
CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT
USING (auth.uid() = user_id);
