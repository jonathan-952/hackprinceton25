"""
Test script for ClaimPilot AI system
Run this to test the agents without starting the web server
"""
from agents.claimpilot_agent import claimpilot_agent
from agents.fintrack_agent import fintrack_agent
from agents.shopfinder_agent import shopfinder_agent
from orchestrator.coordinator import orchestrator
from utils.data_models import UserMessage


def test_text_claim():
    """Test processing a claim from raw text"""
    print("=" * 80)
    print("TEST 1: Processing Text Claim")
    print("=" * 80)

    sample_text = """
    POLICE ACCIDENT REPORT

    Incident Type: Car Accident
    Date: November 7, 2025
    Location: Nassau Street, Princeton, NJ

    Description:
    A rear-end collision occurred on Nassau Street near the intersection with
    Witherspoon Street. The incident involved two vehicles. The driver of the
    rear vehicle failed to brake in time, resulting in moderate damage to both
    vehicles. The front vehicle sustained bumper damage estimated at $2,500.
    The rear vehicle has damage to the front bumper and hood, estimated at $3,200.

    Parties Involved:
    Driver: John Smith
    Owner: Jane Doe

    No injuries were reported at the scene.
    """

    # Process with ClaimPilot
    result = claimpilot_agent.process_document(raw_text=sample_text)

    if result.success:
        print("\n✅ ClaimPilot processed the document successfully!")
        claim = result.data['claim']
        print(f"\nClaim ID: {claim['claim_id']}")
        print(f"Type: {claim['incident_type']}")
        print(f"Location: {claim['location']}")
        print(f"Confidence: {claim['confidence']}")
        print(f"\nSummary:\n{result.data['summary']}")
        return claim
    else:
        print(f"\n❌ Error: {result.message}")
        return None


def test_financial_estimation(claim_data):
    """Test financial estimation on a claim"""
    print("\n" + "=" * 80)
    print("TEST 2: Financial Estimation")
    print("=" * 80)

    from utils.data_models import Claim
    claim = Claim(**claim_data)

    # Estimate with FinTrack
    result = fintrack_agent.estimate_damage(claim)

    if result.success:
        print("\n✅ FinTrack estimated damage successfully!")
        estimate = result.data['estimate']
        print(f"\nEstimated Damage: ${estimate['estimated_damage']:,.2f}")
        print(f"Insurance Coverage: {estimate['insurance_coverage'] * 100:.0f}%")
        print(f"Your Deductible: ${estimate['deductible']:,.2f}")
        print(f"Insurance Payout: ${estimate['payout_after_deductible']:,.2f}")

        if estimate.get('breakdown'):
            print("\n💰 Cost Breakdown:")
            for category, amount in estimate['breakdown'].items():
                if category != 'total':
                    print(f"  - {category.replace('_', ' ').title()}: ${amount:,.2f}")

        return estimate
    else:
        print(f"\n❌ Error: {result.message}")
        return None


def test_shop_finder(claim_data):
    """Test shop finder on a claim"""
    print("\n" + "=" * 80)
    print("TEST 3: Shop Finder")
    print("=" * 80)

    from utils.data_models import Claim
    claim = Claim(**claim_data)

    # Find shops with ShopFinder
    result = shopfinder_agent.find_shops(claim, max_results=3)

    if result.success:
        print("\n✅ ShopFinder found repair shops!")
        recommendations = result.data['recommendations']

        print(f"\n🔧 Top {len(recommendations['recommended_shops'])} Recommended Shops:\n")

        for i, shop in enumerate(recommendations['recommended_shops'], 1):
            print(f"{i}. {shop['name']}")
            print(f"   ⭐ Rating: {shop['rating']}/5.0")
            print(f"   💵 Price: {shop['price_level']}")
            print(f"   📍 Distance: {shop['distance']}")
            if shop.get('phone'):
                print(f"   📞 Phone: {shop['phone']}")
            if shop.get('estimated_wait_time'):
                print(f"   ⏱️  Wait time: {shop['estimated_wait_time']}")
            print()

        return recommendations
    else:
        print(f"\n❌ Error: {result.message}")
        return None


def test_orchestrator():
    """Test the full orchestration system"""
    print("\n" + "=" * 80)
    print("TEST 4: Orchestrator Full Workflow")
    print("=" * 80)

    # Simulate user message
    user_message = UserMessage(
        message="I need help with a car accident claim. Can you help me?",
        claim_id=None
    )

    response = orchestrator.process_message(user_message)

    print(f"\n🤖 ClaimPilot AI: {response.message}")


def main():
    """Run all tests"""
    print("\n" + "🚀" * 40)
    print("ClaimPilot AI - System Test")
    print("🚀" * 40 + "\n")

    # Test 1: Process claim
    claim = test_text_claim()

    if claim:
        # Test 2: Estimate damage
        estimate = test_financial_estimation(claim)

        # Test 3: Find shops
        shops = test_shop_finder(claim)

    # Test 4: Orchestrator
    test_orchestrator()

    print("\n" + "=" * 80)
    print("✅ All Tests Complete!")
    print("=" * 80)
    print("\nTo start the web server, run:")
    print("  uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print("\nThen open the frontend at http://localhost:3000")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    main()
