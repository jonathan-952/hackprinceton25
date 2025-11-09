"""
ClaimPilot AI Orchestrator

Coordinates between ClaimPilot, FinTrack, and ShopFinder agents
to provide seamless multi-agent workflow.
"""
import re
from typing import Optional, Dict, List
from agents.claimpilot_agent import claimpilot_agent
from agents.fintrack_agent import fintrack_agent
from agents.shopfinder_agent import shopfinder_agent
from utils.data_models import (
    UserMessage, ChatResponse, Claim, FinancialEstimate,
    ShopRecommendations, AgentResponse
)


class ClaimPilotOrchestrator:
    """
    Main orchestrator for ClaimPilot AI system

    Handles:
    - Natural language understanding
    - Agent routing and coordination
    - Multi-agent workflows
    - Response formatting
    """

    def __init__(self):
        self.name = "ClaimPilot Orchestrator"
        self.version = "1.0.0"

        # Register agents
        self.agents = {
            "claimpilot": claimpilot_agent,
            "fintrack": fintrack_agent,
            "shopfinder": shopfinder_agent
        }

        # Conversation history (in-memory, use database in production)
        self.conversation_history = []

    def process_message(self, user_message: UserMessage) -> ChatResponse:
        """
        Process user message and coordinate appropriate agents

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse with results
        """
        try:
            # Add to conversation history
            self.conversation_history.append({
                "role": "user",
                "message": user_message.message,
                "timestamp": user_message.context.get("timestamp") if user_message.context else None
            })

            # Determine intent
            intent = self._determine_intent(user_message)

            # Route to appropriate handler
            if intent == "process_document":
                response = self._handle_document_processing(user_message)

            elif intent == "estimate_damage":
                response = self._handle_damage_estimation(user_message)

            elif intent == "find_shops":
                response = self._handle_shop_finding(user_message)

            elif intent == "full_claim_workflow":
                response = self._handle_full_workflow(user_message)

            elif intent == "get_claim_status":
                response = self._handle_claim_status(user_message)

            elif intent == "analyze_claim":
                response = self._handle_claim_analysis(user_message)

            else:
                response = self._handle_general_query(user_message)

            # Add to conversation history
            self.conversation_history.append({
                "role": "assistant",
                "message": response.message,
                "timestamp": response.timestamp
            })

            return response

        except Exception as e:
            return ChatResponse(
                message=f"I encountered an error: {str(e)}. Please try again or rephrase your request.",
                data={"error": str(e)}
            )

    def _determine_intent(self, user_message: UserMessage) -> str:
        """
        Determine user intent from message

        Args:
            user_message: UserMessage object

        Returns:
            Intent string
        """
        message_lower = user_message.message.lower()

        # Check for document upload
        if user_message.file_data or user_message.file_name:
            # Check if they also want full workflow
            if any(word in message_lower for word in ["payout", "cost", "shop", "everything", "full"]):
                return "full_claim_workflow"
            return "process_document"

        # Check for damage estimation
        if any(word in message_lower for word in ["estimate", "cost", "damage", "payout", "deductible", "coverage"]):
            return "estimate_damage"

        # Check for shop finding
        if any(word in message_lower for word in ["shop", "repair", "mechanic", "garage", "recommend"]):
            return "find_shops"

        # Check for claim status
        if any(word in message_lower for word in ["status", "check claim", "my claim"]) and user_message.claim_id:
            return "get_claim_status"

        # Check for claim analysis
        if any(word in message_lower for word in ["analyze", "analysis", "review", "assess"]) and user_message.claim_id:
            return "analyze_claim"

        # Default to general query
        return "general_query"

    def _handle_document_processing(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle document processing with ClaimPilot agent

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse
        """
        # Process document with ClaimPilot
        result = claimpilot_agent.process_document(
            file_data=user_message.file_data,
            file_name=user_message.file_name,
            raw_text=None
        )

        if not result.success:
            return ChatResponse(
                message=f"I couldn't process the document: {result.message}",
                data=result.data
            )

        claim = Claim(**result.data["claim"])
        summary = result.data["summary"]

        # Create friendly response
        message = (
            f"I've successfully processed your {claim.incident_type.lower()} claim!\n\n"
            f"{summary}\n\n"
            f"Would you like me to:\n"
            f"1. Estimate your damage costs and insurance payout?\n"
            f"2. Find recommended repair shops nearby?\n"
            f"3. Both?"
        )

        return ChatResponse(
            message=message,
            claim=claim,
            data=result.data,
            agent_used="ClaimPilot"
        )

    def _handle_damage_estimation(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle damage estimation with FinTrack agent

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse
        """
        # Get claim
        claim = self._get_claim_from_message(user_message)
        if not claim:
            return ChatResponse(
                message="I need a claim to estimate damage. Please upload a claim document first, or provide a claim ID."
            )

        # Estimate damage with FinTrack
        result = fintrack_agent.estimate_damage(claim)

        if not result.success:
            return ChatResponse(
                message=f"I couldn't estimate the damage: {result.message}",
                data=result.data
            )

        estimate = FinancialEstimate(**result.data["estimate"])
        summary = result.data["summary"]

        # Create friendly response
        message = (
            f"Here's your financial breakdown:\n\n"
            f"{summary}\n\n"
            f"📊 Cost Breakdown:\n"
        )

        if estimate.breakdown:
            for category, amount in estimate.breakdown.items():
                if category != "total":
                    message += f"  • {category.replace('_', ' ').title()}: ${amount:,.2f}\n"

        message += f"\nWould you like me to find repair shops for you?"

        return ChatResponse(
            message=message,
            claim=claim,
            financial_estimate=estimate,
            data=result.data,
            agent_used="FinTrack"
        )

    def _handle_shop_finding(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle shop finding with ShopFinder agent

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse
        """
        # Get claim
        claim = self._get_claim_from_message(user_message)
        if not claim:
            return ChatResponse(
                message="I need a claim to find repair shops. Please upload a claim document first, or provide a claim ID."
            )

        # Find shops with ShopFinder
        result = shopfinder_agent.find_shops(claim, max_results=3)

        if not result.success:
            return ChatResponse(
                message=f"I couldn't find repair shops: {result.message}",
                data=result.data
            )

        recommendations = ShopRecommendations(**result.data["recommendations"])
        summary = result.data["summary"]

        # Create friendly response
        message = f"{summary}\n\n📍 Recommended Shops:\n\n"

        for i, shop in enumerate(recommendations.recommended_shops, 1):
            message += f"{i}. {shop.name}\n"
            message += f"   ⭐ Rating: {shop.rating}/5.0\n"
            message += f"   💵 Price: {shop.price_level}\n"
            message += f"   📍 Distance: {shop.distance}\n"
            if shop.phone:
                message += f"   📞 Phone: {shop.phone}\n"
            if shop.estimated_wait_time:
                message += f"   ⏱️  Wait time: {shop.estimated_wait_time}\n"
            message += "\n"

        return ChatResponse(
            message=message,
            claim=claim,
            shop_recommendations=recommendations,
            data=result.data,
            agent_used="ShopFinder"
        )

    def _handle_full_workflow(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle full claim workflow: process document, estimate damage, find shops

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse with all data
        """
        responses = []

        # Step 1: Process document
        claim_result = claimpilot_agent.process_document(
            file_data=user_message.file_data,
            file_name=user_message.file_name
        )

        if not claim_result.success:
            return ChatResponse(
                message=f"I couldn't process the document: {claim_result.message}"
            )

        claim = Claim(**claim_result.data["claim"])
        responses.append(f"✅ Claim processed: {claim.claim_id}")

        # Step 2: Estimate damage
        estimate_result = fintrack_agent.estimate_damage(claim)
        estimate = None
        if estimate_result.success:
            estimate = FinancialEstimate(**estimate_result.data["estimate"])
            responses.append(f"✅ Damage estimated: ${estimate.estimated_damage:,.2f}")

        # Step 3: Find shops
        shops_result = shopfinder_agent.find_shops(claim)
        recommendations = None
        if shops_result.success:
            recommendations = ShopRecommendations(**shops_result.data["recommendations"])
            responses.append(f"✅ Found {len(recommendations.recommended_shops)} repair shops")

        # Create comprehensive response
        message = "I've completed a full analysis of your claim!\n\n"
        message += "\n".join(responses)
        message += f"\n\n📋 **Claim Summary**\n{claim.summary}\n\n"

        if estimate:
            message += (
                f"💰 **Financial Estimate**\n"
                f"Total Damage: ${estimate.estimated_damage:,.2f}\n"
                f"Insurance Pays: ${estimate.payout_after_deductible:,.2f}\n"
                f"Your Deductible: ${estimate.deductible:,.2f}\n\n"
            )

        if recommendations and recommendations.recommended_shops:
            top_shop = recommendations.recommended_shops[0]
            message += (
                f"🔧 **Top Recommended Shop**\n"
                f"{top_shop.name} - ⭐ {top_shop.rating}/5.0\n"
                f"Distance: {top_shop.distance} | Price: {top_shop.price_level}\n"
            )

        return ChatResponse(
            message=message,
            claim=claim,
            financial_estimate=estimate,
            shop_recommendations=recommendations,
            agent_used="All Agents"
        )

    def _handle_claim_status(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle claim status inquiry

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse
        """
        claim = claimpilot_agent.get_claim(user_message.claim_id)
        if not claim:
            return ChatResponse(
                message=f"I couldn't find claim {user_message.claim_id}. Please check the claim ID and try again."
            )

        message = (
            f"📋 **Claim Status: {claim.claim_id}**\n\n"
            f"Status: {claim.status.value}\n"
            f"Type: {claim.incident_type}\n"
            f"Date: {claim.date}\n"
            f"Location: {claim.location}\n\n"
            f"{claim.summary}"
        )

        return ChatResponse(
            message=message,
            claim=claim,
            agent_used="ClaimPilot"
        )

    def _handle_claim_analysis(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle detailed claim analysis

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse
        """
        result = claimpilot_agent.analyze_claim(user_message.claim_id)

        if not result.success:
            return ChatResponse(
                message=result.message
            )

        claim = Claim(**result.data["claim"])
        analysis = result.data["analysis"]

        message = (
            f"📊 **Claim Analysis: {claim.claim_id}**\n\n"
            f"Severity: {analysis['severity']}\n"
            f"Data Completeness: {analysis['completeness']}\n\n"
        )

        if analysis.get("recommended_actions"):
            message += "**Recommended Actions:**\n"
            for action in analysis["recommended_actions"]:
                message += f"  • {action}\n"
            message += "\n"

        if analysis.get("missing_information"):
            message += "**Missing Information:**\n"
            for info in analysis["missing_information"]:
                message += f"  • {info}\n"

        return ChatResponse(
            message=message,
            claim=claim,
            data=result.data,
            agent_used="ClaimPilot"
        )

    def _handle_general_query(self, user_message: UserMessage) -> ChatResponse:
        """
        Handle general queries and help

        Args:
            user_message: UserMessage object

        Returns:
            ChatResponse
        """
        message = (
            "👋 Hi! I'm ClaimPilot AI, your insurance claim assistant.\n\n"
            "I can help you with:\n"
            "1. 📄 Process claim documents (upload a PDF or text file)\n"
            "2. 💰 Estimate damage costs and insurance payouts\n"
            "3. 🔧 Find recommended repair shops nearby\n"
            "4. 📊 Analyze and track your claims\n\n"
            "Just upload a document or ask me a question to get started!"
        )

        return ChatResponse(message=message)

    def _get_claim_from_message(self, user_message: UserMessage) -> Optional[Claim]:
        """
        Extract claim from user message

        Args:
            user_message: UserMessage object

        Returns:
            Claim object or None
        """
        # Check if claim_id is provided
        if user_message.claim_id:
            return claimpilot_agent.get_claim(user_message.claim_id)

        # Check for claim_id in message
        claim_id_match = re.search(r'C-\d{4}-[A-Z0-9]{8}', user_message.message)
        if claim_id_match:
            return claimpilot_agent.get_claim(claim_id_match.group(0))

        # Get most recent claim
        claims = claimpilot_agent.list_claims()
        if claims:
            return claims[0]

        return None

    def get_conversation_history(self) -> List[Dict]:
        """
        Get conversation history

        Returns:
            List of conversation messages
        """
        return self.conversation_history

    def clear_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []


# Singleton instance
orchestrator = ClaimPilotOrchestrator()
