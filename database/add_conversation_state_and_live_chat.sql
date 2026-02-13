-- =====================================================
-- ADD CONVERSATION STATE AND LIVE CHAT SUPPORT
-- =====================================================
-- This migration adds:
-- 1. Conversation state tracking for multi-step flows (appointment booking)
-- 2. AI pause mechanism for live chat handoff
-- =====================================================

-- Add conversation state columns to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS conversation_state VARCHAR(50) DEFAULT 'idle',
ADD COLUMN IF NOT EXISTS conversation_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_paused_by UUID REFERENCES doctors(id),
ADD COLUMN IF NOT EXISTS ai_paused_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_patients_conversation_state ON patients(conversation_state);
CREATE INDEX IF NOT EXISTS idx_patients_ai_paused ON patients(ai_paused);
CREATE INDEX IF NOT EXISTS idx_patients_ai_paused_by ON patients(ai_paused_by);

-- Add comments for documentation
COMMENT ON COLUMN patients.conversation_state IS 'Current conversation state: idle, booking_appointment, awaiting_feedback, etc.';
COMMENT ON COLUMN patients.conversation_data IS 'Temporary data for multi-step conversations (JSON format)';
COMMENT ON COLUMN patients.ai_paused IS 'TRUE when doctor takes over chat manually (AI will not respond)';
COMMENT ON COLUMN patients.ai_paused_by IS 'Doctor ID who paused the AI';
COMMENT ON COLUMN patients.ai_paused_at IS 'Timestamp when AI was paused';

-- Verification query
SELECT 
  COUNT(*) as total_patients,
  COUNT(*) FILTER (WHERE conversation_state = 'idle') as idle_patients,
  COUNT(*) FILTER (WHERE ai_paused = TRUE) as ai_paused_patients
FROM patients;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Conversation state and live chat columns added successfully!';
  RAISE NOTICE '📋 Patients table now supports:';
  RAISE NOTICE '   - Multi-step conversation flows (appointment booking)';
  RAISE NOTICE '   - AI pause/resume for live chat handoff';
  RAISE NOTICE '   - Conversation state tracking';
END $$;
