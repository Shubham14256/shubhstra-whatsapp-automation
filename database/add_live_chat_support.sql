-- =====================================================
-- ADD LIVE CHAT SUPPORT (AI PAUSE FEATURE)
-- =====================================================
-- This migration adds the ability for doctors to manually
-- chat with patients and pause the AI bot
-- =====================================================

-- Add is_bot_paused column to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS is_bot_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bot_paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bot_paused_by UUID REFERENCES doctors(id);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_patients_is_bot_paused ON patients(is_bot_paused);

-- Add comments for documentation
COMMENT ON COLUMN patients.is_bot_paused IS 'TRUE when doctor takes over chat manually (AI will not respond)';
COMMENT ON COLUMN patients.bot_paused_at IS 'Timestamp when AI bot was paused';
COMMENT ON COLUMN patients.bot_paused_by IS 'Doctor ID who paused the AI bot';

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
AND column_name IN ('is_bot_paused', 'bot_paused_at', 'bot_paused_by');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Live Chat support columns added successfully!';
  RAISE NOTICE '📋 Patients table now supports:';
  RAISE NOTICE '   - AI bot pause/resume for manual doctor chat';
  RAISE NOTICE '   - Tracking who paused the bot and when';
END $$;
