"""
FinTrack Agent - Damage & Deductible Estimator

Responsibilities:
- Estimate repair/damage costs
- Calculate insurance coverage and deductibles
- Provide post-deductible payout calculations
- Generate cost breakdowns
"""
from typing import Dict, Optional
from datetime import datetime
from utils.data_models import Claim, FinancialEstimate, AgentResponse


class FinTrackAgent:
    """
    FinTrack - Financial Estimation & Deductible Calculator Agent

    This agent provides cost estimates and calculates insurance payouts.
    """

    def __init__(self):
        self.name = "FinTrack"
        self.version = "1.0.0"

        # Damage estimation models (simplified - in production, use ML models)
        self.damage_estimates = {
            "Car Accident": {
                "minor": {"min": 500, "max": 2000},
                "moderate": {"min": 2000, "max": 8000},
                "severe": {"min": 8000, "max": 25000},
                "total_loss": {"min": 25000, "max": 100000}
            },
            "Home Damage": {
                "minor": {"min": 1000, "max": 5000},
                "moderate": {"min": 5000, "max": 15000},
                "severe": {"min": 15000, "max": 50000},
                "catastrophic": {"min": 50000, "max": 500000}
            },
            "Property Damage": {
                "minor": {"min": 300, "max": 1500},
                "moderate": {"min": 1500, "max": 5000},
                "severe": {"min": 5000, "max": 20000}
            },
            "Medical": {
                "minor": {"min": 500, "max": 3000},
                "moderate": {"min": 3000, "max": 10000},
                "severe": {"min": 10000, "max": 50000},
                "critical": {"min": 50000, "max": 500000}
            }
        }

        # Default insurance coverage percentages
        self.default_coverage = {
            "Car Accident": 0.80,  # 80% coverage
            "Home Damage": 0.90,   # 90% coverage
            "Property Damage": 0.75,  # 75% coverage
            "Medical": 0.85,       # 85% coverage
            "Theft": 0.70,         # 70% coverage
            "Other": 0.75          # 75% coverage
        }

    def estimate_damage(
        self,
        claim: Claim,
        severity: Optional[str] = None,
        coverage_override: Optional[float] = None
    ) -> AgentResponse:
        """
        Estimate damage costs and calculate insurance payout

        Args:
            claim: Claim object
            severity: Severity level override (optional)
            coverage_override: Custom coverage percentage (optional)

        Returns:
            AgentResponse with financial estimate
        """
        try:
            # Determine severity if not provided
            if not severity:
                severity = self._assess_severity(claim)

            # Estimate damage amount
            estimated_damage = self._calculate_damage_estimate(
                claim.incident_type,
                severity,
                claim.estimated_damage
            )

            # Get insurance coverage
            coverage = coverage_override or self.default_coverage.get(
                claim.incident_type,
                0.75
            )

            # Calculate deductible and payout
            deductible = estimated_damage * (1 - coverage)
            payout = estimated_damage - deductible

            # Generate cost breakdown
            breakdown = self._generate_breakdown(
                claim,
                estimated_damage,
                severity
            )

            # Calculate confidence
            confidence = self._calculate_confidence(claim, severity)

            # Create financial estimate
            estimate = FinancialEstimate(
                claim_id=claim.claim_id,
                estimated_damage=estimated_damage,
                insurance_coverage=coverage,
                deductible=round(deductible, 2),
                payout_after_deductible=round(payout, 2),
                breakdown=breakdown,
                confidence=confidence,
                notes=self._generate_notes(claim, severity, coverage)
            )

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "estimate": estimate.model_dump(),
                    "summary": self._generate_summary(estimate)
                },
                message=f"Financial estimate completed for claim {claim.claim_id}",
                confidence=confidence
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error estimating damage: {str(e)}"
            )

    def _assess_severity(self, claim: Claim) -> str:
        """
        Assess damage severity based on claim data

        Args:
            claim: Claim object

        Returns:
            Severity level
        """
        # Check if estimated damage is provided
        if claim.estimated_damage:
            amount_str = claim.estimated_damage.replace('$', '').replace(',', '')
            try:
                amount = float(amount_str)

                # Severity based on amount
                if claim.incident_type == "Car Accident":
                    if amount >= 25000:
                        return "total_loss"
                    elif amount >= 8000:
                        return "severe"
                    elif amount >= 2000:
                        return "moderate"
                    else:
                        return "minor"

                elif claim.incident_type == "Home Damage":
                    if amount >= 50000:
                        return "catastrophic"
                    elif amount >= 15000:
                        return "severe"
                    elif amount >= 5000:
                        return "moderate"
                    else:
                        return "minor"

                elif claim.incident_type == "Medical":
                    if amount >= 50000:
                        return "critical"
                    elif amount >= 10000:
                        return "severe"
                    elif amount >= 3000:
                        return "moderate"
                    else:
                        return "minor"

            except ValueError:
                pass

        # Analyze damage description for severity keywords
        damages_lower = claim.damages_description.lower()

        severe_keywords = ["total", "destroyed", "severe", "major", "extensive", "critical"]
        moderate_keywords = ["moderate", "significant", "substantial"]

        if any(keyword in damages_lower for keyword in severe_keywords):
            return "severe"
        elif any(keyword in damages_lower for keyword in moderate_keywords):
            return "moderate"

        # Default to minor
        return "minor"

    def _calculate_damage_estimate(
        self,
        incident_type: str,
        severity: str,
        existing_estimate: Optional[str] = None
    ) -> float:
        """
        Calculate damage estimate based on incident type and severity

        Args:
            incident_type: Type of incident
            severity: Severity level
            existing_estimate: Existing estimate from claim

        Returns:
            Estimated damage amount
        """
        # If existing estimate is available, use it
        if existing_estimate:
            amount_str = existing_estimate.replace('$', '').replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                pass

        # Use damage model
        if incident_type in self.damage_estimates:
            severity_ranges = self.damage_estimates[incident_type]
            if severity in severity_ranges:
                range_data = severity_ranges[severity]
                # Use midpoint of range
                return (range_data["min"] + range_data["max"]) / 2

        # Default estimate
        return 3000.0

    def _generate_breakdown(
        self,
        claim: Claim,
        total_damage: float,
        severity: str
    ) -> Dict:
        """
        Generate detailed cost breakdown

        Args:
            claim: Claim object
            total_damage: Total estimated damage
            severity: Severity level

        Returns:
            Cost breakdown dictionary
        """
        breakdown = {}

        if claim.incident_type == "Car Accident":
            breakdown = {
                "parts": round(total_damage * 0.60, 2),
                "labor": round(total_damage * 0.30, 2),
                "paint_and_materials": round(total_damage * 0.10, 2)
            }

        elif claim.incident_type == "Home Damage":
            breakdown = {
                "materials": round(total_damage * 0.50, 2),
                "labor": round(total_damage * 0.40, 2),
                "permits_and_fees": round(total_damage * 0.10, 2)
            }

        elif claim.incident_type == "Medical":
            breakdown = {
                "medical_treatment": round(total_damage * 0.70, 2),
                "medications": round(total_damage * 0.15, 2),
                "rehabilitation": round(total_damage * 0.15, 2)
            }

        else:
            breakdown = {
                "repair_costs": round(total_damage * 0.80, 2),
                "service_fees": round(total_damage * 0.20, 2)
            }

        breakdown["total"] = total_damage
        return breakdown

    def _calculate_confidence(self, claim: Claim, severity: str) -> float:
        """
        Calculate confidence score for the estimate

        Args:
            claim: Claim object
            severity: Severity level

        Returns:
            Confidence score (0-1)
        """
        confidence = 0.5  # Base confidence

        # Increase if we have existing estimate
        if claim.estimated_damage:
            confidence += 0.3

        # Increase based on claim confidence
        confidence += claim.confidence * 0.2

        # Cap at 1.0
        return min(round(confidence, 2), 1.0)

    def _generate_notes(
        self,
        claim: Claim,
        severity: str,
        coverage: float
    ) -> str:
        """
        Generate notes about the estimate

        Args:
            claim: Claim object
            severity: Severity level
            coverage: Insurance coverage percentage

        Returns:
            Notes string
        """
        notes = []

        notes.append(f"Estimated damage severity: {severity}")
        notes.append(f"Insurance coverage: {coverage * 100:.0f}%")

        if severity in ["severe", "total_loss", "catastrophic", "critical"]:
            notes.append("High-severity claim - may require detailed inspection")

        if coverage < 0.80:
            notes.append("Lower coverage percentage - higher out-of-pocket cost")

        return " | ".join(notes)

    def _generate_summary(self, estimate: FinancialEstimate) -> str:
        """
        Generate natural language summary of the estimate

        Args:
            estimate: FinancialEstimate object

        Returns:
            Summary string
        """
        coverage_pct = estimate.insurance_coverage * 100

        summary = (
            f"Based on the damage assessment, the total estimated cost is "
            f"${estimate.estimated_damage:,.2f}. With {coverage_pct:.0f}% insurance coverage, "
            f"your deductible (out-of-pocket cost) is ${estimate.deductible:,.2f}, "
            f"and the insurance payout will be ${estimate.payout_after_deductible:,.2f}."
        )

        return summary

    def compare_estimates(
        self,
        claim: Claim,
        severities: list[str]
    ) -> AgentResponse:
        """
        Compare estimates across different severity levels

        Args:
            claim: Claim object
            severities: List of severity levels to compare

        Returns:
            AgentResponse with comparison data
        """
        try:
            comparisons = {}

            for severity in severities:
                result = self.estimate_damage(claim, severity=severity)
                if result.success:
                    comparisons[severity] = result.data["estimate"]

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={"comparisons": comparisons},
                message="Estimate comparison completed"
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error comparing estimates: {str(e)}"
            )


# Singleton instance
fintrack_agent = FinTrackAgent()
