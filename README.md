# ClaimPilot 🚗✨

**AI-Powered Insurance Claim Assistant**

ClaimPilot is an intelligent insurance claim processing platform that uses AI agents to streamline the claim filing process, protect users from self-incrimination, and maximize insurance payouts.

Built for HackPrinceton 2025

---

## 🎯 Problem Statement

Filing an insurance claim is:
- **Confusing** - Most people don't know what to do at an accident scene
- **Risky** - Saying the wrong thing can void your claim or cost thousands
- **Time-consuming** - Manual claim filing takes hours and is error-prone
- **Frustrating** - Finding repair shops, calculating payouts, and dealing with paperwork is overwhelming

## 💡 Our Solution

ClaimPilot provides **two modes** to help users at every stage:

### 1. 🚨 Emergency Chatbot (Immediate Accident Guidance)
For users who just had an accident and need **immediate help**:
- ⚠️ Warns against self-incrimination ("Don't say 'It's okay' or 'I'm fine'")
- 📸 Guides proper documentation (photos, police reports, witness info)
- 🚓 Explains what to tell police (stick to facts, no speculation)
- 💰 Protects your claim value by preventing common mistakes
- 🏥 Advises on medical documentation for injury claims

### 2. 📋 Full Claim Filing (Complete Claim Processing)
For users ready to file a formal claim:
- 🤖 **3 Specialized AI Agents** process your claim automatically
- 📄 Extracts data from police reports, insurance forms, and photos
- 💵 Calculates expected payout and finds best repair shops
- 📝 Generates professional, legally-compliant claim documents
- ⚡ Reduces filing time from hours to **5 minutes**

---

## ✨ Key Features

### Emergency Support
- **Progressive Demo Conversation** - Shows exactly how to handle accident scenes
- **Avoid Self-Incrimination** - Critical warnings about what NOT to say
- **Legal Protection** - Guides users to protect their rights
- **Evidence Collection** - Checklist of what to document at the scene

### AI-Powered Claim Processing
- **ClaimPilot Core Agent** - Extracts 18+ fields from documents (fault determination, incident summary, driver info, police reports)
- **FinTrack Agent** - Calculates damage estimates, insurance payouts, and finds top-rated repair shops with pricing
- **Claim Drafting Agent** - Generates 8-page professional claim documents with legal compliance

### User Experience
- **One-Click Demo Data** - Autofill button for easy presentations
- **Progressive Demos** - Click-to-reveal conversation flows for all chat features
- **Real-time Status Updates** - Shows next steps and decision points
- **Intuitive UI** - Clean, professional design with color-coded sections

---

## 🏗️ Architecture

### Frontend (Next.js 14 + TypeScript)
```
frontend/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/                  # User dashboard
│   ├── claim/[id]/                 # Claim details view
│   ├── claims/new/                 # Multi-step claim form
│   └── emergency-chat/             # Emergency chatbot
├── components/
│   ├── claims/
│   │   ├── agent-card.tsx          # Individual agent UI with demos
│   │   ├── chat-panel.tsx          # AI assistant with progressive demo
│   │   ├── claim-progress-flow.tsx # Status tracker with next steps
│   │   └── orchestrator-panel.tsx  # Agent orchestration
│   └── ui/                         # Shadcn/ui components
└── types/
    ├── claim.ts                    # Claim data types
    └── agent.ts                    # Agent types
```

### Backend (FastAPI + Python)
```
backend/
├── agents/
│   ├── core_agent.py               # Document extraction & analysis
│   ├── fintrack_agent.py           # Cost estimation & shop finder
│   └── drafting_agent.py           # Professional document generation
├── api/
│   ├── claims.py                   # Claim CRUD endpoints
│   ├── chat.py                     # Gemini AI chat integration
│   └── orchestrator.py             # Agent coordination
└── models/
    └── claim.py                    # Database models
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **Google Gemini API Key** (for AI chat)

### 1. Clone the Repository
```bash
git clone https://github.com/jonathan-952/hackprinceton25.git
cd hackprinceton25
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run the backend
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## 🎮 Demo Features

### Autofill Demo Data
Click the **"✨ Autofill Demo Data"** button on the claim form to instantly populate:
- **Incident**: 11/08/2025 rear-end collision at Princeton Junction
- **Vehicle**: 2022 Honda Accord EX-L (NJC-4927)
- **Insurance**: State Farm, $500 deductible
- **Police Report**: NJPR-5574-110825, Officer Daniel Ruiz
- **Witness**: Sarah Lopez with contact info

### Progressive Chat Demos
All chat interfaces feature **progressive demos** - click the demo button to reveal the conversation one message at a time:

**Emergency Chatbot Demo (9 messages)**:
1. Initial greeting
2. User panics after accident
3. Immediate safety checklist
4. **Self-incrimination warning** (don't say "it's okay"!)
5. What to document and why
6. Info to collect from other driver
7. How ClaimPilot helps maximize payout
8. Police arrival - what to say
9. Evidence collection checklist

**AI Assistant Demo (5 messages)**:
1. Capabilities overview
2. Repair shop recommendations with ratings/pricing
3. Out-of-pocket cost breakdown
4. Subrogation advice for deductible recovery

### Agent Demos
Each agent has a **"✨ Show Demo Example"** button that displays impressive mock results:

**ClaimPilot Core**: 18 extracted fields including fault determination, police report analysis, witness info

**FinTrack**: $3,750 payout calculation + 3 repair shops with ratings, pricing, turnaround times

**Claim Drafting**: 8-page PDF with 5 sections (Incident Details, Damage Assessment, Cost Breakdown, Legal Compliance, Evidence)

---

## 🤖 The 3-Agent System

### 1. ClaimPilot Core Agent
**Purpose**: Document analysis and data extraction

**Capabilities**:
- Extracts 18+ key fields from uploaded documents
- Determines fault based on police reports and evidence
- Analyzes incident in human-readable format
- Identifies witnesses and critical evidence
- Structures raw data for other agents

**Demo Output**:
```
✓ Successfully Extracted All Data
18 key fields identified with high confidence

⚖️ Fault Determination
Other driver at fault
Police: "Other driver failed to brake, rear-ended claimant at red light"

📋 What Happened
Vehicle was stopped at red light when struck from behind...
```

### 2. FinTrack Agent
**Purpose**: Cost estimation and repair shop recommendations

**Capabilities**:
- Calculates damage estimates using historical data
- Determines insurance payout (damage - deductible)
- Finds nearby certified repair shops
- Compares shops by rating, price, turnaround time
- Verifies in-network status with insurance

**Demo Output**:
```
Estimated Payout: $3,750
(Damage: $4,250 - Deductible: $500)

🔧 Top Repair Shops:
1. Princeton Auto Body - 4.8⭐ - $3,900 - 5 days - 1.2mi
2. Elite Collision Center - 4.9⭐ - $4,100 - 4 days - 2.5mi
3. NJ Certified Repairs - 4.7⭐ - $3,850 - 6 days - 3.1mi
```

### 3. Claim Drafting Agent
**Purpose**: Professional document generation

**Capabilities**:
- Creates legally-compliant claim documents
- Includes all extracted data and evidence
- Formats for insurance company submission
- Generates downloadable PDF (8 pages)
- Ensures all required sections are present

**Demo Output**:
```
✓ Professional Claim Document Generated
8 pages • Ready for submission

Sections:
• Incident Details
• Damage Assessment
• Cost Breakdown
• Legal Compliance
• Supporting Evidence
```

---

## 📊 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Hooks
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **AI**: Google Gemini API
- **Database**: SQLite (development)
- **Document Processing**: PyPDF2, python-multipart
- **API Docs**: OpenAPI/Swagger (auto-generated)

### DevOps
- **Version Control**: Git + GitHub
- **Package Management**: npm + pip
- **Development**: Hot reload on both frontend and backend

---

## 🎨 UI/UX Design Philosophy

### Color Palette
- **Professional & Clean**: White backgrounds with subtle colored accents
- **Color-Coded Sections**: Blue (dates), Purple (location), Orange (vehicle), Green (insurance)
- **Status Indicators**: Green (complete), Yellow (running), Gray (idle), Red (error)

### Typography
- **Bold Headers**: Important information stands out
- **Readable Body**: Gray-800/900 for excellent contrast
- **Hierarchical**: Font sizes guide user attention

### Layout Principles
- **Mobile-First**: Responsive grid layouts
- **Progressive Disclosure**: Expandable sections to reduce clutter
- **Visual Hierarchy**: Most important actions are largest and most prominent
- **Feedback**: Loading states, animations, and progress indicators

---

## 🔌 API Endpoints

### Claims
```
POST   /api/claims              Create new claim
GET    /api/claims              List all claims
GET    /api/claims/{id}         Get claim details
PATCH  /api/claims/{id}         Update claim
DELETE /api/claims/{id}         Delete claim
```

### Agents
```
POST   /api/claims/{id}/extract          Run Core Agent
POST   /api/estimate/{id}                Run FinTrack Agent
GET    /api/shops/{id}                   Get repair shops
POST   /api/claims/{id}/draft            Run Drafting Agent
```

### Chat
```
POST   /api/chat                Send message to AI assistant
GET    /api/claims/{id}/messages Get chat history
```

---

## 📁 Project Structure

```
hackprinceton25/
├── frontend/                   # Next.js frontend
│   ├── app/                    # App router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   ├── public/                 # Static assets
│   └── types/                  # TypeScript types
├── backend/                    # FastAPI backend
│   ├── agents/                 # AI agent implementations
│   ├── api/                    # API routes
│   ├── models/                 # Database models
│   └── main.py                 # App entry point
└── README.md                   # This file
```

---

## 🎓 What We Learned

### Technical Challenges
1. **Progressive Demo Implementation** - Building click-to-reveal conversations required careful state management
2. **Agent Orchestration** - Coordinating 3 agents with dependencies while maintaining UI responsiveness
3. **Color Balance** - Finding the right balance between "eye-catching" and "professional"
4. **Demo Data** - Creating realistic, comprehensive demo data that showcases all features

### Key Insights
1. **Self-Incrimination is Real** - People commonly say things at accident scenes that void their claims
2. **Guidance Matters** - Users need specific, actionable next steps, not vague instructions
3. **Progressive Disclosure Works** - Showing information gradually reduces overwhelm
4. **Demos Sell Features** - One-click demos are crucial for hackathon presentations

---

## 🚀 Future Enhancements

### v2.0 Planned Features
- [ ] Real AI document processing (OCR + LLM)
- [ ] Multi-language support (Spanish, Mandarin)
- [ ] Mobile app (React Native)
- [ ] Voice-guided accident assistance
- [ ] Photo damage assessment using computer vision
- [ ] Direct insurance company API integrations
- [ ] Blockchain-verified claim records
- [ ] Real-time lawyer consultation matching

### Nice-to-Haves
- [ ] SMS/WhatsApp bot for emergency guidance
- [ ] Dashboard analytics for claim success rates
- [ ] Automated police report retrieval
- [ ] Integration with medical records for injury claims
- [ ] Peer-to-peer claim advice community

---

## 👥 Team

Built with ❤️ at HackPrinceton 2025

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - AI chat capabilities
- **Shadcn/ui** - Beautiful, accessible UI components
- **Next.js Team** - Amazing React framework
- **FastAPI** - Lightning-fast Python web framework
- **HackPrinceton** - For the amazing hackathon experience!

---

<div align="center">

**⭐ Star this repo if ClaimPilot helped you! ⭐**

Made with 💙 at HackPrinceton 2025

</div>
