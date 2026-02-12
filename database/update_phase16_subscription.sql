-- Phase 16: Subscription & Payment Lock
-- Add subscription tracking to doctors table

-- Add subscription_status column
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' 
CHECK (subscription_status IN ('trial', 'active', 'expired'));

-- Add plan_expiry_date column (default: 7 days from now)
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS plan_expiry_date TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days');

-- Add created_at if not exists
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS subscription_created_at TIMESTAMP DEFAULT NOW();

-- Create index for faster subscription checks
CREATE INDEX IF NOT EXISTS idx_doctors_subscription_status ON doctors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_doctors_plan_expiry ON doctors(plan_expiry_date);

-- Update existing doctors to have trial status with 7 days expiry
UPDATE doctors 
SET 
  subscription_status = 'trial',
  plan_expiry_date = NOW() + INTERVAL '7 days',
  subscription_created_at = NOW()
WHERE subscription_status IS NULL;

-- Function to check and update expired subscriptions (run this periodically)
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE doctors
  SET subscription_status = 'expired'
  WHERE plan_expiry_date < NOW() 
    AND subscription_status != 'expired';
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON COLUMN doctors.subscription_status IS 'Subscription status: trial, active, or expired';
COMMENT ON COLUMN doctors.plan_expiry_date IS 'Date when the subscription expires';
COMMENT ON COLUMN doctors.subscription_created_at IS 'When the subscription was created';
