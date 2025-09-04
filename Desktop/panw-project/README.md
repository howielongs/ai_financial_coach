# Dough Dash

**Make spending crystal-clear. Keep your goals on track.**  
Dough Dash turns raw transactions into friendly, actionable coaching—perfect for students and gig workers (yes, including coffee ☕).

---

## Highlights

- **Behavioral Change:** What-If planner with live **On-Track** pill and **$ Saved** counter.
- **Financial Visibility:** Month KPIs, category/merchant breakdowns, 6-month trend, coffee insight, MoM compare.
- **Trust & Security:** **PII scan on upload**, **Privacy Mode** (merchant pseudonyms), in-memory storage for the demo.
- **AI Application:** Rule-based coaching + optional LLM (OpenAI). Anomaly detection via z-score (optional IsolationForest).

---

## Tech Stack

- **Frontend:** React + Vite, Chart.js
- **Backend:** FastAPI (Python), Pandas / NumPy
- **Optional AI/ML:** OpenAI API (LLM coach), scikit-learn (IsolationForest)

---

## Quick Start

### Prereqs
- Python **3.10+**
- Node.js **18+** (or 20+)

### 1) Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt    # or:
# pip install fastapi uvicorn "pydantic>=2" numpy pandas python-multipart python-dotenv
# Optional AI/ML:
# pip install "openai>=1.0.0" scikit-learn

# Optional: enable LLM
# export OPENAI_API_KEY="sk-..."       # macOS/Linux
# setx OPENAI_API_KEY "sk-..."         # Windows (new session needed)

uvicorn app:app --reload
```
### 2) Client
```bash
cd client
# If your API is not the default:
# echo 'VITE_API_URL=http://127.0.0.1:8000/api' > .env.local
npm i
npm run dev
```

