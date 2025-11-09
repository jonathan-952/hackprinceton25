"""
ClaimPilot AI - FastAPI Backend

Multi-agent orchestration system for insurance claim processing
"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import base64
from datetime import datetime

from orchestrator.coordinator import orchestrator
from agents.claimpilot_agent import claimpilot_agent
from agents.fintrack_agent import fintrack_agent
from agents.shopfinder_agent import shopfinder_agent
from agents.claim_drafting_agent import claim_drafting_agent
from agents.compliance_agent import compliance_agent
from utils.data_models import (
    UserMessage, ChatResponse, Claim, ClaimStatus
)
from routes.mcp_routes import router as mcp_router

# Initialize FastAPI app
app = FastAPI(
    title="ClaimPilot AI",
    description="Multi-agent orchestration system for insurance claims",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include MCP routes
app.include_router(mcp_router)


# ==================== Main Endpoints ====================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "ClaimPilot AI",
        "version": "1.0.0",
        "description": "Multi-agent insurance claim processing system",
        "agents": ["ClaimPilot", "FinTrack", "ShopFinder", "ClaimDrafting", "ComplianceCheck"],
        "endpoints": {
            "chat": "/api/chat",
            "upload": "/api/upload",
            "claims": "/api/claims",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "agents": {
            "claimpilot": "active",
            "fintrack": "active",
            "shopfinder": "active",
            "claim_drafting": "active",
            "compliance": "active"
        }
    }


# ==================== Chat & Processing Endpoints ====================

@app.post("/api/chat", response_model=ChatResponse)
async def chat(user_message: UserMessage):
    """
    Main chat endpoint - processes user messages and coordinates agents

    Args:
        user_message: UserMessage with text, optional file data, and context

    Returns:
        ChatResponse with agent results
    """
    try:
        response = orchestrator.process_message(user_message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    message: Optional[str] = Form(None)
):
    """
    Upload and process a document (PDF, TXT)

    Args:
        file: Uploaded file
        message: Optional user message

    Returns:
        ChatResponse with claim data
    """
    try:
        # Read file content
        content = await file.read()
        encoded_content = base64.b64encode(content).decode('utf-8')

        # Create user message
        user_message = UserMessage(
            message=message or "Process this document",
            file_data=encoded_content,
            file_name=file.filename
        )

        # Process with orchestrator
        response = orchestrator.process_message(user_message)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing upload: {str(e)}")


@app.post("/api/process-claim")
async def process_claim(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None)
):
    """
    Process a claim from file or text

    Args:
        file: PDF or text file (optional)
        text: Raw text input (optional)

    Returns:
        Processed claim data
    """
    try:
        if file:
            content = await file.read()
            encoded_content = base64.b64encode(content).decode('utf-8')
            result = claimpilot_agent.process_document(
                file_data=encoded_content,
                file_name=file.filename
            )
        elif text:
            result = claimpilot_agent.process_document(raw_text=text)
        else:
            raise HTTPException(status_code=400, detail="Either file or text must be provided")

        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)

        return result.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Claim Management Endpoints ====================

@app.get("/api/claims")
async def list_claims(status: Optional[str] = None):
    """
    List all claims, optionally filtered by status

    Args:
        status: Filter by status (Open, Processing, Closed)

    Returns:
        List of claims
    """
    try:
        claim_status = ClaimStatus(status) if status else None
        claims = claimpilot_agent.list_claims(status=claim_status)
        return {
            "count": len(claims),
            "claims": [claim.model_dump() for claim in claims]
        }
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/claims/{claim_id}")
async def get_claim(claim_id: str):
    """
    Get a specific claim by ID

    Args:
        claim_id: Claim identifier

    Returns:
        Claim data
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    return claim.model_dump()


@app.put("/api/claims/{claim_id}/status")
async def update_claim_status(claim_id: str, status: str):
    """
    Update claim status

    Args:
        claim_id: Claim identifier
        status: New status

    Returns:
        Updated claim
    """
    try:
        claim_status = ClaimStatus(status)
        result = claimpilot_agent.update_claim_status(claim_id, claim_status)

        if not result.success:
            raise HTTPException(status_code=404, detail=result.message)

        return result.data
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/claims/{claim_id}/analysis")
async def analyze_claim(claim_id: str):
    """
    Get detailed analysis of a claim

    Args:
        claim_id: Claim identifier

    Returns:
        Claim analysis
    """
    result = claimpilot_agent.analyze_claim(claim_id)

    if not result.success:
        raise HTTPException(status_code=404, detail=result.message)

    return result.data


# ==================== Financial Estimation Endpoints ====================

@app.post("/api/estimate/{claim_id}")
async def estimate_damage(
    claim_id: str,
    severity: Optional[str] = None,
    coverage_override: Optional[float] = None
):
    """
    Estimate damage and calculate payout for a claim

    Args:
        claim_id: Claim identifier
        severity: Severity level override
        coverage_override: Custom coverage percentage

    Returns:
        Financial estimate
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    result = fintrack_agent.estimate_damage(
        claim,
        severity=severity,
        coverage_override=coverage_override
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result.data


@app.post("/api/compare-estimates/{claim_id}")
async def compare_estimates(claim_id: str, severities: list[str]):
    """
    Compare estimates across different severity levels

    Args:
        claim_id: Claim identifier
        severities: List of severity levels to compare

    Returns:
        Comparison data
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    result = fintrack_agent.compare_estimates(claim, severities)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result.data


# ==================== Shop Finder Endpoints ====================

@app.get("/api/shops/{claim_id}")
async def find_shops(
    claim_id: str,
    max_results: int = 3,
    price_preference: Optional[str] = None
):
    """
    Find recommended repair shops for a claim

    Args:
        claim_id: Claim identifier
        max_results: Maximum number of shops to return
        price_preference: Price level preference ($, $$, $$$)

    Returns:
        Shop recommendations
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    result = shopfinder_agent.find_shops(
        claim,
        max_results=max_results,
        price_preference=price_preference
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result.data


@app.get("/api/shops/{claim_id}/specialty/{specialty}")
async def find_shops_by_specialty(
    claim_id: str,
    specialty: str,
    max_results: int = 3
):
    """
    Find shops with a specific specialty

    Args:
        claim_id: Claim identifier
        specialty: Specialty to filter by
        max_results: Maximum number of results

    Returns:
        Filtered shop recommendations
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    result = shopfinder_agent.filter_by_specialty(claim, specialty, max_results)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result.data


# ==================== Conversation Endpoints ====================

@app.get("/api/conversation/history")
async def get_conversation_history():
    """
    Get conversation history

    Returns:
        List of conversation messages
    """
    return {
        "history": orchestrator.get_conversation_history()
    }


@app.post("/api/conversation/clear")
async def clear_conversation():
    """
    Clear conversation history

    Returns:
        Success message
    """
    orchestrator.clear_conversation()
    return {"message": "Conversation history cleared"}


# ==================== Agent Status & Workflow Endpoints ====================

@app.get("/api/claims/{claim_id}/agent-status")
async def get_agent_status(claim_id: str):
    """
    Get agent status for a specific claim

    Args:
        claim_id: Claim identifier

    Returns:
        Agent status dictionary
    """
    status = orchestrator.get_agent_status(claim_id)
    return {
        "claim_id": claim_id,
        "agent_status": status
    }


@app.post("/api/process-full-claim")
async def process_full_claim(
    file: UploadFile = File(...),
    message: Optional[str] = Form(None)
):
    """
    Process a full claim workflow with all agents

    Args:
        file: Uploaded document
        message: Optional message

    Returns:
        Complete claim processing results
    """
    try:
        # Read file content
        content = await file.read()
        encoded_content = base64.b64encode(content).decode('utf-8')

        # Create user message
        user_message = UserMessage(
            message=message or "Process full claim workflow",
            file_data=encoded_content,
            file_name=file.filename
        )

        # Process with full workflow
        response = orchestrator.process_full_claim(user_message)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing claim: {str(e)}")


@app.post("/api/claims/{claim_id}/draft")
async def generate_claim_draft(claim_id: str):
    """
    Generate claim draft document

    Args:
        claim_id: Claim identifier

    Returns:
        Claim draft HTML
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    result = claim_drafting_agent.generate_draft(claim)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    orchestrator.update_agent_status(claim_id, "ClaimDrafting", "Complete")

    return result.data


@app.post("/api/claims/{claim_id}/compliance-check")
async def run_compliance_check(claim_id: str):
    """
    Run compliance check on a claim

    Args:
        claim_id: Claim identifier

    Returns:
        Compliance check results
    """
    claim = claimpilot_agent.get_claim(claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail=f"Claim {claim_id} not found")

    result = compliance_agent.validate_claim(claim)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    orchestrator.update_agent_status(claim_id, "ComplianceCheck", "Complete")

    return result.data


# ==================== System Endpoints ====================

@app.get("/api/stats")
async def get_stats():
    """
    Get system statistics

    Returns:
        System stats
    """
    claims = claimpilot_agent.list_claims()

    return {
        "total_claims": len(claims),
        "claims_by_status": {
            "open": len([c for c in claims if c.status == ClaimStatus.OPEN]),
            "processing": len([c for c in claims if c.status == ClaimStatus.PROCESSING]),
            "closed": len([c for c in claims if c.status == ClaimStatus.CLOSED]),
        },
        "claims_by_type": {},
        "conversation_length": len(orchestrator.get_conversation_history())
    }


# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
