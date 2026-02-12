-- =====================================================
-- CREATE MESSAGES TABLE FOR CHAT HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'location', 'interactive', 'template')),
  message_body TEXT,
  media_url TEXT,
  whatsapp_message_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for fast queries
  CONSTRAINT idx_messages_created_at_desc CHECK (created_at IS NOT NULL)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_doctor_id ON messages(doctor_id);
CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_phone_number ON messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_whatsapp_id ON messages(whatsapp_message_id);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Doctors can view own messages" ON messages;
DROP POLICY IF EXISTS "Doctors can insert own messages" ON messages;

CREATE POLICY "Doctors can view own messages" ON messages
  FOR SELECT 
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Doctors can insert own messages" ON messages
  FOR INSERT 
  WITH CHECK (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Grant permissions
GRANT ALL ON messages TO authenticated;

-- Add comments
COMMENT ON TABLE messages IS 'Stores all WhatsApp message history for chat display';
COMMENT ON COLUMN messages.direction IS 'incoming = from patient, outgoing = to patient';
COMMENT ON COLUMN messages.message_type IS 'Type of WhatsApp message';
COMMENT ON COLUMN messages.status IS 'Delivery status of outgoing messages';

-- Verification
SELECT COUNT(*) as message_count FROM messages;
