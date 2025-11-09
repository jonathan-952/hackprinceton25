"""
MCP Tools Integration
Wraps the email agent MCP tools for use in the backend
"""
import sys
import os
from pathlib import Path

# Add document_mcp directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'document_mcp'))

import pdfplumber
from openai import OpenAI
from dotenv import load_dotenv
import io
import base64

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")


def parse_pdf_from_bytes(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF bytes using pdfplumber

    Args:
        pdf_bytes: PDF file as bytes

    Returns:
        Extracted text from all pages
    """
    text = ''
    pdf_file = io.BytesIO(pdf_bytes)
    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


def parse_pdf_from_base64(file_data: str) -> str:
    """
    Extract text from base64-encoded PDF

    Args:
        file_data: Base64 encoded PDF data

    Returns:
        Extracted text from PDF
    """
    pdf_bytes = base64.b64decode(file_data)
    return parse_pdf_from_bytes(pdf_bytes)


def summarize_claim(claim_text: str) -> str:
    """
    Generate a summary of an insurance claim using OpenAI GPT.

    Args:
        claim_text: The full text of the insurance claim

    Returns:
        AI-generated summary of the claim
    """
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")

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
