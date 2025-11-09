"""
ClaimPilot Agent - Legal Claim Summarizer

Responsibilities:
- Parse PDF/text documents (police reports, insurance forms)
- Extract structured claim information
- Generate natural language summaries
- Track claim status
- Coordinate with other agents when needed
"""
import uuid
from datetime import datetime
from typing import Dict, Optional, List
from utils.data_models import Claim, ClaimStatus, Party, AgentResponse
from utils.pdf_parser import pdf_parser
from utils.supabase_client import (
    save_claim_to_db,
    get_claim_from_db,
    list_claims_from_db,
    update_claim_in_db
)
from config.database import supabase_client


class ClaimPilotAgent:
    """
    ClaimPilot - Legal Claim Summarizer Agent

    This agent processes insurance documents and creates structured claims.
    """

    def __init__(self):
        self.name = "ClaimPilot"
        self.version = "1.0.0"
        self.claims_database = {}  # In-memory storage (replace with real DB in production)
        self.db = supabase_client

    def process_document(
        self,
        file_data: Optional[str] = None,
        file_name: Optional[str] = None,
        raw_text: Optional[str] = None
    ) -> AgentResponse:
        """
        Process a document and create a structured claim

        Args:
            file_data: Base64 encoded file content
            file_name: Name of the file
            raw_text: Raw text input (alternative to file)

        Returns:
            AgentResponse with claim data
        """
        try:
            # Extract text from document
            if raw_text:
                text = raw_text
            elif file_data and file_name:
                text = pdf_parser.parse_document(file_data, file_name)
            else:
                return AgentResponse(
                    agent_name=self.name,
                    success=False,
                    data={},
                    message="No document or text provided"
                )

            # Extract structured data
            extracted_data = pdf_parser.extract_structured_data(text)

            # Create claim
            claim = self._create_claim(text, extracted_data)

            # Store claim in memory
            self.claims_database[claim.claim_id] = claim

            # Save to Supabase database
            save_claim_to_db(claim.model_dump())

            # Generate summary
            summary = self._generate_summary(claim)

            # Generate summary
            summary = self._generate_summary(claim)

            # Store claim in database
            self._save_claim_to_db(claim)

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "claim": claim.model_dump(),
                    "summary": summary
                },
                message=f"Successfully processed claim {claim.claim_id}",
                confidence=claim.confidence
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error processing document: {str(e)}"
            )

    def _create_claim(self, raw_text: str, extracted_data: Dict) -> Claim:
        """
        Create a Claim object from extracted data

        Args:
            raw_text: Original document text
            extracted_data: Structured data extracted from document

        Returns:
            Claim object
        """
        # Generate unique claim ID
        claim_id = f"C-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"

        # Extract parties
        parties = []
        for party_data in extracted_data.get("parties", []):
            parties.append(Party(**party_data))

        # Estimate damage if amounts found
        estimated_damage = None
        amounts = extracted_data.get("amounts", [])
        if amounts:
            # Take the highest amount as estimated damage
            estimated_damage = f"${max(amounts):,.2f}"

        # Calculate confidence score
        confidence = self._calculate_confidence(extracted_data, raw_text)

        # Create claim
        claim = Claim(
            claim_id=claim_id,
            incident_type=extracted_data.get("incident_type", "Other"),
            date=extracted_data.get("date", datetime.now().strftime("%Y-%m-%d")),
            location=extracted_data.get("location", "Location not specified"),
            parties_involved=parties,
            damages_description=extracted_data.get("damages", "No damage description available"),
            estimated_damage=estimated_damage,
            confidence=confidence,
            status=ClaimStatus.PROCESSING,
            summary="",  # Will be generated
            raw_text=raw_text
        )

        return claim

    def _calculate_confidence(self, extracted_data: Dict, raw_text: str) -> float:
        """
        Calculate confidence score based on data quality

        Args:
            extracted_data: Extracted structured data
            raw_text: Original text

        Returns:
            Confidence score between 0 and 1
        """
        score = 0.0
        total_checks = 6

        # Check for incident type
        if extracted_data.get("incident_type") and extracted_data["incident_type"] != "Other":
            score += 1

        # Check for date
        if extracted_data.get("date"):
            score += 1

        # Check for location
        if extracted_data.get("location") and "not specified" not in extracted_data["location"].lower():
            score += 1

        # Check for parties
        if extracted_data.get("parties") and len(extracted_data["parties"]) > 0:
            score += 1

        # Check for damage description
        if extracted_data.get("damages") and "not available" not in extracted_data["damages"].lower():
            score += 1

        # Check for monetary amounts
        if extracted_data.get("amounts") and len(extracted_data["amounts"]) > 0:
            score += 1

        return round(score / total_checks, 2)

    def _generate_summary(self, claim: Claim) -> str:
        """
        Generate natural language summary of the claim
        Generate natural language summary of the claim using MCP AI summarization

        Args:
            claim: Claim object

        Returns:
            Natural language summary
        """
        # Create a conversational summary
        try:
            # Use MCP summarize_claim tool with the raw text
            from utils.mcp_tools import summarize_claim

            # If we have raw_text, use AI summarization
            if claim.raw_text and len(claim.raw_text.strip()) > 50:
                ai_summary = summarize_claim(claim.raw_text)

                # Append claim ID and status info
                summary = (
                    f"{ai_summary}\n\n"
                    f"This claim has been assigned ID {claim.claim_id} "
                    f"and is currently in {claim.status.value} status."
                )
            else:
                # Fallback to template-based summary if raw text is unavailable
                summary = self._generate_template_summary(claim)

            # Update claim with summary
            claim.summary = summary
            return summary

        except Exception as e:
            print(f"Error using MCP summarize_claim, falling back to template: {str(e)}")
            # Fallback to template-based summary
            summary = self._generate_template_summary(claim)
            claim.summary = summary
            return summary

    def _generate_template_summary(self, claim: Claim) -> str:
        """
        Generate template-based summary as fallback

        Args:
            claim: Claim object

        Returns:
            Template-based summary
        """
        summary_parts = []

        summary_parts.append(
            f"A {claim.incident_type.lower()} occurred on {claim.date} "
            f"at {claim.location}."
        )

        if claim.parties_involved:
            party_names = [p.name for p in claim.parties_involved]
            if len(party_names) == 1:
                summary_parts.append(f"The incident involved {party_names[0]}.")
            else:
                summary_parts.append(
                    f"The incident involved {', '.join(party_names[:-1])} "
                    f"and {party_names[-1]}."
                )

        if claim.damages_description and "not available" not in claim.damages_description.lower():
            summary_parts.append(claim.damages_description)

        if claim.estimated_damage:
            summary_parts.append(
                f"Estimated damage is {claim.estimated_damage}."
            )

        summary_parts.append(
            f"This claim has been assigned ID {claim.claim_id} "
            f"and is currently in {claim.status.value} status."
        )

        summary = " ".join(summary_parts)

        # Update claim with summary
        claim.summary = summary

        return summary

    def get_claim(self, claim_id: str) -> Optional[Claim]:
        """
        Retrieve a claim by ID from Supabase or in-memory storage
        return " ".join(summary_parts)

    def _save_claim_to_db(self, claim: Claim) -> None:
        """
        Save claim to Supabase database

        Args:
            claim: Claim object to save
        """
        try:
            claim_data = {
                "claim_id": claim.claim_id,
                "claim_number": claim.claim_id,  # Using claim_id as claim_number
                "incident_type": claim.incident_type,
                "incident_date": claim.date,
                "incident_location": claim.location,
                "description": claim.damages_description,
                "status": claim.status.value,
                "estimated_amount": self._extract_amount_from_string(claim.estimated_damage) if claim.estimated_damage else None,
                "claimant_name": claim.parties_involved[0].name if claim.parties_involved else None,
                "claimant_contact": claim.parties_involved[0].contact if claim.parties_involved and claim.parties_involved[0].contact else None,
                "items_damaged": [{"description": claim.damages_description}],
                "supporting_documents": [],
                "created_at": claim.created_at,
                "updated_at": claim.updated_at
            }

            # Insert or update claim
            result = self.db.table('claims').upsert(claim_data, on_conflict='claim_id').execute()

        except Exception as e:
            print(f"Error saving claim to database: {str(e)}")
            # Don't fail the entire operation if DB save fails
            pass

    def _extract_amount_from_string(self, amount_str: str) -> Optional[float]:
        """Extract numeric amount from string like '$1,234.56'"""
        try:
            return float(amount_str.replace('$', '').replace(',', ''))
        except (ValueError, AttributeError):
            return None

    def get_claim(self, claim_id: str) -> Optional[Claim]:
        """
        Retrieve a claim by ID from database

        Args:
            claim_id: Claim identifier

        Returns:
            Claim object or None
        """
        # Try Supabase first
        db_claim = get_claim_from_db(claim_id)
        if db_claim:
            # Convert database format to Claim object
            try:
                claim_data = {
                    'claim_id': db_claim['claim_id'],
                    'incident_type': db_claim['incident_data'].get('type', 'Unknown'),
                    'date': db_claim['incident_data'].get('date', ''),
                    'location': db_claim['incident_data'].get('location', ''),
                    'parties_involved': [],
                    'damages_description': db_claim['damage_data'].get('description', ''),
                    'estimated_damage': db_claim['damage_data'].get('estimated_damage', ''),
                    'confidence': 0.8,
                    'status': ClaimStatus(db_claim['status']) if db_claim['status'] in ['Open', 'Processing', 'Closed', 'Pending Info'] else ClaimStatus.OPEN,
                    'summary': db_claim['incident_data'].get('description', ''),
                    'created_at': db_claim.get('created_at', datetime.now().isoformat()),
                    'updated_at': db_claim.get('updated_at', datetime.now().isoformat())
                }
                claim = Claim(**claim_data)
                # Cache in memory
                self.claims_database[claim_id] = claim
                return claim
            except Exception as e:
                print(f"Error converting DB claim to Claim object: {e}")

        # Fall back to in-memory
        return self.claims_database.get(claim_id)

    def update_claim_status(self, claim_id: str, status: ClaimStatus) -> AgentResponse:
        """
        Update the status of a claim
        try:
            result = self.db.table('claims').select('*').eq('claim_id', claim_id).execute()

            if result.data and len(result.data) > 0:
                return self._claim_from_db(result.data[0])
            return None

        except Exception as e:
            print(f"Error retrieving claim {claim_id}: {str(e)}")
            return None

    def update_claim_status(self, claim_id: str, status: ClaimStatus) -> AgentResponse:
        """
        Update the status of a claim in database

        Args:
            claim_id: Claim identifier
            status: New status

        Returns:
            AgentResponse
        """
        claim = self.get_claim(claim_id)
        if not claim:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Claim {claim_id} not found"
            )

        claim.status = status
        claim.updated_at = datetime.now().isoformat()

        return AgentResponse(
            agent_name=self.name,
            success=True,
            data={"claim": claim.model_dump()},
            message=f"Claim {claim_id} status updated to {status.value}"
        )

    def list_claims(self, status: Optional[ClaimStatus] = None) -> List[Claim]:
        """
        List all claims from Supabase or in-memory storage, optionally filtered by status
        try:
            # Update in database
            self.db.table('claims').update({
                'status': status.value,
                'updated_at': datetime.now().isoformat()
            }).eq('claim_id', claim_id).execute()

            claim.status = status
            claim.updated_at = datetime.now().isoformat()

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={"claim": claim.model_dump()},
                message=f"Claim {claim_id} status updated to {status.value}"
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error updating claim status: {str(e)}"
            )

    def list_claims(self, status: Optional[ClaimStatus] = None) -> List[Claim]:
        """
        List all claims from database, optionally filtered by status

        Args:
            status: Filter by status (optional)

        Returns:
            List of claims
        """
        # Try Supabase first
        db_claims = list_claims_from_db(status.value if status else None)
        if db_claims:
            claims = []
            for db_claim in db_claims:
                try:
                    claim_data = {
                        'claim_id': db_claim['claim_id'],
                        'incident_type': db_claim['incident_data'].get('type', 'Unknown'),
                        'date': db_claim['incident_data'].get('date', ''),
                        'location': db_claim['incident_data'].get('location', ''),
                        'parties_involved': [],
                        'damages_description': db_claim['damage_data'].get('description', ''),
                        'estimated_damage': db_claim['damage_data'].get('estimated_damage', ''),
                        'confidence': 0.8,
                        'status': ClaimStatus(db_claim['status']) if db_claim['status'] in ['Open', 'Processing', 'Closed', 'Pending Info'] else ClaimStatus.OPEN,
                        'summary': db_claim['incident_data'].get('description', ''),
                        'created_at': db_claim.get('created_at', datetime.now().isoformat()),
                        'updated_at': db_claim.get('updated_at', datetime.now().isoformat())
                    }
                    claims.append(Claim(**claim_data))
                except Exception as e:
                    print(f"Error converting DB claim: {e}")
                    continue
            return claims

        # Fall back to in-memory
        claims = list(self.claims_database.values())

        if status:
            claims = [c for c in claims if c.status == status]

        # Sort by created_at (newest first)
        claims.sort(key=lambda x: x.created_at, reverse=True)

        return claims
        try:
            query = self.db.table('claims').select('*')

            if status:
                query = query.eq('status', status.value)

            result = query.order('created_at', desc=True).execute()

            claims = [self._claim_from_db(claim_data) for claim_data in result.data]
            return claims

        except Exception as e:
            print(f"Error listing claims: {str(e)}")
            return []

    def _claim_from_db(self, db_data: Dict) -> Claim:
        """
        Convert database row to Claim object

        Args:
            db_data: Database row data

        Returns:
            Claim object
        """
        # Convert parties data
        parties = []
        if db_data.get('claimant_name'):
            parties.append(Party(
                name=db_data['claimant_name'],
                role="Claimant",
                contact=db_data.get('claimant_contact')
            ))

        # Convert estimated amount
        estimated_damage = None
        if db_data.get('estimated_amount'):
            estimated_damage = f"${db_data['estimated_amount']:,.2f}"

        return Claim(
            claim_id=db_data['claim_id'],
            incident_type=db_data.get('incident_type', 'Other'),
            date=str(db_data.get('incident_date', datetime.now().strftime("%Y-%m-%d"))),
            location=db_data.get('incident_location', 'Location not specified'),
            parties_involved=parties,
            damages_description=db_data.get('description', 'No description'),
            estimated_damage=estimated_damage,
            confidence=0.8,  # Default confidence for DB records
            status=ClaimStatus(db_data.get('status', 'Processing')),
            summary=db_data.get('description', ''),
            raw_text="",
            created_at=str(db_data.get('created_at', datetime.now().isoformat())),
            updated_at=str(db_data.get('updated_at', datetime.now().isoformat()))
        )

    def analyze_claim(self, claim_id: str) -> AgentResponse:
        """
        Provide detailed analysis of a claim

        Args:
            claim_id: Claim identifier

        Returns:
            AgentResponse with analysis
        """
        claim = self.get_claim(claim_id)
        if not claim:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Claim {claim_id} not found"
            )

        # Analyze claim
        analysis = {
            "severity": self._assess_severity(claim),
            "completeness": f"{claim.confidence * 100:.0f}%",
            "recommended_actions": self._recommend_actions(claim),
            "missing_information": self._identify_missing_info(claim)
        }

        return AgentResponse(
            agent_name=self.name,
            success=True,
            data={
                "claim": claim.model_dump(),
                "analysis": analysis
            },
            message=f"Analysis complete for claim {claim_id}",
            confidence=claim.confidence
        )

    def _assess_severity(self, claim: Claim) -> str:
        """Assess claim severity"""
        if claim.estimated_damage:
            amount_str = claim.estimated_damage.replace('$', '').replace(',', '')
            try:
                amount = float(amount_str)
                if amount > 10000:
                    return "High"
                elif amount > 3000:
                    return "Medium"
                else:
                    return "Low"
            except ValueError:
                pass

        # Default based on incident type
        high_severity_types = ["Car Accident", "Medical", "Home Damage"]
        if claim.incident_type in high_severity_types:
            return "Medium"

        return "Low"

    def _recommend_actions(self, claim: Claim) -> List[str]:
        """Recommend next actions for the claim"""
        actions = []

        if claim.confidence < 0.6:
            actions.append("Review and verify claim information")

        if not claim.estimated_damage:
            actions.append("Request financial estimation from FinTrack agent")

        if claim.status == ClaimStatus.PROCESSING:
            actions.append("Continue claim processing")

        if claim.incident_type == "Car Accident":
            actions.append("Request repair shop recommendations")

        return actions

    def _identify_missing_info(self, claim: Claim) -> List[str]:
        """Identify missing information in the claim"""
        missing = []

        if not claim.parties_involved:
            missing.append("Parties involved")

        if not claim.estimated_damage:
            missing.append("Estimated damage amount")

        if claim.confidence < 0.7:
            missing.append("Additional documentation may be needed")

        return missing


# Singleton instance
claimpilot_agent = ClaimPilotAgent()
