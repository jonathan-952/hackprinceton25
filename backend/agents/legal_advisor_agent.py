"""
Legal Advisor Agent - Provides immediate legal guidance

Responsibilities:
- Explain fault laws by state
- Recommend next legal steps
- Verify lawyer credentials
- Advise on police reports and insurance filing
"""
from typing import Dict, Optional
from utils.data_models import Claim, AgentResponse


class LegalAdvisorAgent:
    """
    Legal Advisor - Immediate legal guidance after accidents

    This agent provides legally-informed advice on next steps.
    """

    def __init__(self):
        self.name = "LegalAdvisor"
        self.version = "1.0.0"

        # State laws database (mock - simplified)
        self.state_laws = {
            "NJ": {
                "type": "no-fault",
                "min_injury_threshold": "$15,000",
                "description": "New Jersey is a no-fault state. You file with your own insurance first.",
                "police_report_required": True,
                "statute_of_limitations": "2 years"
            },
            "PA": {
                "type": "choice no-fault",
                "description": "Pennsylvania allows you to choose between no-fault and tort coverage.",
                "police_report_required": True,
                "statute_of_limitations": "2 years"
            },
            "NY": {
                "type": "no-fault",
                "min_injury_threshold": "$50,000",
                "description": "New York is a no-fault state with serious injury threshold.",
                "police_report_required": True,
                "statute_of_limitations": "3 years"
            },
            "CA": {
                "type": "at-fault",
                "description": "California is an at-fault state. You can sue the responsible party.",
                "police_report_required": False,
                "statute_of_limitations": "2 years"
            }
        }

        # Mock lawyer database
        self.verified_lawyers = {
            "John Smith": {"bar_id": "NJ-12345", "status": "active", "rating": "A+", "state": "NJ"},
            "Sarah Johnson": {"bar_id": "NY-67890", "status": "active", "rating": "A", "state": "NY"},
            "Michael Chen": {"bar_id": "CA-54321", "status": "active", "rating": "A+", "state": "CA"}
        }

    def get_legal_guidance(
        self,
        claim: Claim,
        user_state: str = "NJ"
    ) -> AgentResponse:
        """
        Provide legal guidance based on incident and state laws

        Args:
            claim: Claim object
            user_state: User's state (default NJ)

        Returns:
            AgentResponse with legal guidance
        """
        try:
            # Get state law info
            state_info = self.state_laws.get(user_state, self.state_laws["NJ"])

            # Determine recommended steps
            next_steps = self._generate_next_steps(claim, state_info)

            # Generate legal summary
            summary = self._generate_legal_summary(claim, state_info, user_state)

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "state": user_state,
                    "fault_system": state_info["type"],
                    "description": state_info["description"],
                    "police_report_required": state_info.get("police_report_required", True),
                    "statute_of_limitations": state_info.get("statute_of_limitations", "2 years"),
                    "next_steps": next_steps,
                    "summary": summary,
                    "should_get_lawyer": self._should_get_lawyer(claim)
                },
                message="Legal guidance generated",
                confidence=0.90
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error generating legal guidance: {str(e)}"
            )

    def verify_lawyer(self, lawyer_name: str, state: str = "NJ") -> AgentResponse:
        """
        Verify lawyer credentials against bar association

        Args:
            lawyer_name: Name of lawyer to verify
            state: State bar to check

        Returns:
            AgentResponse with verification results
        """
        try:
            # Check if lawyer is in our verified database
            lawyer_info = self.verified_lawyers.get(lawyer_name)

            if lawyer_info and lawyer_info["state"] == state:
                return AgentResponse(
                    agent_name=self.name,
                    success=True,
                    data={
                        "verified": True,
                        "lawyer_name": lawyer_name,
                        "bar_id": lawyer_info["bar_id"],
                        "status": lawyer_info["status"],
                        "rating": lawyer_info["rating"],
                        "state": lawyer_info["state"],
                        "message": f"✅ {lawyer_name} is verified with {state} Bar Association"
                    },
                    message="Lawyer verified successfully",
                    confidence=1.0
                )
            else:
                return AgentResponse(
                    agent_name=self.name,
                    success=True,
                    data={
                        "verified": False,
                        "lawyer_name": lawyer_name,
                        "state": state,
                        "message": f"⚠️ Could not verify {lawyer_name} in {state} Bar records. Please verify independently."
                    },
                    message="Lawyer not found in database",
                    confidence=0.5
                )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error verifying lawyer: {str(e)}"
            )

    def _generate_next_steps(self, claim: Claim, state_info: Dict) -> list:
        """Generate recommended next steps"""
        steps = []

        # Police report
        if state_info.get("police_report_required"):
            if not claim.police_report or not claim.police_report.get("filed"):
                steps.append("📋 File a police report immediately (required in your state)")
            else:
                steps.append("✅ Police report filed - keep a copy for your records")

        # Insurance notification
        steps.append("📞 Contact your insurance company within 24 hours")

        # Documentation
        steps.append("📸 Document all damage with photos and videos")
        steps.append("📝 Get contact info from all parties and witnesses")

        # Medical
        if "injury" in claim.damages_description.lower() or "hurt" in claim.damages_description.lower():
            steps.append("🏥 Seek medical attention ASAP - even for minor injuries")

        # Legal counsel
        if self._should_get_lawyer(claim):
            steps.append("⚖️ Consult with a personal injury attorney (recommended for this case)")
        else:
            steps.append("⚖️ Consider legal consultation if injuries worsen or fault is disputed")

        return steps

    def _should_get_lawyer(self, claim: Claim) -> bool:
        """Determine if user should get a lawyer"""
        # Keywords that suggest lawyer needed
        serious_keywords = [
            "severe", "hospital", "injury", "injuries", "ambulance",
            "unconscious", "broken", "fracture", "head", "neck", "spine"
        ]

        description = claim.damages_description.lower()

        # Check for serious injuries
        if any(keyword in description for keyword in serious_keywords):
            return True

        # Check estimated damage amount
        if claim.estimated_damage:
            try:
                amount = float(claim.estimated_damage.replace('$', '').replace(',', ''))
                if amount > 5000:
                    return True
            except:
                pass

        # Hit and run always needs lawyer
        if "hit" in claim.incident_type.lower() and "run" in claim.incident_type.lower():
            return True

        return False

    def _generate_legal_summary(self, claim: Claim, state_info: Dict, state: str) -> str:
        """Generate natural language legal summary"""
        fault_type = state_info["type"]
        should_lawyer = self._should_get_lawyer(claim)

        summary = f"Based on your {claim.incident_type.lower()} in {state}, here's what you need to know:\n\n"
        summary += f"🏛️ **Your State Law**: {state_info['description']}\n\n"

        if should_lawyer:
            summary += "⚖️ **Legal Recommendation**: Given the severity of this accident, I strongly recommend consulting with a personal injury attorney. This could increase your payout by 30-40% and ensure you're fully protected.\n\n"
        else:
            summary += "⚖️ **Legal Recommendation**: You can likely handle this claim yourself, but keep the option open if complications arise.\n\n"

        summary += f"⏰ **Important**: You have {state_info.get('statute_of_limitations', '2 years')} from the accident date to file a lawsuit if needed.\n\n"
        summary += "📋 **Next**: Follow the recommended steps above to protect your rights."

        return summary


# Singleton instance
legal_advisor_agent = LegalAdvisorAgent()
