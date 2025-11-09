"""
Database Configuration - Supabase Integration
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables
load_dotenv()

class DatabaseConfig:
    """Supabase database configuration and client management"""

    _instance: Optional['DatabaseConfig'] = None
    _client: Optional[Client] = None

    def __new__(cls):
        """Singleton pattern to ensure single database connection"""
        if cls._instance is None:
            cls._instance = super(DatabaseConfig, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize Supabase client"""
        if self._client is None:
            self._initialize_client()

    def _initialize_client(self):
        """Create Supabase client from environment variables"""
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_API_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError(
                "Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL "
                "and SUPABASE_API_KEY in your .env file"
            )

        try:
            self._client = create_client(supabase_url, supabase_key)
            print(f"✓ Connected to Supabase: {supabase_url}")
        except Exception as e:
            raise ConnectionError(f"Failed to connect to Supabase: {str(e)}")

    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client

    def test_connection(self) -> bool:
        """Test the database connection"""
        try:
            # Try to query a simple table or perform a basic operation
            self.client.table('claims').select("count", count='exact').execute()
            return True
        except Exception as e:
            print(f"Database connection test failed: {str(e)}")
            return False


# Global database instance
db_config = DatabaseConfig()
supabase_client = db_config.client


# Database schema setup
def initialize_database_schema():
    """
    Initialize database tables if they don't exist.
    Note: In Supabase, you should create these tables via the Supabase dashboard or SQL editor.

    Required tables:

    1. claims:
       - id (uuid, primary key)
       - claim_id (text, unique)
       - claim_number (text)
       - policy_number (text)
       - incident_type (text)
       - incident_date (date)
       - incident_location (text)
       - description (text)
       - status (text)
       - estimated_amount (numeric)
       - claimant_name (text)
       - claimant_contact (text)
       - items_damaged (jsonb)
       - supporting_documents (jsonb)
       - created_at (timestamp)
       - updated_at (timestamp)

    2. financial_estimates:
       - id (uuid, primary key)
       - claim_id (text, foreign key)
       - severity (text)
       - estimated_damage (numeric)
       - coverage_percentage (numeric)
       - estimated_payout (numeric)
       - breakdown (jsonb)
       - created_at (timestamp)

    3. repair_shops:
       - id (uuid, primary key)
       - claim_id (text, foreign key)
       - name (text)
       - specialty (text)
       - address (text)
       - phone (text)
       - rating (numeric)
       - price_range (text)
       - estimated_cost (numeric)
       - created_at (timestamp)
    """
    print("""
    Database schema should be created in Supabase dashboard.
    Please run the following SQL in your Supabase SQL editor:

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
        status TEXT DEFAULT 'Open',
        estimated_amount NUMERIC,
        claimant_name TEXT,
        claimant_contact TEXT,
        items_damaged JSONB,
        supporting_documents JSONB,
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

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_claims_claim_id ON claims(claim_id);
    CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
    CREATE INDEX IF NOT EXISTS idx_financial_estimates_claim_id ON financial_estimates(claim_id);
    CREATE INDEX IF NOT EXISTS idx_repair_shops_claim_id ON repair_shops(claim_id);
    """)
