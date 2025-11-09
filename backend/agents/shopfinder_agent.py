"""
ShopFinder Agent - Repair Shop Recommender

Responsibilities:
- Find nearby repair shops based on location
- Rate and rank shops by quality, price, and distance
- Provide contact information and specialties
- Integrate with mapping APIs (Google Maps, etc.)
"""
import random
from typing import List, Optional
from datetime import datetime
from utils.data_models import Claim, RepairShop, ShopRecommendations, AgentResponse


class ShopFinderAgent:
    """
    ShopFinder - Repair Shop Recommendation Agent

    This agent finds and recommends repair shops based on location and incident type.
    """

    def __init__(self):
        self.name = "ShopFinder"
        self.version = "1.0.0"

        # Mock database of repair shops (in production, use Google Maps API or database)
        self.shop_database = {
            "Car Accident": [
                {
                    "name": "Princeton AutoFix",
                    "rating": 4.8,
                    "price_level": "$$",
                    "address": "123 Nassau St, Princeton, NJ 08542",
                    "phone": "(609) 555-0100",
                    "specialties": ["Collision Repair", "Paint", "Body Work"],
                    "estimated_wait_time": "2-3 days"
                },
                {
                    "name": "NJ Collision Works",
                    "rating": 4.6,
                    "price_level": "$",
                    "address": "456 Alexander Rd, Princeton, NJ 08540",
                    "phone": "(609) 555-0200",
                    "specialties": ["Auto Body", "Frame Repair", "Dent Removal"],
                    "estimated_wait_time": "3-5 days"
                },
                {
                    "name": "Elite Auto Restoration",
                    "rating": 4.9,
                    "price_level": "$$$",
                    "address": "789 Route 1, Lawrence, NJ 08648",
                    "phone": "(609) 555-0300",
                    "specialties": ["Luxury Cars", "Collision", "Custom Paint"],
                    "estimated_wait_time": "1 week"
                },
                {
                    "name": "QuickFix Auto Center",
                    "rating": 4.3,
                    "price_level": "$",
                    "address": "321 US-1, Lawrenceville, NJ 08648",
                    "phone": "(609) 555-0400",
                    "specialties": ["Quick Repairs", "Insurance Claims", "Rentals"],
                    "estimated_wait_time": "1-2 days"
                },
                {
                    "name": "Prestige Collision Repair",
                    "rating": 4.7,
                    "price_level": "$$",
                    "address": "654 Quaker Bridge Rd, Hamilton, NJ 08619",
                    "phone": "(609) 555-0500",
                    "specialties": ["Certified Repairs", "All Makes", "Warranty"],
                    "estimated_wait_time": "3-4 days"
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
                    "estimated_wait_time": "1-2 weeks"
                },
                {
                    "name": "Quick Response Restoration",
                    "rating": 4.5,
                    "price_level": "$$",
                    "address": "200 Alexander St, Princeton, NJ 08540",
                    "phone": "(609) 555-1200",
                    "specialties": ["Emergency Service", "24/7", "Insurance"],
                    "estimated_wait_time": "Same day"
                },
                {
                    "name": "Elite Home Repair Services",
                    "rating": 4.8,
                    "price_level": "$$",
                    "address": "300 Route 1, Lawrenceville, NJ 08648",
                    "phone": "(609) 555-1300",
                    "specialties": ["General Repairs", "Roofing", "Plumbing"],
                    "estimated_wait_time": "3-5 days"
                }
            ],
            "Medical": [
                {
                    "name": "Princeton Medical Center",
                    "rating": 4.6,
                    "price_level": "$$$",
                    "address": "1 Plainsboro Rd, Plainsboro, NJ 08536",
                    "phone": "(609) 555-2100",
                    "specialties": ["Emergency Care", "Surgery", "Rehabilitation"],
                    "estimated_wait_time": "ER: immediate, Appointments: 1-2 weeks"
                },
                {
                    "name": "NJ Physical Therapy Center",
                    "rating": 4.7,
                    "price_level": "$$",
                    "address": "500 College Rd, Princeton, NJ 08540",
                    "phone": "(609) 555-2200",
                    "specialties": ["Physical Therapy", "Sports Medicine", "Rehab"],
                    "estimated_wait_time": "2-3 days"
                }
            ]
        }

    def find_shops(
        self,
        claim: Claim,
        max_results: int = 3,
        radius_miles: float = 10.0,
        price_preference: Optional[str] = None
    ) -> AgentResponse:
        """
        Find and recommend repair shops based on claim

        Args:
            claim: Claim object
            max_results: Maximum number of shops to return
            radius_miles: Search radius in miles
            price_preference: Price level preference ("$", "$$", "$$$")

        Returns:
            AgentResponse with shop recommendations
        """
        try:
            # Get shops for this incident type
            shops = self._get_relevant_shops(claim.incident_type)

            if not shops:
                return AgentResponse(
                    agent_name=self.name,
                    success=False,
                    data={},
                    message=f"No repair shops found for {claim.incident_type}"
                )

            # Calculate distances (mock - in production use geolocation API)
            shops_with_distance = self._calculate_distances(shops, claim.location, radius_miles)

            # Filter by price preference if specified
            if price_preference:
                shops_with_distance = [
                    s for s in shops_with_distance
                    if s["price_level"] == price_preference
                ]

            # Rank shops
            ranked_shops = self._rank_shops(shops_with_distance)

            # Select top results
            top_shops = ranked_shops[:max_results]

            # Convert to RepairShop objects
            repair_shops = []
            for shop_data in top_shops:
                repair_shops.append(RepairShop(
                    name=shop_data["name"],
                    rating=shop_data["rating"],
                    price_level=shop_data["price_level"],
                    distance=shop_data["distance"],
                    address=shop_data.get("address"),
                    phone=shop_data.get("phone"),
                    specialties=shop_data.get("specialties", []),
                    estimated_wait_time=shop_data.get("estimated_wait_time")
                ))

            # Create recommendations
            recommendations = ShopRecommendations(
                claim_id=claim.claim_id,
                location=claim.location,
                incident_type=claim.incident_type,
                recommended_shops=repair_shops,
                search_radius_miles=radius_miles
            )

            return AgentResponse(
                agent_name=self.name,
                success=True,
                data={
                    "recommendations": recommendations.model_dump(),
                    "summary": self._generate_summary(recommendations)
                },
                message=f"Found {len(repair_shops)} recommended shops for claim {claim.claim_id}"
            )

        except Exception as e:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"Error finding shops: {str(e)}"
            )

    def _get_relevant_shops(self, incident_type: str) -> List[dict]:
        """
        Get shops relevant to the incident type

        Args:
            incident_type: Type of incident

        Returns:
            List of shop dictionaries
        """
        # Direct match
        if incident_type in self.shop_database:
            return self.shop_database[incident_type].copy()

        # Fallback for similar types
        if "accident" in incident_type.lower() or "vehicle" in incident_type.lower():
            return self.shop_database.get("Car Accident", []).copy()

        if "home" in incident_type.lower() or "property" in incident_type.lower():
            return self.shop_database.get("Home Damage", []).copy()

        # Default to car accident shops
        return self.shop_database.get("Car Accident", []).copy()

    def _calculate_distances(
        self,
        shops: List[dict],
        location: str,
        max_radius: float
    ) -> List[dict]:
        """
        Calculate distances from location to shops (mock implementation)

        Args:
            shops: List of shop dictionaries
            location: Location string
            max_radius: Maximum radius in miles

        Returns:
            List of shops with distance field
        """
        # In production, use Google Maps Distance Matrix API or similar
        # For now, generate mock distances
        shops_with_distance = []

        for shop in shops:
            # Generate random distance within radius
            distance = round(random.uniform(0.5, max_radius), 1)
            shop_copy = shop.copy()
            shop_copy["distance"] = f"{distance} mi"
            shop_copy["distance_value"] = distance  # For sorting
            shops_with_distance.append(shop_copy)

        return shops_with_distance

    def _rank_shops(self, shops: List[dict]) -> List[dict]:
        """
        Rank shops by rating, distance, and price

        Args:
            shops: List of shop dictionaries with distances

        Returns:
            Ranked list of shops
        """
        # Calculate ranking score
        # Formula: (rating * 2) + (1 / distance) + price_score
        price_scores = {"$": 3, "$$": 2, "$$$": 1, "$$$$": 0}

        for shop in shops:
            rating_score = shop["rating"] * 2
            distance_score = 1 / (shop.get("distance_value", 5) + 0.1)  # Avoid division by zero
            price_score = price_scores.get(shop.get("price_level", "$$"), 2)

            shop["rank_score"] = rating_score + distance_score + price_score

        # Sort by rank score (descending)
        shops.sort(key=lambda x: x["rank_score"], reverse=True)

        return shops

    def _generate_summary(self, recommendations: ShopRecommendations) -> str:
        """
        Generate natural language summary of recommendations

        Args:
            recommendations: ShopRecommendations object

        Returns:
            Summary string
        """
        if not recommendations.recommended_shops:
            return "No repair shops found in your area."

        summary_parts = []

        summary_parts.append(
            f"I found {len(recommendations.recommended_shops)} highly-rated repair shops "
            f"near {recommendations.location} for your {recommendations.incident_type.lower()}."
        )

        # Highlight top shop
        top_shop = recommendations.recommended_shops[0]
        summary_parts.append(
            f"My top recommendation is {top_shop.name}, which has a {top_shop.rating} star rating "
            f"and is {top_shop.distance} away."
        )

        if top_shop.specialties:
            summary_parts.append(
                f"They specialize in {', '.join(top_shop.specialties[:2])}."
            )

        if top_shop.estimated_wait_time:
            summary_parts.append(
                f"Estimated wait time: {top_shop.estimated_wait_time}."
            )

        return " ".join(summary_parts)

    def get_shop_details(self, shop_name: str, incident_type: str) -> AgentResponse:
        """
        Get detailed information about a specific shop

        Args:
            shop_name: Name of the shop
            incident_type: Type of incident

        Returns:
            AgentResponse with shop details
        """
        shops = self._get_relevant_shops(incident_type)

        for shop in shops:
            if shop["name"].lower() == shop_name.lower():
                return AgentResponse(
                    agent_name=self.name,
                    success=True,
                    data={"shop": shop},
                    message=f"Details for {shop_name}"
                )

        return AgentResponse(
            agent_name=self.name,
            success=False,
            data={},
            message=f"Shop '{shop_name}' not found"
        )

    def filter_by_specialty(
        self,
        claim: Claim,
        specialty: str,
        max_results: int = 3
    ) -> AgentResponse:
        """
        Find shops with a specific specialty

        Args:
            claim: Claim object
            specialty: Specialty to filter by
            max_results: Maximum number of results

        Returns:
            AgentResponse with filtered shops
        """
        shops = self._get_relevant_shops(claim.incident_type)

        # Filter by specialty
        filtered_shops = []
        for shop in shops:
            specialties = [s.lower() for s in shop.get("specialties", [])]
            if specialty.lower() in " ".join(specialties):
                filtered_shops.append(shop)

        if not filtered_shops:
            return AgentResponse(
                agent_name=self.name,
                success=False,
                data={},
                message=f"No shops found with specialty: {specialty}"
            )

        # Add mock distances and rank
        shops_with_distance = self._calculate_distances(filtered_shops, claim.location, 10.0)
        ranked = self._rank_shops(shops_with_distance)

        return AgentResponse(
            agent_name=self.name,
            success=True,
            data={"shops": ranked[:max_results]},
            message=f"Found {len(ranked[:max_results])} shops with {specialty} specialty"
        )


# Singleton instance
shopfinder_agent = ShopFinderAgent()
