-- ==============================================================================
-- 1. EXTENSIONS & TYPES
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE user_role AS ENUM ('customer', 'stylist', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('appointment', 'ai_report_ready', 'recommendation', 'system');

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- Core Authentication & Role Management (Extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'customer',
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beauty Profiles (Demographics and baseline)
CREATE TABLE beauty_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    dob DATE,
    gender VARCHAR(50),
    baseline_skin_type VARCHAR(100),
    baseline_hair_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beauty Scores (Aggregated scores for rapid dashboard fetching)
CREATE TABLE beauty_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
    skin_health_score INTEGER CHECK (skin_health_score BETWEEN 0 AND 100),
    hair_health_score INTEGER CHECK (hair_health_score BETWEEN 0 AND 100),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Reports (Detailed analysis payloads)
CREATE TABLE ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    face_image_url TEXT,
    hair_image_url TEXT,
    raw_gemini_payload JSONB NOT NULL,
    detected_concerns TEXT[],
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Catalog
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    ingredients_list TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations (Linking AI insights to Products)
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    ai_report_id UUID REFERENCES ai_reports(id) ON DELETE SET NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    match_confidence INTEGER CHECK (match_confidence BETWEEN 0 AND 100),
    status VARCHAR(50) DEFAULT 'suggested', -- suggested, purchased
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salon Analytics & Visits
CREATE TABLE salon_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    stylist_id UUID REFERENCES users(id),
    salon_location VARCHAR(255),
    services_rendered TEXT[],
    total_spend DECIMAL(10, 2),
    visit_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    salon_location VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status appointment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beauty Timelines (Historical snapshots for graphs/charts)
CREATE TABLE beauty_timelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- e.g., 'hydration', 'elasticity'
    metric_value DECIMAL(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Passports (Identity Management)
CREATE TABLE qr_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES beauty_profiles(id) ON DELETE CASCADE,
    qr_hash_token VARCHAR(255) UNIQUE NOT NULL,
    qr_image_url TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Analytics (Aggregated daily/weekly system metrics)
CREATE TABLE admin_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL UNIQUE,
    total_scans INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXING FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_profiles_user_id ON beauty_profiles(user_id);
CREATE INDEX idx_scores_profile ON beauty_scores(profile_id);
CREATE INDEX idx_timelines_profile_metric ON beauty_timelines(profile_id, metric_name);
CREATE INDEX idx_recommendations_profile ON recommendations(profile_id);
CREATE INDEX idx_appointments_profile_time ON appointments(profile_id, scheduled_time);
CREATE INDEX idx_visits_profile_date ON salon_visits(profile_id, visit_date);
CREATE INDEX idx_qr_hash ON qr_passports(qr_hash_token);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beauty_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE beauty_timelines ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON beauty_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins and Stylists can view all profiles
CREATE POLICY "Staff can view all profiles" 
ON beauty_profiles FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND role IN ('admin', 'stylist')
    )
);

-- Policy: Users can view their own AI reports
CREATE POLICY "Users can view own AI reports" 
ON ai_reports FOR SELECT 
USING (
    profile_id IN (SELECT id FROM beauty_profiles WHERE user_id = auth.uid())
);

-- ==============================================================================
-- 5. AUDIT LOGS (Security event tracking)
-- ==============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read all audit logs; users see only their own
CREATE POLICY "Admins can read all audit logs"
ON audit_logs FOR SELECT
USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT
USING (auth.uid() = user_id);
