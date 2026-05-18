-- =============================================
-- MAONI 100.04 - Complete Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age_range TEXT CHECK (age_range IN ('18-25 ans', '26-35 ans', '36-45 ans', '46-55 ans', '56-65 ans', '66 ans et plus')),
    profession TEXT NOT NULL,
    phone TEXT UNIQUE,
    portrait_url TEXT,
    province TEXT,
    diaspora BOOLEAN DEFAULT false,
    other_residence TEXT,
    role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'moderator', 'admin', 'presidential')),
    language_preference TEXT DEFAULT 'fr',
    biometric_enabled BOOLEAN DEFAULT false,
    biometric_credential_id BYTEA,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_phone TEXT,
    civic_points INT DEFAULT 0,
    badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_verified BOOLEAN DEFAULT false,
    verification_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_province ON profiles(province);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created ON profiles(created_at);
CREATE INDEX idx_profiles_diaspora ON profiles(diaspora);

-- =============================================
-- PROPOSALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL CHECK (char_length(subject) <= 250),
    one_sentence TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'constitutional',
    image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    file_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    yes_count INT DEFAULT 0,
    no_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'featured', 'rejected', 'archived')),
    moderation_notes TEXT,
    moderated_by UUID REFERENCES profiles(id),
    moderated_at TIMESTAMPTZ,
    blockchain_hash TEXT,
    blockchain_tx TEXT,
    ai_coherence_score FLOAT,
    ai_sentiment_score FLOAT,
    ai_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN DEFAULT false,
    featured_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposals_user ON proposals(user_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);
CREATE INDEX idx_proposals_votes ON proposals(yes_count DESC, no_count DESC);
CREATE INDEX idx_proposals_category ON proposals(category);
CREATE INDEX idx_proposals_featured ON proposals(is_featured);
CREATE FULLTEXT INDEX idx_proposals_search ON proposals(subject, content, one_sentence);

-- =============================================
-- VOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
    vote_source TEXT DEFAULT 'web' CHECK (vote_source IN ('web', 'sms', 'ussd', 'whatsapp', 'api')),
    blockchain_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, proposal_id)
);

-- Indexes
CREATE INDEX idx_votes_proposal ON votes(proposal_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_created ON votes(created_at);
CREATE INDEX idx_votes_type ON votes(vote);

-- =============================================
-- COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) <= 2000),
    is_edited BOOLEAN DEFAULT false,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_proposal ON comments(proposal_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_created ON comments(created_at);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- =============================================
-- SMS MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_number TEXT NOT NULL,
    message_text TEXT NOT NULL,
    response_text TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    message_id TEXT UNIQUE,
    processed BOOLEAN DEFAULT false,
    webhook_raw JSONB,
    command_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sms_from ON sms_messages(from_number);
CREATE INDEX idx_sms_processed ON sms_messages(processed);
CREATE INDEX idx_sms_received ON sms_messages(received_at);

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX idx_activity_target ON activity_log(target_type, target_id);

-- =============================================
-- PROVINCE STATISTICS TABLE (Materialized)
-- =============================================
CREATE TABLE IF NOT EXISTS province_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_name TEXT UNIQUE NOT NULL,
    population BIGINT DEFAULT 0,
    citizen_count INT DEFAULT 0,
    proposal_count INT DEFAULT 0,
    vote_count INT DEFAULT 0,
    yes_count INT DEFAULT 0,
    no_count INT DEFAULT 0,
    participation_rate FLOAT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('vote', 'comment', 'proposal_status', 'mention', 'system', 'badge')),
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- =============================================
-- REPORTS / MODERATION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('proposal', 'comment', 'user')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    resolved_by UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function: Increment vote count atomically
CREATE OR REPLACE FUNCTION increment_vote(proposal_id UUID, vote_column TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF vote_column = 'yes_count' THEN
    UPDATE proposals SET yes_count = COALESCE(yes_count, 0) + 1 WHERE id = proposal_id;
  ELSIF vote_column = 'no_count' THEN
    UPDATE proposals SET no_count = COALESCE(no_count, 0) + 1 WHERE id = proposal_id;
  ELSE
    RAISE EXCEPTION 'Invalid vote column: %', vote_column;
  END IF;
END;
$$;

-- Function: Update province statistics
CREATE OR REPLACE FUNCTION update_province_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear and repopulate
  DELETE FROM province_stats;
  
  INSERT INTO province_stats (province_name, citizen_count, proposal_count, vote_count, yes_count, no_count, participation_rate)
  SELECT 
    p.province as province_name,
    COUNT(DISTINCT p.id) as citizen_count,
    COUNT(DISTINCT pr.id) as proposal_count,
    COUNT(DISTINCT v.id) as vote_count,
    COUNT(DISTINCT CASE WHEN v.vote = 'yes' THEN v.id END) as yes_count,
    COUNT(DISTINCT CASE WHEN v.vote = 'no' THEN v.id END) as no_count,
    CASE 
      WHEN COUNT(DISTINCT p.id) > 0 THEN 
        ROUND((COUNT(DISTINCT pr.id)::FLOAT / COUNT(DISTINCT p.id)::FLOAT) * 100, 2)
      ELSE 0 
    END as participation_rate
  FROM profiles p
  LEFT JOIN proposals pr ON pr.user_id = p.id AND pr.status = 'published'
  LEFT JOIN votes v ON v.user_id = p.id
  WHERE p.province IS NOT NULL
  GROUP BY p.province;
END;
$$;

-- Function: Get user vote for a proposal
CREATE OR REPLACE FUNCTION get_user_vote(user_uuid UUID, proposal_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  vote_result TEXT;
BEGIN
  SELECT vote INTO vote_result
  FROM votes
  WHERE user_id = user_uuid AND proposal_id = proposal_uuid;
  
  RETURN vote_result;
END;
$$;

-- Function: Calculate proposal controversy score
CREATE OR REPLACE FUNCTION controversy_score(yes_votes INT, no_votes INT)
RETURNS FLOAT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  total INT;
  yes_ratio FLOAT;
BEGIN
  total := yes_votes + no_votes;
  IF total = 0 THEN
    RETURN 0;
  END IF;
  
  yes_ratio := yes_votes::FLOAT / total::FLOAT;
  
  -- Higher score when votes are evenly split (controversial)
  -- Lower score when one-sided
  RETURN (1 - ABS(yes_ratio - 0.5) * 2) * LN(total + 1);
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_proposals_modtime
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_comments_modtime
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    profession, 
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Citoyen'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Congolais'),
    COALESCE(NEW.raw_user_meta_data->>'profession', 'Non spécifié'),
    'citizen'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Log activity on vote
CREATE OR REPLACE FUNCTION log_vote_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, target_type, target_id, details)
  VALUES (NEW.user_id, 'vote', 'proposal', NEW.proposal_id, 
    jsonb_build_object('vote', NEW.vote, 'source', NEW.vote_source));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_vote_created
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION log_vote_activity();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profile info"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'presidential', 'moderator')
    )
  );

-- Proposals Policies
CREATE POLICY "Anyone can view published proposals"
  ON proposals FOR SELECT
  USING (status = 'published' OR status = 'featured' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id AND status != 'published');

CREATE POLICY "Moderators can update any proposal"
  ON proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'presidential', 'moderator')
    )
  );

-- Votes Policies
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can see their own votes"
  ON votes FOR SELECT
  USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Anyone can view published comments"
  ON comments FOR SELECT
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can comment"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Activity Log Policies
CREATE POLICY "Users can view their own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'presidential')
    )
  );

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets (run via Supabase dashboard or API)
-- Buckets: portraits, proposal-images, proposal-files

-- Storage Policies
-- These are set via the Supabase dashboard but documented here:
-- portraits: Public read, Authenticated write (own files only)
-- proposal-images: Public read, Authenticated write
-- proposal-files: Public read, Authenticated write

COMMIT;