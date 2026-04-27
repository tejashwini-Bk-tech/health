-- =====================================================
-- NEURAL NEXUS - COMPLETE DATABASE SCHEMA
-- Run all of this in Supabase SQL Editor
-- https://lfzqgrlhmmpxqtzaayyc.supabase.co
-- =====================================================

-- 1. PROFILES TABLE (User info)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('user', 'health_officer', 'local_leader')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HEALTH REPORTS (Symptom reports from users)
CREATE TABLE IF NOT EXISTS public.health_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    symptoms TEXT[] NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 5),
    notes TEXT,
    location TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ALERTS (Health alerts for the community)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'moderate', 'high', 'critical')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'resolved')) DEFAULT 'active',
    type TEXT CHECK (type IN ('outbreak', 'warning', 'info', 'prevention')) DEFAULT 'warning',
    affected_areas TEXT[],
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. WATER QUALITY REPORTS
CREATE TABLE IF NOT EXISTS public.water_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('well', 'tap', 'river', 'pond', 'other')),
    ph_level DECIMAL(4, 2),
    turbidity DECIMAL(5, 2),
    contamination_detected BOOLEAN DEFAULT false,
    contamination_type TEXT,
    safe_to_drink BOOLEAN,
    reported_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. EDUCATIONAL CONTENT
CREATE TABLE IF NOT EXISTS public.learn_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT CHECK (category IN ('disease_prevention', 'hygiene', 'nutrition', 'emergency')),
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_content ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- HEALTH REPORTS POLICIES
CREATE POLICY "Users can create reports"
    ON public.health_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reports"
    ON public.health_reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Health officers can view all reports"
    ON public.health_reports FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('health_officer', 'local_leader'))
    );

-- ALERTS POLICIES (Everyone can read, only officers can create)
CREATE POLICY "Anyone can view active alerts"
    ON public.alerts FOR SELECT USING (status = 'active');

CREATE POLICY "Health officers can create alerts"
    ON public.alerts FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('health_officer', 'local_leader'))
    );

CREATE POLICY "Health officers can update alerts"
    ON public.alerts FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('health_officer', 'local_leader'))
    );

-- WATER REPORTS POLICIES
CREATE POLICY "Anyone can view water reports"
    ON public.water_reports FOR SELECT USING (true);

CREATE POLICY "Users can create water reports"
    ON public.water_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- LEARN CONTENT POLICIES
CREATE POLICY "Anyone can view content"
    ON public.learn_content FOR SELECT USING (true);

-- =====================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.health_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.health_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.health_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_water_reports_location ON public.water_reports(location);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Sample educational content
INSERT INTO public.learn_content (title, content, category) VALUES
('Handwashing Basics', 'Wash hands with soap for at least 20 seconds to prevent disease spread.', 'hygiene'),
('Safe Drinking Water', 'Boil water for 1 minute or use chlorine tablets to make it safe.', 'disease_prevention'),
('Mosquito Prevention', 'Use nets and remove standing water to prevent malaria and dengue.', 'disease_prevention'),
('When to See a Doctor', 'Seek immediate care for high fever, chest pain, or difficulty breathing.', 'emergency');

-- Sample alert
INSERT INTO public.alerts (title, description, severity, status, type, affected_areas) VALUES
('Water Contamination Alert', 'High bacteria levels detected in village wells. Boil water before drinking.', 'high', 'active', 'warning', ARRAY['North Village', 'South Village']),
('Cholera Outbreak', 'Multiple cholera cases reported. Maintain hygiene and drink boiled water only.', 'critical', 'active', 'outbreak', ARRAY['East Village']),
('Vaccination Drive', 'Free typhoid vaccination camp this weekend at health center.', 'low', 'active', 'info', ARRAY['All Villages']);
