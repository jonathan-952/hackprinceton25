# ClaimPilot AI - Multi-Agent Insurance Claim System

Your calm, intelligent assistant for managing insurance claims with AI-powered automation.

## 🎯 System Overview

ClaimPilot is a comprehensive multi-agent AI system designed to simplify and automate insurance claim processing. The system consists of:

### Frontend (Next.js)
- **Landing Page** - Marketing page introducing ClaimPilot
- **Claims Dashboard** - View and manage all your claims
- **Claim Details Page** - Dual-pane interface with:
  - **Left Panel**: Claim metadata, AI agent progress, live status timeline
  - **Right Panel**: ChatUI for conversational interaction with ClaimPilot

### Backend (FastAPI)
Multi-agent orchestration system with 5 specialized AI agents:

1. **ClaimPilot (Core)** - Document parsing and claim extraction
2. **FinTrack** - Financial estimation and payout calculation
3. **ShopFinder** - Repair shop recommendations
4. **Claim Drafting** - Formal claim document generation
5. **ComplianceCheck** - Validation and submission readiness

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 📋 Features

### 1. Document Processing
- Upload police reports, insurance forms, or accident details
- AI automatically extracts key information:
  - Incident type and date
  - Location and parties involved
  - Damage descriptions
  - Financial estimates

### 2. Financial Analysis
- Automatic damage cost estimation
- Insurance coverage calculation
- Deductible computation
- Detailed cost breakdowns (parts, labor, materials)

### 3. Shop Recommendations
- Find top-rated repair shops nearby
- Filter by specialty, price, and ratings
- View wait times and contact information

### 4. Claim Drafting
- Generate professional claim documents
- HTML and PDF format support
- Include all necessary details for submission

### 5. Compliance Validation
- Verify all required fields are present
- Check data quality and completeness
- Detect and flag PII exposure
- Ensure submission readiness

### 6. Conversational AI
- Chat with ClaimPilot about your claim
- Get status updates in plain English
- Ask questions and receive helpful guidance
- Empathetic and supportive tone

## 🏗️ Architecture

### Multi-Agent Workflow

```
User Upload Document
       ↓
   ClaimPilot (Core)
   - Parses document
   - Extracts data
       ↓
    FinTrack
   - Estimates damage
   - Calculates payout
       ↓
   ShopFinder
   - Finds repair shops
   - Recommends options
       ↓
  Claim Drafting
   - Generates formal document
       ↓
 ComplianceCheck
   - Validates all fields
   - Checks submission readiness
       ↓
   Ready for Submission!
```

### Agent Status Tracking

Each claim tracks the status of all agents:
- **Pending** - Not yet started
- **In Progress** - Currently processing
- **Complete** - Successfully finished
- **Error** - Encountered an issue

## 🔌 API Endpoints

### Claim Management
- `GET /api/claims` - List all claims
- `GET /api/claims/{claim_id}` - Get specific claim
- `PUT /api/claims/{claim_id}/status` - Update claim status
- `GET /api/claims/{claim_id}/analysis` - Get detailed analysis

### Agent Operations
- `GET /api/claims/{claim_id}/agent-status` - Get agent status
- `POST /api/process-full-claim` - Process with all agents
- `POST /api/claims/{claim_id}/draft` - Generate claim draft
- `POST /api/claims/{claim_id}/compliance-check` - Run compliance check

### Chat & Conversation
- `POST /api/chat` - Send message to ClaimPilot
- `POST /api/upload` - Upload and process document
- `GET /api/conversation/history` - Get conversation history

### Financial & Shop Services
- `POST /api/estimate/{claim_id}` - Get financial estimate
- `GET /api/shops/{claim_id}` - Find repair shops

## 🎨 User Interface

### Landing Page
- Hero section with CTA
- Feature cards explaining capabilities
- How it works section
- Footer with branding

### Claims Dashboard
- Welcome header with user name
- "New Claim" button for uploads
- Claims grouped by status:
  - **In Progress** - Active claims
  - **Completed** - Closed claims
- Click any claim to view details

### Claim Details Page (Dual-Pane)

**Left Panel:**
- Claim metadata (date, location, damage)
- AI Agent Collaboration section showing:
  - ClaimPilot status
  - FinTrack status
  - Claim Drafting status
  - ComplianceCheck status
- Live Claim Status timeline with events

**Right Panel:**
- Chat interface with ClaimPilot
- Message history
- Input field for questions
- Real-time responses

## 💡 Example Usage

### Creating a New Claim

1. Go to Dashboard
2. Click "New Claim"
3. Upload police report or insurance form (PDF/TXT)
4. Click "Start Processing"
5. System runs all agents automatically
6. View results in Claim Details page

### Chatting with ClaimPilot

```
User: "What's the current status of my claim?"
ClaimPilot: "Your claim is being processed. The damage assessment
shows $1,470 and coverage applies with a $500 deductible."

User: "Can you recommend repair shops?"
ClaimPilot: "Sure! I've found 3 top-rated shops near you.
Joe's Auto Body has the best ratings with a 3-day turnaround."

User: "Is my claim ready to submit?"
ClaimPilot: "Yes! I've completed the compliance check. Your claim
has a 95% completeness score and all required fields are present."
```

## 🔧 Configuration

### Backend Configuration
Edit `backend/main.py` for:
- CORS settings
- Port configuration
- Database connections (currently in-memory)

### Frontend Configuration
Edit `frontend/app/*/page.tsx` for:
- API endpoint URLs
- Styling and themes
- User settings

## 📊 Agent Details

### ClaimPilot Agent
- **File**: `backend/agents/claimpilot_agent.py`
- **Purpose**: Parse documents and extract claim data
- **Output**: Structured claim with confidence score

### FinTrack Agent
- **File**: `backend/agents/fintrack_agent.py`
- **Purpose**: Estimate costs and calculate payouts
- **Output**: Financial breakdown with deductible

### ShopFinder Agent
- **File**: `backend/agents/shopfinder_agent.py`
- **Purpose**: Recommend repair shops
- **Output**: List of shops with ratings and details

### Claim Drafting Agent
- **File**: `backend/agents/claim_drafting_agent.py`
- **Purpose**: Generate formal claim documents
- **Output**: HTML claim draft

### Compliance Agent
- **File**: `backend/agents/compliance_agent.py`
- **Purpose**: Validate and check submission readiness
- **Output**: Validation results and recommendations

## 🎯 AI Orchestrator

The orchestrator (`backend/orchestrator/coordinator.py`) coordinates all agents:
- Routes user messages to appropriate agents
- Manages agent status tracking
- Handles multi-agent workflows
- Provides conversational responses

## 🛠️ Development

### Adding a New Agent

1. Create agent file in `backend/agents/`
2. Implement `process()` method returning `AgentResponse`
3. Add import to `backend/agents/__init__.py`
4. Register in orchestrator
5. Add API endpoints in `backend/main.py`
6. Update frontend to display results

### Customizing Chat Responses

Edit `orchestrator/coordinator.py`:
- Modify `_handle_general_query()` for greetings
- Update intent detection in `_determine_intent()`
- Customize response formatting

## 📝 Data Models

### Claim
```python
{
  "claim_id": "C-2025-ABC12345",
  "incident_type": "Car Accident",
  "date": "2025-01-15",
  "location": "Highway 101",
  "status": "Processing",
  "estimated_damage": "$1,470",
  "summary": "Rear-end collision...",
  ...
}
```

### Agent Status
```python
{
  "ClaimPilot": "Complete",
  "FinTrack": "Complete",
  "ClaimDrafting": "Pending",
  "ComplianceCheck": "Pending"
}
```

## 🚨 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (needs 3.11+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:8000`
- Check CORS settings in `backend/main.py`
- Look for errors in browser console

### File upload fails
- Check file format (PDF or TXT only)
- Verify file size (< 10MB recommended)
- Check backend logs for parsing errors

## 🌟 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Real-time WebSocket updates
- [ ] PDF generation for claim drafts
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 📄 License

MIT License - Feel free to use and modify for your projects!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check the troubleshooting section
- Review API documentation

---

**Built with ❤️ using Claude AI, FastAPI, Next.js, and Tailwind CSS**
