-- ClaimPilot Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  claim_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  incident_data JSONB NOT NULL,
  vehicle_data JSONB NOT NULL,
  insurance_data JSONB NOT NULL,
  damage_data JSONB NOT NULL,
  police_report JSONB,
  orchestrator_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id TEXT NOT NULL REFERENCES claims(claim_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_claim_id ON claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_claim_id ON chat_messages(claim_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert demo claim (C-DEMO-2025)
INSERT INTO claims (
  claim_id,
  status,
  incident_data,
  vehicle_data,
  insurance_data,
  damage_data,
  police_report,
  orchestrator_state
) VALUES (
  'C-DEMO-2025',
  'processing',
  '{
    "date": "2025-01-15",
    "time": "14:30",
    "location": "Route 1 & College Rd, Princeton, NJ",
    "type": "rear-end collision",
    "description": "I was stopped at a red light when the vehicle behind me failed to brake in time. Impact caused damage to my rear bumper, trunk, and right taillight."
  }',
  '{
    "year": 2024,
    "make": "Hyundai",
    "model": "Elantra",
    "license_plate": "ABC1234",
    "vin": "5NPD84LF9RH123456"
  }',
  '{
    "provider": "State Farm",
    "policy_number": "SF-987-654-321",
    "coverage_type": "comprehensive",
    "deductible": 500
  }',
  '{
    "description": "Rear bumper cracked and misaligned, trunk lid dented, right taillight shattered, possible frame damage",
    "severity": "moderate",
    "photos_uploaded": true
  }',
  '{
    "filed": true,
    "report_number": "PR-2025-001547",
    "officer_name": "Officer Martinez"
  }',
  '{
    "core_agent": {
      "status": "complete",
      "data": {
        "extracted_data": {
          "incident_type": "rear-end collision",
          "parties_involved": 2,
          "damage_location": "rear"
        }
      },
      "timestamp": "2025-01-15T15:00:00Z"
    },
    "fintrack": {
      "status": "complete",
      "data": {
        "damage_total": 1470,
        "deductible": 500,
        "payout": 970,
        "confidence": "high"
      },
      "timestamp": "2025-01-15T15:05:00Z"
    },
    "repair_advisor": {
      "status": "complete",
      "data": {
        "shops": [
          {
            "name": "Princeton Auto Body",
            "rating": 4.8,
            "price_estimate": 1350,
            "turnaround_days": 3,
            "distance_miles": 2.4,
            "address": "123 Main St, Princeton, NJ"
          },
          {
            "name": "Elite Collision Center",
            "rating": 4.6,
            "price_estimate": 1420,
            "turnaround_days": 2,
            "distance_miles": 3.1,
            "address": "456 Nassau St, Princeton, NJ"
          },
          {
            "name": "Quality Auto Repair",
            "rating": 4.7,
            "price_estimate": 1380,
            "turnaround_days": 4,
            "distance_miles": 1.8,
            "address": "789 University Pl, Princeton, NJ"
          }
        ]
      },
      "timestamp": "2025-01-15T15:10:00Z"
    },
    "drafting": {
      "status": "complete",
      "data": {
        "pdf_url": "/demo-claim.pdf"
      },
      "timestamp": "2025-01-15T15:15:00Z"
    },
    "compliance": {
      "status": "complete",
      "data": {
        "all_checks_passed": true,
        "missing_fields": [],
        "ready_to_submit": true,
        "warnings": []
      },
      "timestamp": "2025-01-15T15:20:00Z"
    }
  }'
) ON CONFLICT (claim_id) DO NOTHING;

-- Insert sample chat messages for demo claim
INSERT INTO chat_messages (claim_id, role, content) VALUES
  ('C-DEMO-2025', 'assistant', 'Hello! I''m ClaimPilot AI. I see you''ve filed a claim for a rear-end collision. I''ve reviewed your information and all agents have successfully processed your claim. How can I help you today?'),
  ('C-DEMO-2025', 'user', 'What''s my estimated payout?'),
  ('C-DEMO-2025', 'assistant', 'Based on the damage assessment, your estimated payout is $970. This is calculated from the total damage estimate of $1,470 minus your $500 deductible. The FinTrack agent has rated this estimate as high confidence since you''ve uploaded photos of the damage.')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- For now, allow all operations (you should restrict this in production)
CREATE POLICY "Allow all operations on claims" ON claims
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on chat_messages" ON chat_messages
  FOR ALL USING (true) WITH CHECK (true);
