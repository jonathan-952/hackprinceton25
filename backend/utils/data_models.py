"""
Data models and schemas for ClaimPilot AI
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


class ClaimStatus(str, Enum):
    """Claim status enumeration"""
    OPEN = "Open"
    PROCESSING = "Processing"
    CLOSED = "Closed"
    PENDING_INFO = "Pending Info"


class IncidentType(str, Enum):
    """Types of incidents"""
    CAR_ACCIDENT = "Car Accident"
    HOME_DAMAGE = "Home Damage"
    THEFT = "Theft"
    MEDICAL = "Medical"
    PROPERTY_DAMAGE = "Property Damage"
    OTHER = "Other"


class Party(BaseModel):
    """Information about a party involved in the claim"""
    name: str
    role: str  # e.g., "driver", "owner", "witness"
    contact: Optional[str] = None
    insurance_info: Optional[str] = None


class Claim(BaseModel):
    """Main claim data structure"""
    claim_id: str = Field(..., description="Unique claim identifier")
    incident_type: str
    date: str
    location: str
    parties_involved: List[Party] = []
    damages_description: str
    estimated_damage: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score 0-1")
    status: ClaimStatus = ClaimStatus.OPEN
    summary: str
    raw_text: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class FinancialEstimate(BaseModel):
    """Financial estimation from FinTrack agent"""
    claim_id: str
    estimated_damage: float = Field(..., description="Total damage cost in USD")
    insurance_coverage: float = Field(ge=0.0, le=1.0, description="Coverage percentage (0-1)")
    deductible: float = Field(..., description="Amount to be paid by user")
    payout_after_deductible: float = Field(..., description="Amount paid by insurance")
    breakdown: Optional[dict] = None  # Detailed cost breakdown
    confidence: float = Field(ge=0.0, le=1.0)
    notes: Optional[str] = None


class RepairShop(BaseModel):
    """Repair shop information"""
    name: str
    rating: float = Field(ge=0.0, le=5.0)
    price_level: str  # "$", "$$", "$$$", "$$$$"
    distance: str
    address: Optional[str] = None
    phone: Optional[str] = None
    specialties: List[str] = []
    estimated_wait_time: Optional[str] = None


class ShopRecommendations(BaseModel):
    """Shop recommendations from ShopFinder agent"""
    claim_id: str
    location: str
    incident_type: str
    recommended_shops: List[RepairShop]
    search_radius_miles: float = 10.0
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class AgentResponse(BaseModel):
    """Standard response format for all agents"""
    agent_name: str
    success: bool
    data: dict
    message: str
    confidence: Optional[float] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())


class UserMessage(BaseModel):
    """User message/query"""
    message: str
    claim_id: Optional[str] = None
    file_data: Optional[str] = None  # Base64 encoded file
    file_name: Optional[str] = None
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    """Response to user in chat"""
    message: str
    data: Optional[dict] = None
    claim: Optional[Claim] = None
    financial_estimate: Optional[FinancialEstimate] = None
    shop_recommendations: Optional[ShopRecommendations] = None
    agent_used: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
