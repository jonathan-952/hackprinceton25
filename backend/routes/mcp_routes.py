"""
MCP Document Processing Routes
Direct integration with document_mcp emailagent tools
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
import sys
from pathlib import Path
import tempfile
import pdfplumber
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

router = APIRouter()


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
async def process_document_with_mcp(file: UploadFile = File(...)):
    """
    Process document using MCP emailagent tools

    This endpoint:
    1. Saves the uploaded file temporarily
    2. Uses parse_pdf to extract text
    3. Uses summarize_claim to generate AI summary
    4. Returns the parsed text and summary
    """
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        try:
            # Step 1: Parse PDF using MCP tool logic
            print(f"Parsing PDF: {file.filename}")
            parsed_text = parse_pdf_file(tmp_file_path)

            # Step 2: Summarize claim using MCP tool logic
            print("Generating summary with OpenAI...")
            summary = summarize_claim_text(parsed_text)

            return {
                "success": True,
                "filename": file.filename,
                "parsed_text": parsed_text,
                "summary": summary,
                "text_length": len(parsed_text)
            }

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

        api_key = os.getenv("OPENAI_API_KEY")
        api_key_set = bool(api_key)

        return {
            "status": "healthy",
            "mcp_tools_available": True,
            "tools": ["parse_pdf", "summarize_claim"],
            "openai_api_key_set": api_key_set
        }
    except Exception as e:
        return {
            "status": "error",
            "mcp_tools_available": False,
            "error": str(e)
        }
