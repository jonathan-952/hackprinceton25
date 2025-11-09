"""
MCP Document Processing Routes
Direct integration with document_mcp comprehensive MCP tools
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, Callable, Any
import sys
from pathlib import Path
import tempfile
import pdfplumber
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# Load environment
load_dotenv()

router = APIRouter()

# Add comprehensive MCP to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'document_mcp'))

# Import comprehensive MCP functions
MCP_AVAILABLE = False
parse_pdf: Optional[Callable[[str], str]] = None
summarize_claim_openai: Optional[Callable[[str, int], str]] = None
summarize_claim_gemini: Optional[Callable[[str, int], str]] = None
extract_structured_data: Optional[Callable[[str, bool], str]] = None
estimate_damage: Optional[Callable[..., str]] = None
find_repair_shops: Optional[Callable[..., str]] = None
validate_claim_compliance: Optional[Callable[[str, bool], str]] = None

try:
    from comprehensive_mcp import (
        parse_pdf as _parse_pdf,
        summarize_claim_openai as _summarize_openai,
        summarize_claim_gemini as _summarize_gemini,
        extract_structured_data as _extract_data,
        estimate_damage as _estimate_damage,
        find_repair_shops as _find_shops,
        validate_claim_compliance as _validate_compliance
    )
    parse_pdf = _parse_pdf
    summarize_claim_openai = _summarize_openai
    summarize_claim_gemini = _summarize_gemini
    extract_structured_data = _extract_data
    estimate_damage = _estimate_damage
    find_repair_shops = _find_shops
    validate_claim_compliance = _validate_compliance
    MCP_AVAILABLE = True
except Exception as e:
    print(f"Warning: Could not import comprehensive MCP: {e}")
    MCP_AVAILABLE = False


class ProcessDocumentRequest(BaseModel):
    use_gemini: bool = False
    extract_data: bool = True
    estimate_damages: bool = False


def parse_pdf_file(file_path: str) -> str:
    """Extract text from PDF using pdfplumber (same as MCP tool)"""
    text = ''
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
    return text


def summarize_claim_text(claim_text: str) -> str:
    """Generate claim summary using OpenAI (same as MCP tool)"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found")

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an insurance claims summarization assistant."},
            {"role": "user", "content": f"Summarize the following claim in a few sentences, extract important information such as what may be owed, if the claim was denied, etc.:\n\n{claim_text}"}
        ],
        max_tokens=200
    )
    return response.choices[0].message.content


@router.post("/api/mcp-process-document")
async def process_document_with_mcp(
    file: UploadFile = File(...),
    use_gemini: bool = False,
    extract_data: bool = True
):
    """
    Process document using comprehensive MCP tools

    This endpoint:
    1. Saves the uploaded file temporarily
    2. Uses parse_pdf to extract text
    3. Uses summarize_claim (OpenAI or Gemini) to generate AI summary
    4. Optionally extracts structured data
    5. Returns comprehensive analysis
    """
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        try:
            # Step 1: Parse PDF using comprehensive MCP
            print(f"Parsing PDF: {file.filename}")
            if MCP_AVAILABLE:
                parsed_text = parse_pdf(tmp_file_path)
            else:
                parsed_text = parse_pdf_file(tmp_file_path)

            # Step 2: Summarize claim
            print(f"Generating summary with {'Gemini' if use_gemini else 'OpenAI'}...")
            if MCP_AVAILABLE and use_gemini:
                summary = summarize_claim_gemini(parsed_text)
            elif MCP_AVAILABLE:
                summary = summarize_claim_openai(parsed_text)
            else:
                summary = summarize_claim_text(parsed_text)

            result = {
                "success": True,
                "filename": file.filename,
                "parsed_text": parsed_text,
                "summary": summary,
                "text_length": len(parsed_text),
                "ai_provider": "gemini" if use_gemini else "openai"
            }

            # Step 3: Extract structured data if requested
            if extract_data and MCP_AVAILABLE:
                print("Extracting structured data...")
                structured_data_str = extract_structured_data(parsed_text, use_gemini=use_gemini)
                try:
                    structured_data = json.loads(structured_data_str)
                    result["structured_data"] = structured_data
                except:
                    result["structured_data"] = {"raw": structured_data_str}

            return result

        finally:
            # Clean up temp file
            os.unlink(tmp_file_path)

    except Exception as e:
        print(f"Error processing document: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )


@router.get("/api/mcp-health")
async def mcp_health_check():
    """Check if MCP tools are available"""
    try:
        # Check if required libraries are available
        import pdfplumber
        from openai import OpenAI

        openai_key = os.getenv("OPENAI_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")

        tools = [
            "parse_pdf",
            "summarize_claim_openai",
            "summarize_claim_gemini",
            "extract_structured_data",
            "estimate_damage",
            "find_repair_shops",
            "validate_claim_compliance",
            "multi_file_context"
        ] if MCP_AVAILABLE else ["parse_pdf", "summarize_claim"]

        return {
            "status": "healthy",
            "mcp_tools_available": MCP_AVAILABLE,
            "comprehensive_mcp": MCP_AVAILABLE,
            "tools": tools,
            "openai_api_key_set": bool(openai_key),
            "gemini_api_key_set": bool(gemini_key)
        }
    except Exception as e:
        return {
            "status": "error",
            "mcp_tools_available": False,
            "error": str(e)
        }


@router.post("/api/mcp-estimate-damage")
async def mcp_estimate_damage(
    incident_type: str,
    damages_description: str,
    existing_estimate: Optional[str] = None,
    severity: Optional[str] = None
):
    """Estimate damage costs using MCP financial tools"""
    if not MCP_AVAILABLE or estimate_damage is None:
        raise HTTPException(status_code=503, detail="MCP tools not available")

    try:
        result_str = estimate_damage(
            incident_type=incident_type,
            damages_description=damages_description,
            existing_estimate=existing_estimate,
            severity=severity
        )
        result = json.loads(result_str)
        return {"success": True, "estimate": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error estimating damage: {str(e)}")


@router.post("/api/mcp-find-shops")
async def mcp_find_shops(
    incident_type: str,
    location: str,
    max_results: int = 3,
    price_preference: Optional[str] = None
):
    """Find repair shops using MCP shop finder tools"""
    if not MCP_AVAILABLE or find_repair_shops is None:
        raise HTTPException(status_code=503, detail="MCP tools not available")

    try:
        result_str = find_repair_shops(
            incident_type=incident_type,
            location=location,
            max_results=max_results,
            price_preference=price_preference
        )
        result = json.loads(result_str)
        return {"success": True, "shops": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding shops: {str(e)}")


@router.post("/api/mcp-validate-claim")
async def mcp_validate_claim(claim_data: dict, check_pii: bool = True):
    """Validate claim compliance using MCP validation tools"""
    if not MCP_AVAILABLE or validate_claim_compliance is None:
        raise HTTPException(status_code=503, detail="MCP tools not available")

    try:
        result_str = validate_claim_compliance(
            claim_data=json.dumps(claim_data),
            check_pii=check_pii
        )
        result = json.loads(result_str)
        return {"success": True, "validation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating claim: {str(e)}")
