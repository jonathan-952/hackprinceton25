-- ClaimPilot Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id TEXT UNIQUE NOT NULL,
    claim_number TEXT,
    policy_number TEXT,
    incident_type TEXT,
    incident_date DATE,
    incident_location TEXT,
    description TEXT,
    status TEXT DEFAULT 'Processing',
    estimated_amount NUMERIC,
    claimant_name TEXT,
    claimant_contact TEXT,
    items_damaged JSONB DEFAULT '[]'::jsonb,
    supporting_documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create financial_estimates table
CREATE TABLE IF NOT EXISTS financial_estimates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id TEXT REFERENCES claims(claim_id) ON DELETE CASCADE,
    severity TEXT,
    estimated_damage NUMERIC,
    coverage_percentage NUMERIC,
    estimated_payout NUMERIC,
    breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create repair_shops table
CREATE TABLE IF NOT EXISTS repair_shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id TEXT REFERENCES claims(claim_id) ON DELETE CASCADE,
    name TEXT,
    specialty TEXT,
    address TEXT,
    phone TEXT,
    rating NUMERIC,
    price_range TEXT,
    estimated_cost NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id TEXT REFERENCES claims(claim_id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_claim_id ON claims(claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_estimates_claim_id ON financial_estimates(claim_id);
CREATE INDEX IF NOT EXISTS idx_repair_shops_claim_id ON repair_shops(claim_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_claim_id ON chat_messages(claim_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for claims table
DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can modify these as needed)
-- Allow all operations for now (adjust based on your security requirements)
CREATE POLICY "Allow all for authenticated users" ON claims
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON financial_estimates
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON repair_shops
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON chat_messages
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert some sample data (optional, for testing)
-- You can uncomment this to add test data

/*
INSERT INTO claims (claim_id, claim_number, incident_type, incident_date, incident_location, description, status, estimated_amount, claimant_name, claimant_contact)
VALUES
    ('C-2025-TEST001', 'CLM-001', 'Car Accident', '2025-01-15', '123 Main St, Springfield', 'Rear-end collision at intersection', 'Processing', 5000.00, 'John Doe', 'john.doe@email.com'),
    ('C-2025-TEST002', 'CLM-002', 'Home Damage', '2025-01-20', '456 Oak Ave, Riverside', 'Water damage from burst pipe', 'Open', 3500.00, 'Jane Smith', 'jane.smith@email.com');
*/
