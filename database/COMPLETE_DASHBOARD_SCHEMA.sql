-- =====================================================
-- COMPLETE DASHBOARD SCHEMA - Run this in Supabase SQL Editor
-- =====================================================
-- This file contains ALL tables, columns, and RLS policies needed for the dashboard

-- =====================================================
-- 1. ADD MISSING COLUMNS TO DOCTORS TABLE
-- =====================================================

-- Clinic Settings Columns
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS opening_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS closing_time TIME DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Welcome to our clinic! How can we help you today?',
ADD COLUMN IF NOT EXISTS holidays TEXT[], -- Array of holiday dates

-- WhatsApp Credentials (from Task 14)
ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_business_account_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_token_expires_at TIMESTAMP WITH TIME ZONE,

-- Social Media Links
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500),

-- Display Phone Number (for multi-tenancy)
ADD COLUMN IF NOT EXISTS display_phone_number VARCHAR(20);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_doctors_display_phone ON doctors(display_phone_number);
CREATE INDEX IF NOT EXISTS idx_doctors_whatsapp_phone_id ON doctors(whatsapp_phone_number_id);

-- =====================================================
-- 2. ADD MISSING COLUMNS TO PATIENTS TABLE
-- =====================================================

ALTER TABLE patients
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referred_by_patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_patients_referral_code ON patients(referral_code);

-- =====================================================
-- 3. ADD MISSING COLUMNS TO APPOINTMENTS TABLE
-- =====================================================

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS queue_number INTEGER,
ADD COLUMN IF NOT EXISTS consultation_notes TEXT;

-- Add constraint for payment_status
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS valid_payment_status;
ALTER TABLE appointments 
ADD CONSTRAINT valid_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_queue_number ON appointments(queue_number);

-- =====================================================
-- 4. CREATE QUEUE TABLE (for real-time queue management)
-- =====================================================

CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  queue_number INTEGER NOT NULL,
  queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'waiting',
  called_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_queue_status CHECK (status IN ('waiting', 'called', 'in_consultation', 'completed', 'skipped'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_queue_doctor_id ON queue(doctor_id);
CREATE INDEX IF NOT EXISTS idx_queue_date ON queue(queue_date);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_number ON queue(queue_number);

-- =====================================================
-- 5. CREATE MARKETING CAMPAIGNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  campaign_name VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  target_audience VARCHAR(50) DEFAULT 'all',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft',
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_campaign_status CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'cancelled')),
  CONSTRAINT valid_target_audience CHECK (target_audience IN ('all', 'active', 'inactive', 'new'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_doctor_id ON marketing_campaigns(doctor_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON marketing_campaigns(scheduled_at);

-- =====================================================
-- 6. CREATE REFERRAL NETWORK TABLE (for doctor-to-doctor referrals)
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  external_doctor_name VARCHAR(255) NOT NULL,
  external_doctor_phone VARCHAR(20),
  external_doctor_specialization VARCHAR(255),
  commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  total_referrals INTEGER DEFAULT 0,
  total_commission_due DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_network_referring_doctor ON referral_network(referring_doctor_id);

-- =====================================================
-- 7. CREATE KNOWLEDGE BASE TABLE (for AI cost optimization)
-- =====================================================

CREATE TABLE IF NOT EXISTS doctor_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  symptom_name VARCHAR(255),
  keywords TEXT[],
  question TEXT,
  answer TEXT,
  medical_advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_kb_category CHECK (category IN ('medical', 'administrative'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kb_doctor_id ON doctor_knowledge_base(doctor_id);
CREATE INDEX IF NOT EXISTS idx_kb_category ON doctor_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON doctor_knowledge_base USING GIN(keywords);

-- =====================================================
-- 8. CREATE SUBSCRIPTION TABLE (for future monetization)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_doctor_id ON subscriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE RLS POLICIES
-- =====================================================

-- DOCTORS TABLE POLICIES
-- Doctors can read and update their own record
CREATE POLICY "Doctors can view own record" ON doctors
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Doctors can update own record" ON doctors
  FOR UPDATE USING (auth.uid()::text = id::text);

-- PATIENTS TABLE POLICIES
-- Doctors can view and manage their own patients
CREATE POLICY "Doctors can view own patients" ON patients
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own patients" ON patients
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own patients" ON patients
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own patients" ON patients
  FOR DELETE USING (doctor_id = auth.uid());

-- APPOINTMENTS TABLE POLICIES
-- Doctors can view and manage their own appointments
CREATE POLICY "Doctors can view own appointments" ON appointments
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own appointments" ON appointments
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own appointments" ON appointments
  FOR DELETE USING (doctor_id = auth.uid());

-- QUEUE TABLE POLICIES
CREATE POLICY "Doctors can view own queue" ON queue
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own queue" ON queue
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own queue" ON queue
  FOR UPDATE USING (doctor_id = auth.uid());

-- MARKETING CAMPAIGNS POLICIES
CREATE POLICY "Doctors can view own campaigns" ON marketing_campaigns
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own campaigns" ON marketing_campaigns
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own campaigns" ON marketing_campaigns
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own campaigns" ON marketing_campaigns
  FOR DELETE USING (doctor_id = auth.uid());

-- REFERRAL NETWORK POLICIES
CREATE POLICY "Doctors can view own network" ON referral_network
  FOR SELECT USING (referring_doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own network" ON referral_network
  FOR INSERT WITH CHECK (referring_doctor_id = auth.uid());

CREATE POLICY "Doctors can update own network" ON referral_network
  FOR UPDATE USING (referring_doctor_id = auth.uid());

-- KNOWLEDGE BASE POLICIES
CREATE POLICY "Doctors can view own knowledge base" ON doctor_knowledge_base
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert own knowledge base" ON doctor_knowledge_base
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own knowledge base" ON doctor_knowledge_base
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own knowledge base" ON doctor_knowledge_base
  FOR DELETE USING (doctor_id = auth.uid());

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Doctors can view own subscription" ON subscriptions
  FOR SELECT USING (doctor_id = auth.uid());

-- =====================================================
-- 11. CREATE TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Trigger for marketing_campaigns updated_at
CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for referral_network updated_at
CREATE TRIGGER update_referral_network_updated_at
  BEFORE UPDATE ON referral_network
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for doctor_knowledge_base updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON doctor_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. VERIFICATION QUERIES
-- =====================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'doctors', 
    'patients', 
    'appointments', 
    'queue', 
    'marketing_campaigns', 
    'referral_network', 
    'doctor_knowledge_base', 
    'subscriptions'
  )
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'doctors', 
    'patients', 
    'appointments', 
    'queue', 
    'marketing_campaigns', 
    'referral_network', 
    'doctor_knowledge_base', 
    'subscriptions'
  );

-- Check all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 13. GRANT PERMISSIONS (if needed)
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON doctors TO authenticated;
GRANT ALL ON patients TO authenticated;
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON queue TO authenticated;
GRANT ALL ON marketing_campaigns TO authenticated;
GRANT ALL ON referral_network TO authenticated;
GRANT ALL ON doctor_knowledge_base TO authenticated;
GRANT ALL ON subscriptions TO authenticated;

-- =====================================================
-- DONE! Your database is now ready for the dashboard
-- =====================================================
