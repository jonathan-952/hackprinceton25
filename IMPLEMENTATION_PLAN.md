# ClaimPilot Enhancement Implementation Plan

## Project Overview
Enhancing ClaimPilot with:
1. Multi-step claim creation form
2. Real Gemini AI chat integration
3. Interactive orchestrator agents with manual triggers
4. Persistent chat history in Supabase
5. Demo claim data

---

## ✅ Completed Tasks

### 1. Core Infrastructure
- [x] Created Gemini API client (`frontend/lib/gemini.ts`)
- [x] Created Supabase client for frontend (`frontend/lib/supabase.ts`)
- [x] Added Supabase dependency to package.json
- [x] Created `.env.local` with API keys
- [x] Updated database schema with `chat_messages` table

### 2. Agent Logic Modules
- [x] FinTrack agent (`frontend/lib/agents/fintrack.ts`)
  - Damage estimation logic
  - Payout calculation
  - Severity detection
  - Estimate comparison

- [x] Repair Advisor agent (`frontend/lib/agents/repair-advisor.ts`)
  - Mock shop database
  - Shop finder logic
  - Recommendations with reasoning
  - Specialty filtering

- [x] Compliance agent (`frontend/lib/agents/compliance.ts`)
  - Validation logic
  - Required field checking
  - Next steps generation
  - Completion percentage

---

## 🚧 Remaining Tasks

### Task 1: Multi-Step Claim Creation Form
**Priority: HIGH**

**Files to Create:**
- `frontend/app/claims/new/page.tsx` - Main form page
- `frontend/components/claim-form/StepIndicator.tsx` - Progress indicator
- `frontend/components/claim-form/Step1Incident.tsx` - Incident info
- `frontend/components/claim-form/Step2Vehicle.tsx` - Vehicle info
- `frontend/components/claim-form/Step3Insurance.tsx` - Insurance info
- `frontend/components/claim-form/Step4Damage.tsx` - Damage info
- `frontend/components/claim-form/Step5PoliceReport.tsx` - Police report
- `frontend/components/claim-form/Step6Documents.tsx` - Document upload

**Form Fields:**
```typescript
interface ClaimFormData {
  // Step 1: Incident
  incident_date: string;
  incident_time: string;
  location: string;
  incident_description: string;
  incident_type: string;

  // Step 2: Vehicle
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  license_plate: string;
  vin?: string;

  // Step 3: Insurance
  insurance_provider: string;
  policy_number: string;
  coverage_type: string;
  deductible: number;

  // Step 4: Damage
  damage_description: string;
  damage_severity: 'minor' | 'moderate' | 'severe';
  photos?: File[];

  // Step 5: Police Report
  police_called: boolean;
  police_report_number?: string;
  officer_name?: string;
  witness_info?: string;

  // Step 6: Documents
  documents: File[];
}
```

**Features:**
- Stepper UI with 6 steps
- Form validation per step
- "Back" and "Continue" buttons
- Draft saving to localStorage
- Final submission creates claim in DB

---

### Task 2: Real Gemini Chat Integration
**Priority: HIGH**

**Files to Modify:**
- `frontend/app/claim/[id]/page.tsx` - Update chat logic
- Create: `frontend/app/api/chat/route.ts` - API route for chat

**Implementation:**
```typescript
// Update handleSend in claim/[id]/page.tsx
const handleSend = async () => {
  // 1. Save user message to Supabase
  await saveChatMessage({
    claim_id: claimId,
    role: 'user',
    content: input
  });

  // 2. Build conversation history from Supabase
  const history = await loadChatHistory(claimId);

  // 3. Call Gemini API
  const gemini = getGeminiClient();
  const result = await gemini.chat(input, history, claimContext);

  // 4. Save assistant response
  await saveChatMessage({
    claim_id: claimId,
    role: 'assistant',
    content: result.response
  });

  // 5. Handle actions (trigger agents, update claim)
  if (result.action === 'trigger_agent') {
    await triggerAgent(result.actionData.agent, claimId);
  }
};
```

**Features:**
- Context-aware responses with full claim data
- Persistent chat history in Supabase
- Action detection (trigger agents, update fields)
- Typing indicators
- Auto-scroll to latest message

---

### Task 3: Interactive Orchestrator Agent Cards
**Priority: HIGH**

**Files to Create:**
- `frontend/components/agents/AgentCard.tsx` - Reusable agent card
- `frontend/components/agents/ClaimPilotCard.tsx` - Core agent
- `frontend/components/agents/FinTrackCard.tsx` - Financial agent
- `frontend/components/agents/RepairAdvisorCard.tsx` - Shop finder
- `frontend/components/agents/ClaimDraftingCard.tsx` - Drafting agent
- `frontend/components/agents/ComplianceCard.tsx` - Validation agent

**Files to Modify:**
- `frontend/app/claim/[id]/page.tsx` - Add orchestrator tab

**Agent Card Structure:**
```typescript
interface AgentCardProps {
  name: string;
  icon: string;
  description: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  output?: any;
  onRun: () => Promise<void>;
  onRerun?: () => Promise<void>;
}
```

**Features:**
- Manual "Run Agent" buttons
- Status indicators (Idle/Running/Complete)
- Collapsible output display
- JSON syntax highlighting
- Dependency indicators
- Re-run capability

---

### Task 4: Create API Routes
**Priority: HIGH**

**Files to Create:**
- `frontend/app/api/agents/fintrack/route.ts`
- `frontend/app/api/agents/repair-advisor/route.ts`
- `frontend/app/api/agents/compliance/route.ts`
- `frontend/app/api/agents/claim-drafting/route.ts`

**Example Route:**
```typescript
// app/api/agents/fintrack/route.ts
import { calculatePayout } from '@/lib/agents/fintrack';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = calculatePayout(body);
  return Response.json(result);
}
```

---

### Task 5: Create Demo Claim Data
**Priority: MEDIUM**

**File to Create:**
- `backend/seed_demo_data.sql` - Insert demo claim

**Demo Claim:**
- Claim ID: `C-DEMO-2025`
- Type: Rear-end collision
- Status: Processing
- All agents pre-run with outputs
- Chat history with 3-4 sample messages

---

### Task 6: Update Dashboard
**Priority: MEDIUM**

**Files to Modify:**
- `frontend/app/dashboard/page.tsx` - Update "New Claim" button

**Changes:**
- Replace upload modal with navigation to `/claims/new`
- Show demo claim at top of list
- Add claim type filter

---

### Task 7: UI Enhancements
**Priority: LOW**

**Components to Create:**
- `frontend/components/ui/Badge.tsx` - Status badges
- `frontend/components/ui/Card.tsx` - Card component
- `frontend/components/ui/Button.tsx` - Button variants
- `frontend/components/ui/Input.tsx` - Form inputs
- `frontend/components/ui/Select.tsx` - Dropdowns

---

## File Structure (After Implementation)

```
frontend/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts
│   │   └── agents/
│   │       ├── fintrack/
│   │       │   └── route.ts
│   │       ├── repair-advisor/
│   │       │   └── route.ts
│   │       ├── compliance/
│   │       │   └── route.ts
│   │       └── claim-drafting/
│   │           └── route.ts
│   ├── claims/
│   │   └── new/
│   │       └── page.tsx
│   ├── claim/
│   │   └── [id]/
│   │       └── page.tsx (MODIFIED)
│   ├── dashboard/
│   │   └── page.tsx (MODIFIED)
│   └── page.tsx
├── components/
│   ├── agents/
│   │   ├── AgentCard.tsx
│   │   ├── ClaimPilotCard.tsx
│   │   ├── FinTrackCard.tsx
│   │   ├── RepairAdvisorCard.tsx
│   │   ├── ClaimDraftingCard.tsx
│   │   └── ComplianceCard.tsx
│   ├── claim-form/
│   │   ├── StepIndicator.tsx
│   │   ├── Step1Incident.tsx
│   │   ├── Step2Vehicle.tsx
│   │   ├── Step3Insurance.tsx
│   │   ├── Step4Damage.tsx
│   │   ├── Step5PoliceReport.tsx
│   │   └── Step6Documents.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── lib/
│   ├── agents/
│   │   ├── fintrack.ts (DONE)
│   │   ├── repair-advisor.ts (DONE)
│   │   └── compliance.ts (DONE)
│   ├── gemini.ts (DONE)
│   └── supabase.ts (DONE)
└── .env.local (DONE)

backend/
├── setup_database.sql (MODIFIED - added chat_messages)
└── seed_demo_data.sql (TO CREATE)
```

---

## Testing Checklist

### Multi-Step Form
- [ ] Can navigate through all 6 steps
- [ ] Form validation works per step
- [ ] Back button doesn't lose data
- [ ] Draft saves to localStorage
- [ ] Final submission creates claim in DB
- [ ] Redirects to claim details page

### Gemini Chat
- [ ] Chat connects to Gemini API
- [ ] Responses are context-aware
- [ ] Messages persist in Supabase
- [ ] Can trigger agents from chat
- [ ] Can update claim fields
- [ ] Typing indicators work
- [ ] Auto-scroll works

### Orchestrator Agents
- [ ] FinTrack calculates payout correctly
- [ ] Repair Advisor finds shops
- [ ] Compliance validates fields
- [ ] Agent cards show status
- [ ] Output displays correctly
- [ ] Can re-run agents
- [ ] Status persists across page refreshes

### Demo Claim
- [ ] Demo claim appears in dashboard
- [ ] All agent outputs visible
- [ ] Chat history loaded
- [ ] Can interact with demo claim

---

## Environment Variables Needed

```bash
# Frontend (.env.local)
NEXT_PUBLIC_GEMINI_API_KEY=<your-key>
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
GEMINI_API_KEY=<your-key>
NEXT_PUBLIC_SUPABASE_URL=<your-url>
SUPABASE_API_KEY=<service-role-key>
```

---

## Next Steps

1. Install frontend dependencies: `cd frontend && npm install`
2. Implement multi-step claim form
3. Integrate Gemini chat with Supabase persistence
4. Build agent card components
5. Create API routes for agents
6. Seed demo data
7. Test end-to-end
8. Deploy!
