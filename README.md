# ClaimPilot AI - Multi-Agent Insurance Claim System

A sophisticated multi-agent orchestration system that streamlines insurance claim processing using three specialized AI agents.

## 🤖 System Architecture

ClaimPilot AI consists of three specialized agents working together:

### 1. **ClaimPilot Agent** - Legal Claim Summarizer
- **Purpose**: Parse and structure insurance documents
- **Capabilities**:
  - PDF & text document processing
  - Extract incident details (type, date, location, parties)
  - Generate natural language summaries
  - Track claim status (Open, Processing, Closed)
  - Confidence scoring for data quality

**Example Output**:
```json
{
  "claim_id": "C-2025-A7B3F892",
  "incident_type": "Car Accident",
  "date": "2025-11-07",
  "location": "Princeton, NJ",
  "estimated_damage": "$3200",
  "confidence": 0.93,
  "status": "Processing",
  "summary": "A rear-end collision on Nassau St caused moderate bumper damage..."
}
```

### 2. **FinTrack Agent** - Damage & Deductible Estimator
- **Purpose**: Calculate financial estimates and insurance payouts
- **Capabilities**:
  - Damage cost estimation based on severity
  - Insurance coverage calculation
  - Deductible computation
  - Cost breakdown by category
  - Compare estimates across severity levels

**Example Output**:
```json
{
  "estimated_damage": 3200.00,
  "insurance_coverage": 0.80,
  "deductible": 640.00,
  "payout_after_deductible": 2560.00,
  "breakdown": {
    "parts": 1920.00,
    "labor": 960.00,
    "paint_and_materials": 320.00
  }
}
```

### 3. **ShopFinder Agent** - Repair Shop Recommender
- **Purpose**: Find and recommend nearby repair shops
- **Capabilities**:
  - Location-based shop search
  - Rating & price-level filtering
  - Specialty matching (collision, paint, etc.)
  - Distance calculation
  - Wait time estimates

**Example Output**:
```json
{
  "recommended_shops": [
    {
      "name": "Princeton AutoFix",
      "rating": 4.8,
      "price_level": "$$",
      "distance": "1.2 mi",
      "specialties": ["Collision Repair", "Paint", "Body Work"],
      "estimated_wait_time": "2-3 days"
    }
  ]
}
```

## 🏗️ Project Structure

```
hackprinceton25/
├── backend/
│   ├── agents/
│   │   ├── claimpilot_agent.py    # Document parser & claim summarizer
│   │   ├── fintrack_agent.py      # Financial estimator
│   │   └── shopfinder_agent.py    # Repair shop recommender
│   ├── orchestrator/
│   │   └── coordinator.py         # Multi-agent coordinator
│   ├── utils/
│   │   ├── data_models.py         # Pydantic models & schemas
│   │   └── pdf_parser.py          # PDF parsing utilities
│   ├── main.py                    # FastAPI application
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── app/
│   │   └── page.tsx               # Next.js chat interface
│   └── package.json               # Node dependencies
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Start the FastAPI server**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Key Endpoints

#### Chat & Processing
- `POST /api/chat` - Main chat interface
- `POST /api/upload` - Upload and process documents
- `POST /api/process-claim` - Process claim from file or text

#### Claim Management
- `GET /api/claims` - List all claims
- `GET /api/claims/{claim_id}` - Get specific claim
- `PUT /api/claims/{claim_id}/status` - Update claim status
- `GET /api/claims/{claim_id}/analysis` - Analyze claim

#### Financial Estimation
- `POST /api/estimate/{claim_id}` - Estimate damage & payout
- `POST /api/compare-estimates/{claim_id}` - Compare severity levels

#### Shop Finder
- `GET /api/shops/{claim_id}` - Find repair shops
- `GET /api/shops/{claim_id}/specialty/{specialty}` - Filter by specialty

## 💬 Usage Examples

### Example 1: Process a Document
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -F "file=@police_report.pdf" \
  -F "message=Please analyze this accident report"
```

### Example 2: Get Financial Estimate
```bash
curl -X POST "http://localhost:8000/api/estimate/C-2025-A7B3F892"
```

### Example 3: Find Repair Shops
```bash
curl -X GET "http://localhost:8000/api/shops/C-2025-A7B3F892?max_results=3"
```

### Example 4: Chat Interface
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you estimate my damage payout?",
    "claim_id": "C-2025-A7B3F892"
  }'
```

## 🎯 User Flow

1. **Upload Document**: User uploads a police report or insurance document
2. **ClaimPilot** processes and structures the claim data
3. **User Request**: "What's my payout?"
4. **FinTrack** estimates damage costs and calculates insurance payout
5. **User Request**: "Find me repair shops"
6. **ShopFinder** recommends nearby shops with ratings and pricing
7. **Result**: User receives complete claim analysis with actionable information

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Data Validation**: Pydantic
- **PDF Processing**: PyPDF2, pdfplumber
- **Server**: Uvicorn

### Frontend
- **Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# Backend
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎨 Features

✅ **Multi-Agent Orchestration** - Seamless coordination between agents
✅ **PDF Document Processing** - Parse police reports & insurance forms
✅ **Financial Estimation** - Calculate damage costs & insurance payouts
✅ **Repair Shop Recommendations** - Find nearby shops with ratings
✅ **Natural Language Interface** - Conversational chat experience
✅ **Real-time Updates** - Live claim status tracking
✅ **Confidence Scoring** - Data quality assessment
✅ **Cost Breakdown** - Detailed financial analysis

## 🔮 Future Enhancements

- [ ] Google Maps API integration for real shop data
- [ ] Machine learning models for damage estimation
- [ ] Image analysis for damage assessment
- [ ] Multi-language support
- [ ] Email/SMS notifications
- [ ] Database persistence (PostgreSQL)
- [ ] Authentication & user management
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)

## 🤝 Contributing

This project was built for HackPrinceton 2025. Contributions are welcome!

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 👥 Team

Built with ❤️ for HackPrinceton 2025

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed: `python --version`
- Install dependencies: `pip install -r backend/requirements.txt`
- Check if port 8000 is available

### Frontend shows connection error
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify API URL in frontend code

### PDF parsing errors
- Install PyPDF2: `pip install PyPDF2`
- Or install pdfplumber: `pip install pdfplumber`
- Ensure uploaded PDFs are not encrypted

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**ClaimPilot AI** - Making insurance claims simple, accurate, and fast. 🚀
