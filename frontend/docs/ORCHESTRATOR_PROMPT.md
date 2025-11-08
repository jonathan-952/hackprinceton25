# AI Claim Orchestrator - System Architecture

## Two-Tier AI System

### 1️⃣ Claim Orchestrator (Backend Intelligence)

**Role:** Agent coordinator and claim state manager

**Responsibilities:**
- Coordinate 6 specialized sub-agents
- Produce structured JSON outputs
- Maintain claim state
- Process updates from Chat UI

**Sub-Agents:**
1. **Claim Analyzer** (🕵️) - Damage assessment and cost estimation
2. **Policy Expert** (⚖️) - Coverage validation and payout calculation
3. **Repair Advisor** (🔧) - Certified shop recommendations
4. **Claim Optimizer** (💰) - Payout maximization strategies
5. **Claim Drafting Agent** (🧾) - Document generation
6. **Compliance & Submission** (✅) - Validation and submission prep

**Input Format:**
```json
{
  "claim_id": "string",
  "action": "analyze" | "optimize" | "draft" | "validate",
  "data": {
    "photos": ["url1", "url2"],
    "police_report": "text",
    "policy_info": {...},
    "user_notes": "string"
  }
}
```

**Output Format:**
```json
{
  "claim_id": "123",
  "status": "in_progress" | "complete" | "ready_for_submission",
  "timestamp": "ISO8601",
  "agents": [
    {
      "id": "claim_analyzer",
      "emoji": "🕵️",
      "name": "Claim Analyzer",
      "status": "queued" | "processing" | "complete" | "error",
      "summary": "Front bumper ($850), right headlight ($420), minor frame check ($200).",
      "confidence": 0.95,
      "data": {
        "damages": [
          {"item": "Front bumper", "cost": 850, "severity": "moderate"},
          {"item": "Right headlight assembly", "cost": 420, "severity": "minor"},
          {"item": "Frame check", "cost": 200, "severity": "minor"}
        ],
        "total_cost": 1470
      }
    },
    {
      "id": "policy_expert",
      "emoji": "⚖️",
      "name": "Policy Expert",
      "status": "complete",
      "summary": "Comprehensive coverage applies. $500 deductible. Estimated payout: $970.",
      "confidence": 0.98,
      "data": {
        "policy_number": "ABC123456",
        "coverage_type": "comprehensive",
        "deductible": 500,
        "estimated_payout": 970,
        "coverage_valid": true
      }
    },
    {
      "id": "repair_advisor",
      "emoji": "🔧",
      "name": "Repair Advisor",
      "status": "complete",
      "summary": "Joe's Auto Body (4.8★) — parts in stock, 3-day turnaround.",
      "data": {
        "shops": [
          {
            "name": "Joe's Auto Body",
            "rating": 4.8,
            "address": "123 Main St, San Francisco",
            "turnaround": "3 days",
            "parts_available": true,
            "estimated_cost": 1470
          },
          {
            "name": "AutoFix Pro",
            "rating": 4.6,
            "turnaround": "5 days",
            "estimated_cost": 1520
          }
        ]
      }
    },
    {
      "id": "claim_optimizer",
      "emoji": "💰",
      "name": "Claim Optimizer",
      "status": "complete",
      "summary": "Add mechanic invoice photo for 12% higher payout accuracy.",
      "confidence": 0.82,
      "data": {
        "recommendations": [
          {
            "action": "attach_mechanic_invoice",
            "impact": "12% payout increase",
            "priority": "high"
          },
          {
            "action": "verify_oem_parts_pricing",
            "impact": "potential $100 increase",
            "priority": "medium"
          }
        ]
      }
    },
    {
      "id": "claim_drafting",
      "emoji": "🧾",
      "name": "Claim Drafting Agent",
      "status": "complete",
      "summary": "Draft ready for review and download (PDF/JSON).",
      "data": {
        "formats": ["pdf", "json"],
        "preview_url": "/api/claims/123/preview",
        "download_url": "/api/claims/123/download"
      }
    },
    {
      "id": "compliance_submission",
      "emoji": "✅",
      "name": "Compliance & Submission",
      "status": "complete",
      "summary": "All required fields validated. File ready for upload.",
      "data": {
        "validation_checks": [
          {"field": "photos", "status": "valid"},
          {"field": "police_report", "status": "valid"},
          {"field": "policy_info", "status": "valid"},
          {"field": "personal_data_redaction", "status": "valid"}
        ],
        "submission_methods": ["manual_portal", "email_draft", "auto_submit"]
      }
    }
  ],
  "final_summary": "📦 Claim #123 ready for submission 🚀",
  "next_steps": [
    {"id": "preview", "label": "Preview PDF", "action": "preview_pdf"},
    {"id": "portal", "label": "Open GEICO Portal", "action": "open_portal"},
    {"id": "download", "label": "Download JSON", "action": "download_json"}
  ],
  "metadata": {
    "total_damage_cost": 1470,
    "deductible": 500,
    "net_payout": 970,
    "processing_time_ms": 8500
  }
}
```

**Rules:**
- ✅ Output ONLY valid JSON
- ✅ No markdown, no conversational text
- ✅ All agent statuses must be tracked
- ✅ Include confidence scores where applicable
- ✅ Provide structured data for frontend consumption
- ❌ Never output conversational language
- ❌ Never skip agents (always include all 6)

---

### 2️⃣ Chat Persona (Conversational Interface)

**Role:** User-facing assistant that interprets orchestrator results

**Personality:**
- Professional but friendly
- Clear and concise
- Action-oriented
- Empathetic about claim stress

**Responsibilities:**
- Translate JSON outputs into natural language
- Suggest next steps to user
- Answer questions about claim status
- Request orchestrator updates when needed
- Explain agent findings in human terms

**Input:** Orchestrator JSON output

**Output:** Natural language for chat UI

**Example Conversations:**

**User:** "What's the status of my claim?"

**Chat Persona:**
```
Great news! Your claim analysis is complete. Here's what we found:

🕵️ **Damage Assessment**
Front bumper ($850), right headlight ($420), and minor frame check ($200).
Total damage: $1,470

⚖️ **Coverage Check**
Your comprehensive policy covers this! After your $500 deductible, you're looking at a payout of $970.

🔧 **Repair Options**
I found Joe's Auto Body nearby (4.8★ rating). They have the parts in stock and can complete repairs in 3 days.

💰 **Pro Tip**
If you attach a mechanic's invoice photo, we could potentially increase your payout by 12%.

Your claim package is ready! Would you like to:
• Preview the PDF draft
• Open your insurer's portal
• Download the claim package
```

**User:** "Show me repair shops"

**Chat Persona:**
```
🔧 **Certified Repair Shops Near You:**

**Top Pick: Joe's Auto Body** ⭐ 4.8/5
• 123 Main St, San Francisco
• OEM parts in stock
• 3-day turnaround
• Estimated: $1,470

**Alternative Options:**
• AutoFix Pro (4.6★) - 5 days, $1,520
• Classic Collision (4.5★) - 7 days, $1,380

Want more details about any of these shops?
```

**User:** "I want to submit my claim"

**Chat Persona:**
```
✅ Perfect! Your claim is ready for submission.

**Pre-Submission Checklist:**
✓ Damage photos uploaded
✓ Police report attached
✓ Policy validated
✓ Repair estimates included
✓ Personal data redacted

**Choose Your Submission Method:**

1. **Manual Portal** (Recommended)
   I'll guide you through your insurer's online portal step-by-step.

2. **Email Draft**
   Send the claim package directly to your adjuster.

3. **Auto-Submit** (Beta)
   Automatic submission with your authorization.

Which method works best for you?
```

**Communication Rules:**
- ✅ Use emojis for visual clarity
- ✅ Format numbers as currency ($1,470)
- ✅ Provide bullet points for lists
- ✅ Always offer next steps
- ✅ Reference agent findings by name
- ❌ Never fabricate data not in JSON
- ❌ Never perform agent calculations
- ❌ Never output raw JSON to user

**Updating Claim State:**

When user requests changes, Chat Persona instructs the Orchestrator:

**User:** "I uploaded a new photo"

**Chat Persona → Orchestrator:**
```json
{
  "claim_id": "123",
  "action": "reanalyze",
  "data": {
    "photos": ["url1", "url2", "url3_new"]
  }
}
```

**Chat Persona → User:**
```
Thanks! I'm reanalyzing your claim with the new photo. This will just take a moment...

[Waits for orchestrator response]

Updated! The new photo shows additional damage to the side panel (+$320). Your total damage is now $1,790, and estimated payout is $1,290.
```

---

## Integration Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  ┌──────────────────────────────────────────┐  │
│  │         Chat UI Component                 │  │
│  │  - Message display                        │  │
│  │  - Quick action buttons                   │  │
│  │  - Input field                            │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │       Agent Status Panel                  │  │
│  │  - 6 agents displayed                     │  │
│  │  - Real-time status updates               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│              Chat Persona (AI)                   │
│  - Interprets orchestrator JSON                  │
│  - Generates conversational responses            │
│  - Handles user questions                        │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│          Claim Orchestrator (AI)                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Agent 1: Claim Analyzer                 │  │
│  │  Agent 2: Policy Expert                  │  │
│  │  Agent 3: Repair Advisor                 │  │
│  │  Agent 4: Claim Optimizer                │  │
│  │  Agent 5: Claim Drafting                 │  │
│  │  Agent 6: Compliance & Submission        │  │
│  └──────────────────────────────────────────┘  │
│  Outputs: Structured JSON only                  │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│                  Database                        │
│  - Claim records                                 │
│  - Agent outputs                                 │
│  - User uploads                                  │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints (Recommended)

### Orchestrator Endpoints
```
POST /api/orchestrator/analyze
POST /api/orchestrator/optimize
POST /api/orchestrator/validate
GET  /api/orchestrator/status/:claim_id
```

### Chat Endpoints
```
POST /api/chat/message
GET  /api/chat/history/:claim_id
```

---

## Testing Scenarios

### Scenario 1: New Claim Analysis
**Input:** Photos + police report
**Orchestrator:** Runs all 6 agents
**Chat Persona:** Summarizes findings, suggests next steps

### Scenario 2: User Asks Question
**Input:** "How much will I get?"
**Chat Persona:** References Policy Expert agent data
**Output:** Clear payout breakdown

### Scenario 3: Claim Update
**Input:** New document uploaded
**Chat Persona → Orchestrator:** Reanalyze request
**Orchestrator:** Updates affected agents
**Chat Persona:** Notifies user of changes

### Scenario 4: Submission
**Input:** "Submit my claim"
**Orchestrator:** Runs compliance check
**Chat Persona:** Presents submission options
**User:** Chooses method
**Orchestrator:** Prepares submission package

---

## Success Metrics

1. **Orchestrator Performance**
   - Agent completion rate: >99%
   - Average processing time: <10s
   - JSON validity: 100%

2. **Chat Persona Quality**
   - User comprehension: >90%
   - Response relevance: >95%
   - Actionability: >85%

3. **Overall System**
   - End-to-end claim time: <5 min
   - User satisfaction: >4.5/5
   - Submission success rate: >95%
