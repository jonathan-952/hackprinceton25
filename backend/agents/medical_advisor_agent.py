"""
Medical Advisor Agent - Post-accident health guidance

Responsibilities:
- Assess injury severity
- Recommend immediate vs delayed care
- Find nearby medical facilities
- Track medical documentation
"""
import random
from typing import List, Optional
from utils.data_models import Claim, AgentResponse


class MedicalAdvisorAgent:
    """
    Medical Advisor - Health guidance after accidents

    This agent helps users understand their injuries and find medical care.
    """

    def __init__(self):
        self.name = "MedicalAdvisor"
        self.version = "1.0.0"

        # Mock medical facilities database
        self.facilities = {
            "urgent_care": [
                {
                    "name": "Princeton Urgent Care",
                    "type": "Urgent Care",
                    "rating": 4.7,
                    "distance": "1.2 mi",
                    "address": "100 Nassau St, Princeton, NJ",
                    "phone": "(609) 555-9000",
                    "wait_time": "15-30 min",
                    "accepts_insurance": True
                },
                {
                    "name": "CarePoint Health Center",
                    "type": "Urgent Care",
                    "rating": 4.5,
                    "distance": "2.3 mi",
                    "address": "456 Alexander Rd, Princeton, NJ",
                    "phone": "(609) 555-9100",
                    "wait_time": "20-40 min",
                    "accepts_insurance": True
                }
            ],
            "hospital": [
                {
                    "name": "Princeton Medical Center",
                    "type": "Hospital ER",
                    "rating": 4.8,
                    "distance": "3.5 mi",
                    "address": "1 Plainsboro Rd, Plainsboro, NJ",
                    "phone": "(609) 555-2000",
                    "wait_time": "ER: varies",
                    "trauma_level": "Level II"
                },
                {
                    "name": "Robert Wood Johnson Hospital",
                    "type": "Hospital ER",
                    "rating": 4.9,
                    "distance": "5.8 mi",
                    "address": "1 Robert Wood Johnson Pl, New Brunswick, NJ",
                    "phone": "(732) 555-3000",
                    "wait_time": "ER: varies",
                    "trauma_level": "Level I"
                }
            ],
            "physical_therapy": [
                {
                    "name": "Princeton Physical Therapy",
                    "type": "Physical Therapy",
                    "rating": 4.9,
                    "distance": "1.8 mi",
                    "address": "200 College Rd, Princeton, NJ",
                    "phone": "(609) 555-7000",
                    "specialties": ["Auto Injury Recovery", "Sports Medicine"]
                }
            ]
        }

    def assess_injuries(
        self,
        claim: Claim,
        symptoms: Optional[List[str]] = None
    ) -> AgentResponse:
        """
        Assess injury severity and recommend care level

        Args:
            claim: Claim object
            symptoms: List of reported symptoms

        Returns:
            AgentResponse with medical assessment
        """
        try:
            # Analyze description for injury keywords
            description = claim.damages_description.lower()

            # Determine severity and care level
            severity, care_level = self._assess_severity(description, symptoms or [])

            # Get recommended facilities
            facilities = self._get_recommended_facilities(care_level)

            # Generate medical summary
            summary = self._generate_medical_summary(severity, care_level, description)

            # Medical next steps
            next_steps = self._generate_medical_steps(severity, care_level)

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "severity": severity,
                    "care_level": care_level,
                    "recommended_facilities": facilities,
                    "summary": summary,
                    "next_steps": next_steps,
                    "documentation_needed": [
                        "Medical bills and receipts",
                        "Doctor's notes and diagnosis",
                        "Prescription records",
                        "Follow-up appointment schedules"
                    ],
                    "timeframe": self._get_care_timeframe(severity)
                },
                message="Medical assessment completed",
                confidence=0.85
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error assessing injuries: {str(e)}"
            )

    def find_facilities(
        self,
        facility_type: str = "urgent_care",
        max_results: int = 3
    ) -> AgentResponse:
        """
        Find nearby medical facilities

        Args:
            facility_type: Type of facility (urgent_care, hospital, physical_therapy)
            max_results: Maximum number to return

        Returns:
            AgentResponse with facility list
        """
        try:
            facilities = self.facilities.get(facility_type, self.facilities["urgent_care"])

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "facilities": facilities[:max_results],
                    "facility_type": facility_type,
                    "count": len(facilities[:max_results])
                },
                message=f"Found {len(facilities[:max_results])} facilities"
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error finding facilities: {str(e)}"
            )

    def _assess_severity(self, description: str, symptoms: List[str]) -> tuple:
        """Assess injury severity from description and symptoms"""

        # Emergency keywords
        emergency = [
            "unconscious", "bleeding", "can't move", "can't breathe",
            "chest pain", "severe pain", "head injury", "broken bone",
            "ambulance", "911"
        ]

        # Serious keywords
        serious = [
            "injury", "hurt", "pain", "whiplash", "neck", "back",
            "headache", "dizzy", "nausea", "bruise", "swelling"
        ]

        # Minor keywords
        minor = ["sore", "stiff", "minor", "slight", "small"]

        # Check for emergency
        if any(keyword in description for keyword in emergency):
            return "severe", "emergency_room"

        # Check for serious
        if any(keyword in description for keyword in serious):
            return "moderate", "urgent_care"

        # Check for minor
        if any(keyword in description for keyword in minor):
            return "minor", "primary_care"

        # Default to moderate if mentions any injury
        if "injury" in description or "hurt" in description or len(symptoms) > 0:
            return "moderate", "urgent_care"

        return "none", "monitor"

    def _get_recommended_facilities(self, care_level: str) -> List:
        """Get facilities based on care level"""
        if care_level == "emergency_room":
            return self.facilities["hospital"]
        elif care_level == "urgent_care":
            return self.facilities["urgent_care"]
        elif care_level == "primary_care":
            return self.facilities["urgent_care"][:1]  # Just one option
        else:
            return []

    def _generate_medical_summary(self, severity: str, care_level: str, description: str) -> str:
        """Generate medical summary"""
        if severity == "severe":
            return "🚨 **URGENT**: Your symptoms indicate a potentially serious injury. Seek emergency medical care immediately. Call 911 if symptoms worsen."

        elif severity == "moderate":
            return "⚠️ **Important**: You should see a medical professional within 24 hours. Even seemingly minor injuries can worsen without proper care. Your health and your claim both depend on proper documentation."

        elif severity == "minor":
            return "ℹ️ **Recommendation**: While your injuries appear minor, it's wise to get checked out. Some injuries (like whiplash) don't show symptoms until days later. Visit your doctor or urgent care if pain increases."

        else:
            return "✅ **Monitor**: No immediate injuries reported. However, watch for delayed symptoms over the next 48-72 hours. Document any pain, stiffness, or discomfort that develops."

    def _generate_medical_steps(self, severity: str, care_level: str) -> List[str]:
        """Generate recommended medical steps"""
        steps = []

        if severity == "severe":
            steps.append("🚑 Call 911 or go to ER immediately")
            steps.append("📞 Notify your insurance company")
            steps.append("📸 Take photos of visible injuries")

        elif severity == "moderate":
            steps.append("🏥 Visit urgent care or doctor within 24 hours")
            steps.append("📋 Request a full medical report for your claim")
            steps.append("💊 Follow all treatment recommendations")
            steps.append("📸 Document any visible injuries")

        elif severity == "minor":
            steps.append("👨‍⚕️ Schedule a checkup within 48 hours")
            steps.append("📝 Keep a symptom journal")
            steps.append("🧊 Apply ice to any swelling")

        else:
            steps.append("👀 Monitor for symptoms over next 72 hours")
            steps.append("📝 Document any pain or discomfort that develops")

        # Common steps for all
        steps.append("💰 Keep ALL medical receipts and bills")
        steps.append("📄 Request copies of all medical records")

        return steps

    def _get_care_timeframe(self, severity: str) -> str:
        """Get recommended care timeframe"""
        timeframes = {
            "severe": "Immediate (call 911 or go to ER now)",
            "moderate": "Within 24 hours",
            "minor": "Within 48-72 hours",
            "none": "Monitor for 3-5 days"
        }
        return timeframes.get(severity, "Within 24 hours")


# Singleton instance
medical_advisor_agent = MedicalAdvisorAgent()
