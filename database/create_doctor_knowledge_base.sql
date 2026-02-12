-- Create doctor_knowledge_base table for personalized medical advice
-- This allows doctors to save pre-defined answers for common symptoms

CREATE TABLE IF NOT EXISTS doctor_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  
  -- Category: 'administrative' or 'medical'
  category VARCHAR(50) NOT NULL DEFAULT 'medical',
  
  -- For medical category
  symptom_name VARCHAR(255), -- e.g., "Fever", "Cough", "Headache"
  keywords TEXT[], -- Array of keywords to match, e.g., ['fever', 'temperature', 'bukhar']
  medical_advice TEXT NOT NULL, -- Doctor's personalized advice
  
  -- For administrative category (FAQ)
  question TEXT, -- e.g., "What are your clinic timings?"
  answer TEXT, -- Answer to the question
  
  -- Metadata
  specialty VARCHAR(100), -- Doctor's specialty this advice applies to
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority answers are checked first
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_category CHECK (category IN ('administrative', 'medical')),
  CONSTRAINT medical_fields_required CHECK (
    (category = 'medical' AND symptom_name IS NOT NULL AND keywords IS NOT NULL) OR
    (category = 'administrative' AND question IS NOT NULL AND answer IS NOT NULL)
  )
);

-- Create indexes for faster queries
CREATE INDEX idx_knowledge_base_doctor_id ON doctor_knowledge_base(doctor_id);
CREATE INDEX idx_knowledge_base_category ON doctor_knowledge_base(category);
CREATE INDEX idx_knowledge_base_active ON doctor_knowledge_base(is_active);
CREATE INDEX idx_knowledge_base_keywords ON doctor_knowledge_base USING GIN(keywords);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_knowledge_base_updated_at
  BEFORE UPDATE ON doctor_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();

-- Insert default medical advice templates for common symptoms
-- These can be customized by each doctor

-- Note: Replace 'YOUR_DOCTOR_ID' with actual doctor ID when running
-- For now, this is a template that doctors can customize

COMMENT ON TABLE doctor_knowledge_base IS 'Stores doctor-specific medical advice and administrative FAQs to reduce AI API calls';
COMMENT ON COLUMN doctor_knowledge_base.category IS 'Type of knowledge: medical (symptoms) or administrative (FAQs)';
COMMENT ON COLUMN doctor_knowledge_base.keywords IS 'Array of keywords to match patient messages (case-insensitive)';
COMMENT ON COLUMN doctor_knowledge_base.priority IS 'Higher priority entries are checked first (useful for specific vs general advice)';
