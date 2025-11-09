"""
Claim Drafting Agent - Generates formal claim documents

Responsibilities:
- Generate formal claim drafts from collected data
- Create HTML and PDF documents
- Format claim information professionally
- Include all necessary details for submission
"""
from typing import Dict, Optional
from datetime import datetime
from utils.data_models import Claim, AgentResponse


class ClaimDraftingAgent:
    """
    Claim Drafting Agent - Generates formal claim documents

    This agent creates professional claim documents ready for submission.
    """

    def __init__(self):
        self.name = "ClaimDrafting"
        self.version = "1.0.0"

    def generate_draft(self, claim: Claim, financial_data: Optional[Dict] = None) -> AgentResponse:
        """
        Generate a formal claim draft

        Args:
            claim: Claim object
            financial_data: Optional financial estimate data

        Returns:
            AgentResponse with draft HTML/PDF
        """
        try:
            # Generate HTML draft
            html_content = self._generate_html_draft(claim, financial_data)

            # Generate summary
            summary = self._generate_summary(claim)

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "claim_id": claim.claim_id,
                    "html_draft": html_content,
                    "summary": summary,
                    "ready_for_submission": True
                },
                message=f"Claim draft generated for {claim.claim_id}",
                confidence=0.95
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error generating draft: {str(e)}"
            )

    def _generate_html_draft(self, claim: Claim, financial_data: Optional[Dict] = None) -> str:
        """
        Generate HTML claim draft

        Args:
            claim: Claim object
            financial_data: Optional financial data

        Returns:
            HTML string
        """
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Insurance Claim - {claim.claim_id}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }}
        .field {{
            margin-bottom: 10px;
        }}
        .field-label {{
            font-weight: bold;
            display: inline-block;
            width: 200px;
        }}
        .parties {{
            margin-left: 20px;
        }}
        .party {{
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9fafb;
            border-left: 3px solid #2563eb;
        }}
        .footer {{
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Insurance Claim Submission</h1>
        <p><strong>Claim ID:</strong> {claim.claim_id}</p>
        <p><strong>Status:</strong> {claim.status.value}</p>
        <p><strong>Generated:</strong> {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
    </div>

    <div class="section">
        <div class="section-title">Incident Information</div>
        <div class="field">
            <span class="field-label">Incident Type:</span>
            {claim.incident_type}
        </div>
        <div class="field">
            <span class="field-label">Date of Incident:</span>
            {claim.date}
        </div>
        <div class="field">
            <span class="field-label">Location:</span>
            {claim.location}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Damage Description</div>
        <p>{claim.damages_description}</p>
        {f'<p><strong>Estimated Damage:</strong> {claim.estimated_damage}</p>' if claim.estimated_damage else ''}
    </div>

    <div class="section">
        <div class="section-title">Parties Involved</div>
        <div class="parties">
"""

        # Add parties
        if claim.parties_involved:
            for party in claim.parties_involved:
                html += f"""
            <div class="party">
                <div><strong>{party.name}</strong> ({party.role})</div>
                {f'<div>Contact: {party.contact}</div>' if party.contact else ''}
                {f'<div>Insurance: {party.insurance_info}</div>' if party.insurance_info else ''}
            </div>
"""
        else:
            html += "<p>No parties information available</p>"

        html += """
        </div>
    </div>
"""

        # Add financial information if available
        if financial_data:
            estimate = financial_data.get('estimate', {})
            html += f"""
    <div class="section">
        <div class="section-title">Financial Estimate</div>
        <div class="field">
            <span class="field-label">Total Estimated Damage:</span>
            ${estimate.get('estimated_damage', 0):,.2f}
        </div>
        <div class="field">
            <span class="field-label">Insurance Coverage:</span>
            {estimate.get('insurance_coverage', 0) * 100:.0f}%
        </div>
        <div class="field">
            <span class="field-label">Deductible (Your Cost):</span>
            ${estimate.get('deductible', 0):,.2f}
        </div>
        <div class="field">
            <span class="field-label">Insurance Payout:</span>
            ${estimate.get('payout_after_deductible', 0):,.2f}
        </div>
    </div>
"""

        html += f"""
    <div class="section">
        <div class="section-title">Claim Summary</div>
        <p>{claim.summary}</p>
    </div>

    <div class="footer">
        <p>This claim document was generated by ClaimPilot AI</p>
        <p>Document ID: {claim.claim_id} | Generated: {datetime.now().isoformat()}</p>
    </div>
</body>
</html>
"""
        return html

    def _generate_summary(self, claim: Claim) -> str:
        """
        Generate summary message

        Args:
            claim: Claim object

        Returns:
            Summary string
        """
        return (
            f"I've prepared a formal claim draft for {claim.claim_id}. "
            f"The document includes all incident details, damage description, "
            f"parties involved, and financial information. The draft is ready "
            f"for compliance review and submission."
        )


# Singleton instance
claim_drafting_agent = ClaimDraftingAgent()
