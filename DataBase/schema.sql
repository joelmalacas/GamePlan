-- GamePlan Database Schema
-- PostgreSQL Database for Sports Club Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- USERS AND AUTHENTICATION
-- =============================================================================

-- Users table (main authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    country VARCHAR(3) NOT NULL, -- ISO country code
    phone VARCHAR(20),
    profile_picture_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- =============================================================================
-- CLUBS AND ORGANIZATIONS
-- =============================================================================

-- Clubs table
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    founded_year INTEGER,
    logo_url TEXT,
    cover_image_url TEXT,
    colors JSONB, -- Store primary/secondary colors
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(3) NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url TEXT,
    social_media JSONB, -- Store social media links
    sport_type VARCHAR(50) NOT NULL DEFAULT 'football', -- football, basketball, etc.
    division VARCHAR(100), -- League/Division name
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium
    subscription_expires TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Club roles/positions
CREATE TABLE club_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- coaching_staff, players, management, medical
    description TEXT,
    permissions JSONB, -- Store role permissions
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO club_roles (name, category, description, is_system_role, permissions) VALUES
('Head Coach', 'coaching_staff', 'Main coach responsible for team strategy and training', TRUE, '{"manage_trainings": true, "manage_matches": true, "manage_squad": true, "view_finances": false}'),
('Assistant Coach', 'coaching_staff', 'Assistant to the head coach', TRUE, '{"manage_trainings": true, "manage_matches": false, "manage_squad": false, "view_finances": false}'),
('Goalkeeping Coach', 'coaching_staff', 'Specialized coach for goalkeepers', TRUE, '{"manage_trainings": true, "manage_matches": false, "manage_squad": false, "view_finances": false}'),
('Set Pieces Coach', 'coaching_staff', 'Specialized coach for set pieces', TRUE, '{"manage_trainings": true, "manage_matches": false, "manage_squad": false, "view_finances": false}'),
('Player', 'players', 'Team player', TRUE, '{"view_trainings": true, "view_matches": true, "manage_squad": false, "view_finances": false}'),
('Captain', 'players', 'Team captain with leadership responsibilities', TRUE, '{"view_trainings": true, "view_matches": true, "manage_squad": false, "view_finances": false}'),
('Manager', 'management', 'Club manager with administrative responsibilities', TRUE, '{"manage_trainings": false, "manage_matches": true, "manage_squad": true, "view_finances": true}'),
('President', 'management', 'Club president with full access', TRUE, '{"manage_trainings": true, "manage_matches": true, "manage_squad": true, "view_finances": true}'),
('Physiotherapist', 'medical', 'Medical staff for player health', TRUE, '{"view_trainings": true, "view_matches": true, "manage_squad": false, "view_finances": false}'),
('Team Doctor', 'medical', 'Medical doctor for the team', TRUE, '{"view_trainings": true, "view_matches": true, "manage_squad": false, "view_finances": false}');

-- Club members (users belonging to clubs)
CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES club_roles(id),
    jersey_number INTEGER,
    position VARCHAR(50), -- For players: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST
    weekly_salary DECIMAL(10,2), -- Optional salary information
    contract_start DATE,
    contract_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, club_id),
    UNIQUE(club_id, jersey_number) -- Unique jersey numbers per club
);

-- Club invitations
CREATE TABLE club_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(id),
    invitee_email VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES club_roles(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP
);

-- =============================================================================
-- TRAINING SESSIONS
-- =============================================================================

-- Training sessions
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    training_type VARCHAR(50), -- tactical, physical, technical, friendly_match
    location VARCHAR(200),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    equipment_needed TEXT[],
    notes TEXT,
    weather_conditions VARCHAR(100),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Training attendance
CREATE TABLE training_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, present, absent, excused, late
    arrival_time TIME,
    excuse_reason TEXT,
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(training_session_id, member_id)
);

-- Training exercises/drills
CREATE TABLE training_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_session_id UUID NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
    exercise_name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10),
    equipment_used TEXT[],
    objectives TEXT[],
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- MATCHES AND COMPETITIONS
-- =============================================================================

-- Competitions/Leagues
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    season VARCHAR(20) NOT NULL, -- e.g., "2023/24"
    competition_type VARCHAR(50) NOT NULL, -- league, cup, friendly
    country VARCHAR(3),
    division VARCHAR(100),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id),
    home_club_id UUID NOT NULL REFERENCES clubs(id),
    away_club_id UUID NOT NULL REFERENCES clubs(id),
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(200),
    round VARCHAR(50), -- matchday, quarter-final, etc.
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, live, completed, postponed, cancelled
    referee_name VARCHAR(100),
    attendance INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match squads (called up players)
CREATE TABLE match_squads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
    is_starter BOOLEAN DEFAULT FALSE,
    position VARCHAR(50),
    jersey_number INTEGER,
    status VARCHAR(20) DEFAULT 'available', -- available, injured, suspended, unavailable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, member_id)
);

-- Match events (goals, cards, substitutions)
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    member_id UUID REFERENCES club_members(id),
    event_type VARCHAR(30) NOT NULL, -- goal, yellow_card, red_card, substitution_in, substitution_out
    minute INTEGER NOT NULL,
    description TEXT,
    assist_member_id UUID REFERENCES club_members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- FINANCIAL MANAGEMENT
-- =============================================================================

-- Financial categories
CREATE TABLE financial_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    description TEXT,
    is_system_category BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default financial categories
INSERT INTO financial_categories (name, type, description, is_system_category) VALUES
('Player Salaries', 'expense', 'Weekly/monthly player salaries', TRUE),
('Staff Salaries', 'expense', 'Coaching and support staff salaries', TRUE),
('Equipment', 'expense', 'Sports equipment and gear purchases', TRUE),
('Facility Rental', 'expense', 'Training ground and stadium rental fees', TRUE),
('Travel Expenses', 'expense', 'Transportation costs for away matches', TRUE),
('Medical Expenses', 'expense', 'Player medical and physiotherapy costs', TRUE),
('Registration Fees', 'expense', 'League and competition registration fees', TRUE),
('Insurance', 'expense', 'Club and player insurance costs', TRUE),
('Membership Fees', 'income', 'Player membership and registration fees', TRUE),
('Match Revenue', 'income', 'Gate receipts and match day revenue', TRUE),
('Sponsorship', 'income', 'Sponsorship deals and partnerships', TRUE),
('Merchandise', 'income', 'Club merchandise sales', TRUE),
('Grants', 'income', 'Government or federation grants', TRUE),
('Donations', 'income', 'Donations and fundraising', TRUE);

-- Financial transactions
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES financial_categories(id),
    member_id UUID REFERENCES club_members(id), -- For salary payments
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- income, expense
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(50), -- cash, bank_transfer, card, check
    reference_number VARCHAR(100),
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- weekly, monthly, quarterly, yearly
    next_occurrence DATE,
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, cancelled
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member payments (dues, fines, etc.)
CREATE TABLE member_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL, -- membership_fee, fine, equipment, other
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, waived
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- COMMUNICATIONS AND NOTIFICATIONS
-- =============================================================================

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    target_audience VARCHAR(50) DEFAULT 'all', -- all, players, coaching_staff, management
    is_pinned BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- training_reminder, match_callup, payment_due, announcement
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- STATISTICS AND PERFORMANCE
-- =============================================================================

-- Player statistics
CREATE TABLE player_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    matches_played INTEGER DEFAULT 0,
    matches_started INTEGER DEFAULT 0,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    clean_sheets INTEGER DEFAULT 0, -- For goalkeepers
    saves INTEGER DEFAULT 0, -- For goalkeepers
    training_attendance_rate DECIMAL(5,2), -- Percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, season)
);

-- Club statistics
CREATE TABLE club_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL,
    competition_id UUID REFERENCES competitions(id),
    matches_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, season, competition_id)
);

-- =============================================================================
-- MEDICAL AND INJURY TRACKING
-- =============================================================================

-- Medical records
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES club_members(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL, -- injury, illness, medical_check, treatment
    title VARCHAR(200) NOT NULL,
    description TEXT,
    severity VARCHAR(20), -- minor, moderate, severe
    body_part VARCHAR(50),
    injury_date DATE,
    expected_recovery_date DATE,
    actual_recovery_date DATE,
    treatment_plan TEXT,
    medical_professional VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active', -- active, recovered, chronic
    confidential BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Club indexes
CREATE INDEX idx_clubs_slug ON clubs(slug);
CREATE INDEX idx_clubs_active ON clubs(is_active);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_role_id ON club_members(role_id);

-- Training indexes
CREATE INDEX idx_training_sessions_club_id ON training_sessions(club_id);
CREATE INDEX idx_training_sessions_date ON training_sessions(date);
CREATE INDEX idx_training_attendance_session_id ON training_attendance(training_session_id);
CREATE INDEX idx_training_attendance_member_id ON training_attendance(member_id);

-- Match indexes
CREATE INDEX idx_matches_home_club ON matches(home_club_id);
CREATE INDEX idx_matches_away_club ON matches(away_club_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);

-- Financial indexes
CREATE INDEX idx_financial_transactions_club_id ON financial_transactions(club_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_member_payments_club_id ON member_payments(club_id);
CREATE INDEX idx_member_payments_member_id ON member_payments(member_id);
CREATE INDEX idx_member_payments_status ON member_payments(status);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_club_members_updated_at BEFORE UPDATE ON club_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_payments_updated_at BEFORE UPDATE ON member_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_player_statistics_updated_at BEFORE UPDATE ON player_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_club_statistics_updated_at BEFORE UPDATE ON club_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for club members with user details
CREATE VIEW club_members_details AS
SELECT
    cm.id,
    cm.club_id,
    cm.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.profile_picture_url,
    cr.name as role_name,
    cr.category as role_category,
    cm.jersey_number,
    cm.position,
    cm.weekly_salary,
    cm.contract_start,
    cm.contract_end,
    cm.is_active,
    cm.joined_at
FROM club_members cm
JOIN users u ON cm.user_id = u.id
JOIN club_roles cr ON cm.role_id = cr.id;

-- View for upcoming training sessions
CREATE VIEW upcoming_trainings AS
SELECT
    ts.id,
    ts.club_id,
    c.name as club_name,
    ts.title,
    ts.description,
    ts.training_type,
    ts.location,
    ts.date,
    ts.start_time,
    ts.end_time,
    ts.is_mandatory,
    u.first_name || ' ' || u.last_name as created_by_name
FROM training_sessions ts
JOIN clubs c ON ts.club_id = c.id
JOIN users u ON ts.created_by = u.id
WHERE ts.date >= CURRENT_DATE
  AND ts.status = 'scheduled'
ORDER BY ts.date, ts.start_time;

-- View for upcoming matches
CREATE VIEW upcoming_matches AS
SELECT
    m.id,
    m.match_date,
    m.venue,
    m.round,
    hc.name as home_club,
    ac.name as away_club,
    comp.name as competition_name,
    m.status
FROM matches m
JOIN clubs hc ON m.home_club_id = hc.id
JOIN clubs ac ON m.away_club_id = ac.id
LEFT JOIN competitions comp ON m.competition_id = comp.id
WHERE m.match_date >= CURRENT_TIMESTAMP
  AND m.status IN ('scheduled', 'live')
ORDER BY m.match_date;

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Sample user (password: "Password123!")
INSERT INTO users (first_name, last_name, email, password_hash, birth_date, country, is_email_verified) VALUES
('John', 'Doe', 'john.doe@example.com', crypt('Password123!', gen_salt('bf')), '1990-05-15', 'US', TRUE);

-- Sample club
INSERT INTO clubs (name, slug, description, founded_year, address, city, country, sport_type, division) VALUES
('FC Example', 'fc-example', 'A professional football club', 2010, '123 Stadium Road', 'New York', 'US', 'football', 'Division 1');

-- Sample competition
INSERT INTO competitions (name, season, competition_type, country) VALUES
('Premier League', '2023/24', 'league', 'US');
