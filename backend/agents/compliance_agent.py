"""
Compliance Check Agent - Validates and prepares claims for submission

Responsibilities:
- Validate all required fields are present
- Check for PII and sensitive data
- Ensure claim meets submission requirements
- Mark claims as submission-ready
"""
from typing import Dict, List, Optional
import re
from utils.data_models import Claim, AgentResponse


class ComplianceAgent:
    """
    Compliance Check Agent - Validates claims for submission

    This agent ensures claims meet all requirements before submission.
    """

    def __init__(self):
        self.name = "ComplianceCheck"
        self.version = "1.0.0"

        # Required fields for submission
        self.required_fields = [
            "claim_id",
            "incident_type",
            "date",
            "location",
            "damages_description"
        ]

        # PII patterns to check
        self.pii_patterns = {
            "SSN": r'\b\d{3}-\d{2}-\d{4}\b',
            "Credit Card": r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b',
            "Email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        }

    def validate_claim(self, claim: Claim, draft_html: Optional[str] = None) -> AgentResponse:
        """
        Validate claim for submission

        Args:
            claim: Claim object
            draft_html: Optional HTML draft to validate

        Returns:
            AgentResponse with validation results
        """
        try:
            # Run validation checks
            validation_results = {
                "required_fields": self._check_required_fields(claim),
                "data_quality": self._check_data_quality(claim),
                "pii_check": self._check_pii(claim),
                "completeness_score": self._calculate_completeness(claim)
            }

            # Determine if ready for submission
            all_required_present = validation_results["required_fields"]["all_present"]
            no_exposed_pii = len(validation_results["pii_check"]["found"]) == 0
            quality_score = validation_results["data_quality"]["score"]

            is_ready = all_required_present and no_exposed_pii and quality_score >= 0.7

            # Generate recommendations
            recommendations = self._generate_recommendations(validation_results, claim)

            # Create summary
            summary = self._generate_summary(validation_results, is_ready)

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "claim_id": claim.claim_id,
                    "validation_results": validation_results,
                    "submission_ready": is_ready,
                    "recommendations": recommendations,
                    "summary": summary
                },
                message=f"Compliance check completed for {claim.claim_id}",
                confidence=validation_results["completeness_score"]
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error during compliance check: {str(e)}"
            )

    def _check_required_fields(self, claim: Claim) -> Dict:
        """
        Check if all required fields are present

        Args:
            claim: Claim object

        Returns:
            Dictionary with field check results
        """
        missing_fields = []
        present_fields = []

        claim_dict = claim.model_dump()

        for field in self.required_fields:
            if field in claim_dict and claim_dict[field]:
                # Check if it's not a default/empty value
                value = claim_dict[field]
                if isinstance(value, str) and len(value.strip()) > 0:
                    present_fields.append(field)
                elif not isinstance(value, str):
                    present_fields.append(field)
                else:
                    missing_fields.append(field)
            else:
                missing_fields.append(field)

        return {
            "all_present": len(missing_fields) == 0,
            "missing": missing_fields,
            "present": present_fields,
            "completeness": len(present_fields) / len(self.required_fields)
        }

    def _check_data_quality(self, claim: Claim) -> Dict:
        """
        Check data quality of the claim

        Args:
            claim: Claim object

        Returns:
            Quality assessment
        """
        quality_score = 0.0
        checks = []

        # Check 1: Parties involved
        if claim.parties_involved and len(claim.parties_involved) > 0:
            quality_score += 0.2
            checks.append({"check": "parties_present", "passed": True})
        else:
            checks.append({"check": "parties_present", "passed": False})

        # Check 2: Estimated damage
        if claim.estimated_damage:
            quality_score += 0.2
            checks.append({"check": "damage_estimate_present", "passed": True})
        else:
            checks.append({"check": "damage_estimate_present", "passed": False})

        # Check 3: Detailed description
        if len(claim.damages_description) > 50:
            quality_score += 0.2
            checks.append({"check": "detailed_description", "passed": True})
        else:
            checks.append({"check": "detailed_description", "passed": False})

        # Check 4: Location specificity
        if claim.location and "not specified" not in claim.location.lower():
            quality_score += 0.2
            checks.append({"check": "specific_location", "passed": True})
        else:
            checks.append({"check": "specific_location", "passed": False})

        # Check 5: Claim confidence
        if claim.confidence >= 0.7:
            quality_score += 0.2
            checks.append({"check": "high_confidence", "passed": True})
        else:
            checks.append({"check": "high_confidence", "passed": False})

        return {
            "score": quality_score,
            "checks": checks,
            "grade": self._score_to_grade(quality_score)
        }

    def _check_pii(self, claim: Claim) -> Dict:
        """
        Check for exposed PII in claim data

        Args:
            claim: Claim object

        Returns:
            PII check results
        """
        found_pii = []

        # Check raw text if available
        text_to_check = claim.raw_text or ""
        text_to_check += " " + claim.damages_description
        text_to_check += " " + claim.summary

        for pii_type, pattern in self.pii_patterns.items():
            matches = re.findall(pattern, text_to_check)
            if matches:
                found_pii.append({
                    "type": pii_type,
                    "count": len(matches)
                })

        return {
            "found": found_pii,
            "clean": len(found_pii) == 0,
            "warning": "PII detected - should be redacted" if found_pii else None
        }

    def _calculate_completeness(self, claim: Claim) -> float:
        """
        Calculate overall completeness score

        Args:
            claim: Claim object

        Returns:
            Completeness score (0-1)
        """
        # Weighted average of claim confidence and field completeness
        return round((claim.confidence * 0.6) + (self._check_required_fields(claim)["completeness"] * 0.4), 2)

    def _score_to_grade(self, score: float) -> str:
        """Convert quality score to letter grade"""
        if score >= 0.9:
            return "A"
        elif score >= 0.8:
            return "B"
        elif score >= 0.7:
            return "C"
        elif score >= 0.6:
            return "D"
        else:
            return "F"

    def _generate_recommendations(self, validation_results: Dict, claim: Claim) -> List[str]:
        """
        Generate recommendations based on validation results

        Args:
            validation_results: Validation results
            claim: Claim object

        Returns:
            List of recommendations
        """
        recommendations = []

        # Required fields
        missing = validation_results["required_fields"]["missing"]
        if missing:
            recommendations.append(f"Add missing required fields: {', '.join(missing)}")

        # Data quality
        quality_checks = validation_results["data_quality"]["checks"]
        for check in quality_checks:
            if not check["passed"]:
                if check["check"] == "parties_present":
                    recommendations.append("Add information about parties involved")
                elif check["check"] == "damage_estimate_present":
                    recommendations.append("Request damage estimation from FinTrack")
                elif check["check"] == "detailed_description":
                    recommendations.append("Provide more detailed damage description")
                elif check["check"] == "specific_location":
                    recommendations.append("Specify exact location of incident")

        # PII
        pii_found = validation_results["pii_check"]["found"]
        if pii_found:
            for pii in pii_found:
                recommendations.append(f"Redact {pii['type']} from claim documents")

        # If everything looks good
        if not recommendations:
            recommendations.append("Claim is ready for submission!")

        return recommendations

    def _generate_summary(self, validation_results: Dict, is_ready: bool) -> str:
        """
        Generate compliance check summary

        Args:
            validation_results: Validation results
            is_ready: Whether claim is ready for submission

        Returns:
            Summary string
        """
        completeness = validation_results["completeness_score"]
        quality_grade = validation_results["data_quality"]["grade"]

        if is_ready:
            summary = (
                f"✅ Compliance check passed! Your claim has a {completeness * 100:.0f}% "
                f"completeness score and {quality_grade} quality grade. "
                f"All required fields are present and no PII issues detected. "
                f"This claim is ready for submission."
            )
        else:
            summary = (
                f"⚠️ Compliance check found some issues. Your claim has a {completeness * 100:.0f}% "
                f"completeness score and {quality_grade} quality grade. "
                f"Please review the recommendations before submission."
            )

        return summary


# Singleton instance
compliance_agent = ComplianceAgent()
