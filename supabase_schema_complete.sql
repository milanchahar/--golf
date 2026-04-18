-- Golf Heroes Master SQL Initialization
-- Replaces all individual section scripts into a single deployment payload.

-- 1. PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'lapsed', 'cancelled', 'past_due')),
    subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
    subscription_renewal_date TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    selected_charity_id UUID,
    charity_contribution_percent INTEGER DEFAULT 10,
    notification_preferences JSONB DEFAULT '{"email_draws": true, "email_news": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profile access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger for profile creation on Auth
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 2. SUBSCRIPTIONS LOG (Historical tracking)
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT NOT NULL,
    status TEXT NOT NULL,
    plan_type TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subs" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- 3. GOLF SCORES
CREATE TABLE golf_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    score_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scores readable by owner" ON golf_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Scores insertable by active subs" ON golf_scores FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND subscription_status = 'active')
);
CREATE POLICY "Scores editable by owner" ON golf_scores FOR UPDATE USING (auth.uid() = user_id);

-- 4. DRAWS & ENTRIES
CREATE TABLE draws (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draw_month TEXT NOT NULL, -- e.g., '2026-10'
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
    draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
    drawn_numbers INTEGER[] DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    jackpot_carried_over BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE draw_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scores_used INTEGER[] NOT NULL,
    matched_count INTEGER DEFAULT 0,
    prize_tier INTEGER,
    prize_amount NUMERIC(10, 2) DEFAULT 0,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. PRIZE POOLS
CREATE TABLE prize_pools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draw_id UUID REFERENCES draws(id),
    draw_month TEXT NOT NULL,
    total_active_subscribers INTEGER NOT NULL,
    subscription_revenue NUMERIC(10,2) NOT NULL,
    prize_pool_total NUMERIC(10,2) NOT NULL,
    five_match_pool NUMERIC(10,2) NOT NULL,
    four_match_pool NUMERIC(10,2) NOT NULL,
    three_match_pool NUMERIC(10,2) NOT NULL,
    jackpot_carry_in NUMERIC(10,2) DEFAULT 0,
    jackpot_carry_out NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CHARITIES
CREATE TABLE charities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_image_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    total_raised NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE charity_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    location TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE charity_contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    contribution_type TEXT DEFAULT 'subscription' CHECK (contribution_type IN ('subscription', 'direct')),
    stripe_invoice_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto Update Charity Total Rollups
CREATE OR REPLACE FUNCTION update_charity_total_raised() RETURNS trigger AS $$
BEGIN
  UPDATE charities 
  SET total_raised = total_raised + NEW.amount 
  WHERE id = NEW.charity_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_contribution_added AFTER INSERT ON charity_contributions FOR EACH ROW EXECUTE PROCEDURE update_charity_total_raised();

ALTER TABLE profiles ADD CONSTRAINT fk_charity FOREIGN KEY (selected_charity_id) REFERENCES charities(id);

-- 7. WINNER VERIFICATIONS
CREATE TABLE winner_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    draw_entry_id UUID REFERENCES draw_entries(id) ON DELETE CASCADE,
    proof_image_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid')),
    payment_reference TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', false);
CREATE POLICY "Users upload own proof" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'winner-proofs' AND (auth.uid() = owner));
CREATE POLICY "Users read own proof" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'winner-proofs' AND (auth.uid() = owner));

INSERT INTO storage.buckets (id, name, public) VALUES ('charity-images', 'charity-images', true);
CREATE POLICY "Public charity images" ON storage.objects FOR SELECT USING (bucket_id = 'charity-images');
