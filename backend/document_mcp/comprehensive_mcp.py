"""
Comprehensive MCP Server for ClaimPilot AI
Integrates all agent capabilities into MCP tools with Gemini and OpenAI support
"""
import pdfplumber
from fastmcp import FastMCP
from openai import OpenAI
import google.generativeai as genai
from dotenv import load_dotenv
import os
import io
import base64
import json
import re
from typing import Dict, List, Optional
from datetime import datetime

# Load environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")

# Initialize AI clients
openai_client = OpenAI(api_key=openai_api_key) if openai_api_key else None
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# Create MCP server with comprehensive instructions
mcp = FastMCP(
    name="ClaimPilotMCP",
    instructions="""
You are ClaimPilot MCP, an advanced AI insurance claims processing assistant with comprehensive capabilities.

Your job is to:
1. Extract and parse text from uploaded PDF claim documents
2. Summarize claims with key information extraction
3. Estimate financial damage and calculate insurance payouts
4. Find and recommend repair shops based on location and incident type
5. Validate claims for submission compliance
6. Extract structured data from unstructured claim documents
7. Manage multi-file context for comprehensive claim analysis
8. Support both OpenAI and Gemini AI models for flexibility

CAPABILITIES:
- Document Processing: PDF parsing, text extraction, OCR
- AI Analysis: Claim summarization, data extraction, intent detection
- Financial Tools: Damage estimation, deductible calculation, payout estimation
- Shop Finder: Location-based repair shop recommendations with ratings
- Compliance: Validation, PII detection, submission readiness checks
- Multi-Modal: Support for multiple files and context management

Use the registered MCP tools to perform these tasks efficiently.
Respond clearly and professionally, suitable for insurance agents and customers.
"""
)

# Global context storage for multi-file support
file_context = {
    "files": [],
    "claim_data": {},
    "analysis_history": []
}


@mcp.tool()
def parse_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file using pdfplumber.

    Args:
        file_path: Path to the PDF file

    Returns:
        Extracted text content from all pages
    """
    try:
        text = ''
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text.strip()
    except Exception as e:
        return f"Error parsing PDF: {str(e)}"


@mcp.tool()
def parse_pdf_from_bytes(pdf_bytes_b64: str) -> str:
    """
    Extract text from base64-encoded PDF bytes.

    Args:
        pdf_bytes_b64: Base64-encoded PDF data

    Returns:
        Extracted text content
    """
    try:
        pdf_bytes = base64.b64decode(pdf_bytes_b64)
        text = ''
        pdf_file = io.BytesIO(pdf_bytes)
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text.strip()
    except Exception as e:
        return f"Error parsing PDF from bytes: {str(e)}"


@mcp.tool()
def summarize_claim_openai(claim_text: str, max_tokens: int = 250) -> str:
    """
    Generate a concise summary of an insurance claim using OpenAI GPT-4o-mini.

    Args:
        claim_text: The full text of the claim document
        max_tokens: Maximum tokens for the response (default: 250)

    Returns:
        AI-generated claim summary with key details
    """
    if not openai_client:
        return "Error: OpenAI API key not configured"

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert insurance claims analyst. Provide clear, concise summaries."},
                {"role": "user", "content": f"""Analyze this insurance claim and provide a summary including:
- Incident type and date
- Key parties involved
- Damage description
- Claim status (approved/denied/pending)
- Amount potentially owed or estimated damages
- Important deadlines or next steps

Claim text:
{claim_text}"""}
            ],
            max_tokens=max_tokens,
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error generating summary with OpenAI: {str(e)}"


@mcp.tool()
def summarize_claim_gemini(claim_text: str, max_tokens: int = 250) -> str:
    """
    Generate a concise summary of an insurance claim using Google Gemini.

    Args:
        claim_text: The full text of the claim document
        max_tokens: Maximum tokens for the response (default: 250)

    Returns:
        AI-generated claim summary with key details
    """
    if not gemini_api_key:
        return "Error: Gemini API key not configured"

    try:
        model = genai.GenerativeModel('gemini-2.0-flash-exp')

        prompt = f"""Analyze this insurance claim and provide a clear summary including:
- Incident type and date
- Key parties involved
- Damage description
- Claim status (approved/denied/pending)
- Amount potentially owed or estimated damages
- Important deadlines or next steps

Claim text:
{claim_text}"""

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=0.3
            )
        )
        return response.text
    except Exception as e:
        return f"Error generating summary with Gemini: {str(e)}"


@mcp.tool()
def extract_structured_data(claim_text: str, use_gemini: bool = True) -> str:
    """
    Extract structured data from unstructured claim text.

    Args:
        claim_text: The claim document text
        use_gemini: Whether to use Gemini (default) or OpenAI

    Returns:
        JSON string with extracted structured data
    """
    try:
        prompt = f"""Extract structured information from this insurance claim document.

Return a JSON object with these fields (use null for missing data):
- incident_type: Type of incident (e.g., "Car Accident", "Home Damage")
- date: Incident date (YYYY-MM-DD format)
- location: Full address or location description
- claimant_name: Name of person filing claim
- policy_number: Insurance policy number
- damages_description: Brief description of damages
- estimated_amount: Estimated damage cost (number only, no $)
- parties_involved: Array of parties (name, role, contact)
- claim_status: "Open", "Processing", "Approved", "Denied", or "Pending"

Claim text:
{claim_text}

Return ONLY the JSON object, no other text."""

        if use_gemini and gemini_api_key:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=1024,
                    temperature=0.1
                )
            )
            result_text = response.text
        elif openai_client:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a data extraction specialist. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1024,
                temperature=0.1
            )
            result_text = response.choices[0].message.content
        else:
            return json.dumps({"error": "No AI provider configured"})

        # Extract JSON from response
        json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
        if json_match:
            return json_match.group(1)

        # Try to find raw JSON
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json_match.group(0)

        return result_text

    except Exception as e:
        return json.dumps({"error": f"Failed to extract data: {str(e)}"})


@mcp.tool()
def estimate_damage(
    incident_type: str,
    damages_description: str,
    existing_estimate: Optional[str] = None,
    severity: Optional[str] = None
) -> str:
    """
    Estimate damage costs and calculate insurance payout.

    Args:
        incident_type: Type of incident (e.g., "Car Accident", "Home Damage")
        damages_description: Description of damages
        existing_estimate: Existing estimate if available
        severity: Severity level override (minor, moderate, severe)

    Returns:
        JSON string with financial estimate including damage amount, deductible, payout
    """
    try:
        # Damage estimation models
        damage_ranges = {
            "Car Accident": {
                "minor": (500, 2000),
                "moderate": (2000, 8000),
                "severe": (8000, 25000),
                "total_loss": (25000, 100000)
            },
            "Home Damage": {
                "minor": (1000, 5000),
                "moderate": (5000, 15000),
                "severe": (15000, 50000),
                "catastrophic": (50000, 500000)
            },
            "Medical": {
                "minor": (500, 3000),
                "moderate": (3000, 10000),
                "severe": (10000, 50000),
                "critical": (50000, 500000)
            },
            "Property Damage": {
                "minor": (300, 1500),
                "moderate": (1500, 5000),
                "severe": (5000, 20000)
            }
        }

        # Insurance coverage percentages
        coverage_rates = {
            "Car Accident": 0.80,
            "Home Damage": 0.90,
            "Medical": 0.85,
            "Property Damage": 0.75
        }

        # Determine severity if not provided
        if not severity:
            description_lower = damages_description.lower()
            if any(word in description_lower for word in ["total", "destroyed", "severe", "major", "extensive"]):
                severity = "severe"
            elif any(word in description_lower for word in ["moderate", "significant"]):
                severity = "moderate"
            else:
                severity = "minor"

        # Calculate estimate
        if existing_estimate:
            try:
                estimated_damage = float(existing_estimate.replace('$', '').replace(',', ''))
            except:
                estimated_damage = None
        else:
            estimated_damage = None

        if not estimated_damage:
            ranges = damage_ranges.get(incident_type, damage_ranges["Property Damage"])
            if severity in ranges:
                min_val, max_val = ranges[severity]
                estimated_damage = (min_val + max_val) / 2
            else:
                estimated_damage = 3000.0

        # Calculate coverage and payout
        coverage = coverage_rates.get(incident_type, 0.75)
        deductible = round(estimated_damage * (1 - coverage), 2)
        payout = round(estimated_damage - deductible, 2)

        # Generate breakdown
        if incident_type == "Car Accident":
            breakdown = {
                "parts": round(estimated_damage * 0.60, 2),
                "labor": round(estimated_damage * 0.30, 2),
                "paint_and_materials": round(estimated_damage * 0.10, 2)
            }
        elif incident_type == "Home Damage":
            breakdown = {
                "materials": round(estimated_damage * 0.50, 2),
                "labor": round(estimated_damage * 0.40, 2),
                "permits_and_fees": round(estimated_damage * 0.10, 2)
            }
        else:
            breakdown = {
                "repair_costs": round(estimated_damage * 0.80, 2),
                "service_fees": round(estimated_damage * 0.20, 2)
            }

        result = {
            "estimated_damage": estimated_damage,
            "insurance_coverage": coverage,
            "coverage_percentage": f"{coverage * 100:.0f}%",
            "deductible": deductible,
            "payout_after_deductible": payout,
            "severity": severity,
            "breakdown": breakdown,
            "summary": f"Total estimated damage: ${estimated_damage:,.2f}. With {coverage * 100:.0f}% coverage, your deductible is ${deductible:,.2f} and insurance will pay ${payout:,.2f}."
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({"error": f"Error estimating damage: {str(e)}"})


@mcp.tool()
def find_repair_shops(
    incident_type: str,
    location: str,
    max_results: int = 3,
    price_preference: Optional[str] = None
) -> str:
    """
    Find and recommend repair shops based on location and incident type.

    Args:
        incident_type: Type of incident
        location: Location to search near
        max_results: Maximum number of shops to return (default: 3)
        price_preference: Price preference ($, $$, $$$)

    Returns:
        JSON string with recommended repair shops
    """
    try:
        # Mock database of repair shops (in production, integrate with Google Maps API)
        shop_database = {
            "Car Accident": [
                {
                    "name": "Princeton AutoFix",
                    "rating": 4.8,
                    "price_level": "$$",
                    "address": "123 Nassau St, Princeton, NJ 08542",
                    "phone": "(609) 555-0100",
                    "specialties": ["Collision Repair", "Paint", "Body Work"],
                    "estimated_wait_time": "2-3 days",
                    "distance": "1.2 mi"
                },
                {
                    "name": "Elite Auto Restoration",
                    "rating": 4.9,
                    "price_level": "$$$",
                    "address": "789 Route 1, Lawrence, NJ 08648",
                    "phone": "(609) 555-0300",
                    "specialties": ["Luxury Cars", "Collision", "Custom Paint"],
                    "estimated_wait_time": "1 week",
                    "distance": "3.5 mi"
                },
                {
                    "name": "QuickFix Auto Center",
                    "rating": 4.3,
                    "price_level": "$",
                    "address": "321 US-1, Lawrenceville, NJ 08648",
                    "phone": "(609) 555-0400",
                    "specialties": ["Quick Repairs", "Insurance Claims", "Rentals"],
                    "estimated_wait_time": "1-2 days",
                    "distance": "2.8 mi"
                }
            ],
            "Home Damage": [
                {
                    "name": "Princeton Home Restoration",
                    "rating": 4.7,
                    "price_level": "$$$",
                    "address": "100 Nassau St, Princeton, NJ 08542",
                    "phone": "(609) 555-1100",
                    "specialties": ["Water Damage", "Fire Restoration", "Mold"],
                    "estimated_wait_time": "1-2 weeks",
                    "distance": "0.8 mi"
                },
                {
                    "name": "Quick Response Restoration",
                    "rating": 4.5,
                    "price_level": "$$",
                    "address": "200 Alexander St, Princeton, NJ 08540",
                    "phone": "(609) 555-1200",
                    "specialties": ["Emergency Service", "24/7", "Insurance"],
                    "estimated_wait_time": "Same day",
                    "distance": "2.1 mi"
                }
            ]
        }

        # Get relevant shops
        shops = shop_database.get(incident_type, shop_database.get("Car Accident", []))

        # Filter by price preference
        if price_preference:
            shops = [s for s in shops if s["price_level"] == price_preference]

        # Limit results
        shops = shops[:max_results]

        result = {
            "location": location,
            "incident_type": incident_type,
            "recommended_shops": shops,
            "count": len(shops),
            "summary": f"Found {len(shops)} highly-rated repair shops near {location}."
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({"error": f"Error finding shops: {str(e)}"})


@mcp.tool()
def validate_claim_compliance(
    claim_data: str,
    check_pii: bool = True
) -> str:
    """
    Validate claim for submission compliance.

    Args:
        claim_data: JSON string with claim data
        check_pii: Whether to check for PII (default: True)

    Returns:
        JSON string with validation results and recommendations
    """
    try:
        # Parse claim data
        try:
            claim = json.loads(claim_data)
        except:
            claim = {"raw_text": claim_data}

        # Required fields
        required_fields = ["incident_type", "date", "location", "damages_description"]

        # Check required fields
        missing_fields = []
        present_fields = []
        for field in required_fields:
            if field in claim and claim[field]:
                present_fields.append(field)
            else:
                missing_fields.append(field)

        # Check data quality
        quality_score = 0.0
        quality_checks = []

        if claim.get("parties_involved"):
            quality_score += 0.25
            quality_checks.append({"check": "parties_present", "passed": True})
        else:
            quality_checks.append({"check": "parties_present", "passed": False})

        if claim.get("estimated_damage"):
            quality_score += 0.25
            quality_checks.append({"check": "damage_estimate", "passed": True})
        else:
            quality_checks.append({"check": "damage_estimate", "passed": False})

        desc_length = len(claim.get("damages_description", ""))
        if desc_length > 50:
            quality_score += 0.25
            quality_checks.append({"check": "detailed_description", "passed": True})
        else:
            quality_checks.append({"check": "detailed_description", "passed": False})

        if claim.get("location") and "not specified" not in claim.get("location", "").lower():
            quality_score += 0.25
            quality_checks.append({"check": "specific_location", "passed": True})
        else:
            quality_checks.append({"check": "specific_location", "passed": False})

        # Check for PII
        pii_found = []
        if check_pii:
            text_to_check = str(claim)
            pii_patterns = {
                "SSN": r'\b\d{3}-\d{2}-\d{4}\b',
                "Credit Card": r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
                "Email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            }

            for pii_type, pattern in pii_patterns.items():
                matches = re.findall(pattern, text_to_check)
                if matches:
                    pii_found.append({"type": pii_type, "count": len(matches)})

        # Determine submission readiness
        all_required = len(missing_fields) == 0
        no_pii = len(pii_found) == 0
        good_quality = quality_score >= 0.6
        submission_ready = all_required and no_pii and good_quality

        # Generate recommendations
        recommendations = []
        if missing_fields:
            recommendations.append(f"Add missing fields: {', '.join(missing_fields)}")
        if not good_quality:
            recommendations.append("Improve data quality by adding more details")
        if pii_found:
            recommendations.append(f"Redact PII found: {', '.join([p['type'] for p in pii_found])}")
        if not recommendations:
            recommendations.append("Claim is ready for submission!")

        result = {
            "submission_ready": submission_ready,
            "required_fields": {
                "all_present": all_required,
                "missing": missing_fields,
                "present": present_fields
            },
            "quality_score": quality_score,
            "quality_grade": "ABCDF"[min(4, int((1 - quality_score) * 5))],
            "quality_checks": quality_checks,
            "pii_check": {
                "found": pii_found,
                "clean": no_pii
            },
            "recommendations": recommendations,
            "summary": "✅ Ready for submission!" if submission_ready else "⚠️ Please address issues before submitting"
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({"error": f"Error validating claim: {str(e)}"})


@mcp.tool()
def add_file_to_context(file_path: str, file_type: str = "pdf") -> str:
    """
    Add a file to the multi-file context for comprehensive analysis.

    Args:
        file_path: Path to the file
        file_type: Type of file (pdf, txt, image)

    Returns:
        Success message with file info
    """
    try:
        # Parse file based on type
        if file_type.lower() == "pdf":
            content = parse_pdf(file_path)
        else:
            with open(file_path, 'r') as f:
                content = f.read()

        # Add to context
        file_info = {
            "path": file_path,
            "type": file_type,
            "content": content,
            "added_at": datetime.now().isoformat()
        }

        file_context["files"].append(file_info)

        return json.dumps({
            "success": True,
            "message": f"Added {file_type} file to context",
            "total_files": len(file_context["files"]),
            "file_info": {
                "path": file_path,
                "type": file_type,
                "content_length": len(content)
            }
        }, indent=2)

    except Exception as e:
        return json.dumps({"success": False, "error": f"Error adding file: {str(e)}"})


@mcp.tool()
def get_context_summary() -> str:
    """
    Get a summary of all files in the current context.

    Returns:
        JSON string with context information
    """
    try:
        files_summary = []
        for file in file_context["files"]:
            files_summary.append({
                "path": file["path"],
                "type": file["type"],
                "content_length": len(file["content"]),
                "added_at": file["added_at"]
            })

        result = {
            "total_files": len(file_context["files"]),
            "files": files_summary,
            "claim_data": file_context.get("claim_data", {}),
            "analysis_count": len(file_context.get("analysis_history", []))
        }

        return json.dumps(result, indent=2)

    except Exception as e:
        return json.dumps({"error": f"Error getting context: {str(e)}"})


@mcp.tool()
def clear_context() -> str:
    """
    Clear all files and data from the context.

    Returns:
        Success message
    """
    global file_context
    file_context = {
        "files": [],
        "claim_data": {},
        "analysis_history": []
    }
    return json.dumps({"success": True, "message": "Context cleared"})


@mcp.tool()
def chat_with_context(message: str, use_gemini: bool = True) -> str:
    """
    Chat with the AI assistant using the current file context.

    Args:
        message: User message
        use_gemini: Whether to use Gemini (default) or OpenAI

    Returns:
        AI response considering all files in context
    """
    try:
        # Build context from files
        context_text = "AVAILABLE CONTEXT:\n\n"
        for idx, file in enumerate(file_context["files"], 1):
            context_text += f"File {idx} ({file['type']}): {file['path']}\n"
            context_text += f"{file['content'][:500]}...\n\n"

        full_prompt = f"{context_text}\n\nUser message: {message}"

        if use_gemini and gemini_api_key:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            response = model.generate_content(
                full_prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=1024,
                    temperature=0.7
                )
            )
            return response.text
        elif openai_client:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are ClaimPilot AI, a helpful insurance claims assistant."},
                    {"role": "user", "content": full_prompt}
                ],
                max_tokens=1024,
                temperature=0.7
            )
            return response.choices[0].message.content
        else:
            return "Error: No AI provider configured"

    except Exception as e:
        return f"Error in chat: {str(e)}"


@mcp.tool()
def generate_insurance_email(
    claim_summary: str,
    claim_data: Optional[str] = None,
    use_gemini: bool = True
) -> str:
    """
    Generate a professional email template to send to insurance company based on claim summary.

    Args:
        claim_summary: AI-generated summary of the claim
        claim_data: Optional JSON string with structured claim data
        use_gemini: Whether to use Gemini (default) or OpenAI

    Returns:
        JSON string with email template (subject, body, recipients)
    """
    try:
        # Parse claim data if provided
        structured_data = {}
        if claim_data:
            try:
                structured_data = json.loads(claim_data)
            except:
                pass

        # Build prompt for email generation
        prompt = f"""Generate a professional email template to send to an insurance company regarding a claim.

CLAIM SUMMARY:
{claim_summary}

CLAIM DETAILS:
{json.dumps(structured_data, indent=2) if structured_data else "No additional details provided"}

Generate an email with:
1. Professional subject line
2. Formal greeting
3. Clear explanation of the incident
4. Key details (date, location, damages, parties involved)
5. Specific request for action (claim processing, damage assessment, etc.)
6. Professional closing
7. Placeholder for claimant signature

Return ONLY a JSON object with this structure:
{{
  "subject": "Subject line here",
  "to": "claims@insurance.com",
  "cc": "",
  "body": "Full email body with proper formatting using \\n for line breaks",
  "attachments_note": "Please attach: [list required documents]"
}}

Make the email professional, concise, and include all relevant claim information."""

        # Generate email using selected AI provider
        if use_gemini and gemini_api_key:
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=1024,
                    temperature=0.3
                )
            )
            result_text = response.text
        elif openai_client:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional insurance claims specialist. Generate formal, professional email templates."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1024,
                temperature=0.3
            )
            result_text = response.choices[0].message.content
        else:
            return json.dumps({"error": "No AI provider configured"})

        # Extract JSON from response
        json_match = re.search(r'```json\n(.*?)\n```', result_text, re.DOTALL)
        if json_match:
            return json_match.group(1)

        # Try to find raw JSON
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json_match.group(0)

        # If no JSON found, create a simple template
        return json.dumps({
            "subject": "Insurance Claim Submission",
            "to": "claims@insurance.com",
            "cc": "",
            "body": f"Dear Insurance Claims Department,\n\n{claim_summary}\n\nPlease process this claim at your earliest convenience.\n\nSincerely,\n[Your Name]",
            "attachments_note": "Please attach all relevant documents"
        }, indent=2)

    except Exception as e:
        return json.dumps({"error": f"Failed to generate email: {str(e)}"})


if __name__ == "__main__":
    # Run MCP server with stdio transport
    mcp.run(transport="stdio")
