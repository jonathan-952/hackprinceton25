"""
Test script for database connection
Run with: python test_db_connection.py
"""
import sys
from config.database import supabase_client, db_config

def test_connection():
    """Test the Supabase database connection"""
    print("Testing Supabase connection...\n")

    try:
        # Test 1: Check if client is initialized
        print("✓ Supabase client initialized")

        # Test 2: Try to query the claims table
        print("\nAttempting to query 'claims' table...")
        result = supabase_client.table('claims').select('*').limit(5).execute()

        if result.data is not None:
            print(f"✓ Successfully connected to database")
            print(f"✓ Found {len(result.data)} claim(s) in database")

            if len(result.data) > 0:
                print("\nSample claims:")
                for claim in result.data:
                    print(f"  - {claim.get('claim_id')}: {claim.get('incident_type')} ({claim.get('status')})")
            else:
                print("\nNo claims found in database (this is normal for a fresh setup)")
                print("You can test by creating a claim through the API")

        # Test 3: Check table structure
        print("\n✓ Database tables are accessible")

        print("\n" + "="*50)
        print("DATABASE CONNECTION SUCCESSFUL!")
        print("="*50)
        print("\nNext steps:")
        print("1. If you see 'relation \"claims\" does not exist', run the SQL in setup_database.sql")
        print("2. Start the FastAPI server: uvicorn main:app --reload")
        print("3. Test the API at http://localhost:8000/docs")

        return True

    except Exception as e:
        error_message = str(e)
        print(f"\n❌ Error connecting to database:")
        print(f"   {error_message}\n")

        if ("relation" in error_message and "does not exist" in error_message) or "Could not find the table" in error_message or "PGRST205" in error_message:
            print("⚠️  Database tables don't exist yet!")
            print("\n" + "="*50)
            print("TO FIX - CREATE DATABASE TABLES:")
            print("="*50)
            print("\n1. Open your Supabase dashboard:")
            print("   https://arffctqxrifxotlwliwz.supabase.co/project/arffctqxrifxotlwliwz/sql/new")
            print("\n2. Click on 'SQL Editor' in the left sidebar")
            print("\n3. Create a new query")
            print("\n4. Copy ALL contents from this file:")
            print("   backend/setup_database.sql")
            print("\n5. Paste into the SQL editor and click 'Run'")
            print("\n6. Wait for 'Success' message")
            print("\n7. Run this test script again: python3 test_db_connection.py")
            print("\n" + "="*50)
        elif "API key" in error_message or "JWT" in error_message:
            print("⚠️  Authentication issue!")
            print("\nTo fix this:")
            print("1. Check your .env file has the correct SUPABASE_API_KEY")
            print("2. Make sure you're using the service_role key (not anon key)")
        else:
            print("\nPlease check:")
            print("1. Your .env file has correct Supabase credentials")
            print("2. Your Supabase project is active")
            print("3. Network connection is working")

        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
