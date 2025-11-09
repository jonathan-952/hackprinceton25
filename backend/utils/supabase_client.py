"""
Supabase client for ClaimPilot backend
"""
import os
from typing import Optional, List, Dict, Any
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')

# Initialize Supabase client
supabase: Optional[Client] = None

# Temporarily disable Supabase due to access denied errors
# Set to True to re-enable when Supabase access is fixed
SUPABASE_ENABLED = False

if SUPABASE_ENABLED and SUPABASE_URL and SUPABASE_KEY:
    try:
        # Create client with service_role key (bypasses RLS)
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
        print(f"   URL: {SUPABASE_URL}")
        print(f"   Key type: {'service_role' if 'service_role' in SUPABASE_KEY else 'anon'}")
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase client: {e}")
        print(f"   Error type: {type(e).__name__}")
        print("Falling back to in-memory storage")
        supabase = None
else:
    print("⚠️ Supabase credentials not found. Using in-memory storage.")


def save_claim_to_db(claim_data: Dict[str, Any]) -> bool:
    """
    Save a claim to Supabase database

    Args:
        claim_data: Claim data dictionary

    Returns:
        True if successful, False otherwise
    """
    if not supabase:
        return False

    try:
        # Prepare data for Supabase
        db_data = {
            'claim_id': claim_data.get('claim_id'),
            'status': claim_data.get('status', 'draft'),
            'incident_data': {
                'type': claim_data.get('incident_type', ''),
                'date': claim_data.get('date', ''),
                'location': claim_data.get('location', ''),
                'description': claim_data.get('damages_description', '')
            },
            'vehicle_data': {},
            'insurance_data': {},
            'damage_data': {
                'description': claim_data.get('damages_description', ''),
                'estimated_damage': claim_data.get('estimated_damage', '')
            },
            'police_report': None,
            'orchestrator_state': {}
        }

        # Insert into database
        result = supabase.table('claims').insert(db_data).execute()
        print(f"✅ Claim {claim_data.get('claim_id')} saved to database")
        return True

    except Exception as e:
        print(f"Error saving claim to database: {e}")
        return False


def get_claim_from_db(claim_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a claim from Supabase database

    Args:
        claim_id: Claim identifier

    Returns:
        Claim data or None
    """
    if not supabase:
        return None

    try:
        result = supabase.table('claims').select('*').eq('claim_id', claim_id).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]

        return None

    except Exception as e:
        print(f"Error retrieving claim {claim_id}: {e}")
        return None


def list_claims_from_db(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List all claims from Supabase database

    Args:
        status: Optional status filter

    Returns:
        List of claims
    """
    if not supabase:
        return []

    try:
        query = supabase.table('claims').select('*')

        if status:
            query = query.eq('status', status)

        result = query.order('created_at', desc=True).execute()

        return result.data if result.data else []

    except Exception as e:
        print(f"Error listing claims: {e}")
        return []


def update_claim_in_db(claim_id: str, updates: Dict[str, Any]) -> bool:
    """
    Update a claim in Supabase database

    Args:
        claim_id: Claim identifier
        updates: Dictionary of fields to update

    Returns:
        True if successful, False otherwise
    """
    if not supabase:
        return False

    try:
        result = supabase.table('claims').update(updates).eq('claim_id', claim_id).execute()
        print(f"✅ Claim {claim_id} updated in database")
        return True

    except Exception as e:
        print(f"Error updating claim {claim_id}: {e}")
        return False


def save_chat_message(claim_id: str, role: str, content: str, metadata: Optional[Dict] = None) -> bool:
    """
    Save a chat message to Supabase database

    Args:
        claim_id: Associated claim ID
        role: Message role (user/assistant/system)
        content: Message content
        metadata: Optional metadata

    Returns:
        True if successful, False otherwise
    """
    if not supabase:
        return False

    try:
        message_data = {
            'claim_id': claim_id,
            'role': role,
            'content': content,
            'metadata': metadata
        }

        result = supabase.table('chat_messages').insert(message_data).execute()
        return True

    except Exception as e:
        print(f"Error saving chat message: {e}")
        return False


def get_chat_messages(claim_id: str) -> List[Dict[str, Any]]:
    """
    Get all chat messages for a claim

    Args:
        claim_id: Claim identifier

    Returns:
        List of chat messages
    """
    if not supabase:
        return []

    try:
        result = supabase.table('chat_messages').select('*').eq('claim_id', claim_id).order('created_at', desc=False).execute()

        return result.data if result.data else []

    except Exception as e:
        print(f"Error retrieving chat messages for {claim_id}: {e}")
        return []
