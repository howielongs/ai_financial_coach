# Dough Dash API Documentation

Base URL: `http://localhost:8000/api`

## Data Upload & Management

### `POST /upload`
Upload CSV file for analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Body: CSV file with columns: `date`, `merchant`, `amount`

**Response:**
```json
{
  "ok": true,
  "rows": 150,
  "version": 2
}
```

**Errors:**
- `400` - Invalid CSV format or PII detected
- `400` - Missing required columns

### `POST /reset`
Reset to sample data for demo purposes.

**Response:**
```json
{
  "ok": true,
  "rows": 120,
  "version": 3
}
```

### `POST /clear`
Clear all transaction data from memory.

**Response:**
```json
{
  "ok": true,
  "rows": 0,
  "version": 4
}
```

## Core Analytics

### `GET /summary`
Get monthly spending breakdown and top merchants.

**Query Params:**
- `privacy` (boolean): Hash merchant names for privacy

**Response:**
```json
{
  "period": "2024-09",
  "total_expense_month": 1250.45,
  "by_category": {
    "Groceries": 345.67,
    "Dining": 234.12,
    "Coffee": 89.45
  },
  "top_merchants": {
    "SAFEWAY": 234.56,
    "STARBUCKS": 67.89
  },
  "coffee": {
    "coffee_spend": 89.45,
    "message": "You've spent $89.45 on coffee in 2024-09..."
  },
  "privacy": false
}
```

### `GET /trends`
Get multi-month spending trends by category.

**Query Params:**
- `months` (int): Number of months to analyze (2-24, default: 6)

**Response:**
```json
{
  "months": ["2024-04", "2024-05", "2024-06", "2024-07", "2024-08", "2024-09"],
  "totals": [1100.23, 1245.67, 1189.45, 1356.78, 1289.12, 1250.45],
  "by_category": {
    "Groceries": [300, 320, 315, 340, 330, 345.67],
    "Dining": [200, 220, 180, 250, 210, 234.12]
  }
}
```

### `GET /subscriptions`
Detect recurring charges across months.

**Query Params:**
- `privacy` (boolean): Hash merchant names

**Response:**
```json
[
  {
    "merchant": "NETFLIX",
    "charge": 15.49,
    "months": "2024-07, 2024-08, 2024-09",
    "count": 3
  },
  {
    "merchant": "SPOTIFY",
    "charge": 9.99,
    "months": "2024-06, 2024-07, 2024-08, 2024-09",
    "count": 4
  }
]
```

### `GET /anomalies`
Find unusual transactions using z-score analysis.

**Query Params:**
- `privacy` (boolean): Hash merchant names

**Response:**
```json
[
  {
    "date": "2024-09-15",
    "merchant": "TARGET",
    "amount": 450.0,
    "z_score": 3.2
  }
]
```

### `GET /anomalies_ml`
ML-based anomaly detection using IsolationForest.

**Response:**
```json
{
  "available": true,
  "anomalies": [
    {
      "date": "2024-09-10",
      "merchant": "UBER",
      "amount": 120.0,
      "score": -0.15
    }
  ]
}
```

## Goal Planning & Forecasting

### `GET /forecast`
Calculate goal achievement forecast.

**Query Params:**
- `income_monthly` (float): Monthly income (default: 1800)
- `goal_amount` (float): Savings goal (default: 3000)
- `months_to_goal` (int): Timeline in months (default: 10)

**Response:**
```json
{
  "on_track": false,
  "surplus": 549.55,
  "gap": 510.5,
  "need_per_month": 51.05,
  "message": "Need about $51/mo to hit $3,000 in 10 months."
}
```

### `GET /compare`
Compare current vs previous month with suggestions.

**Query Params:**
- Same as `/forecast`

**Response:**
```json
{
  "period": "2024-09",
  "delta_overall": 38.67,
  "this_month_total": 1250.45,
  "prev_month_total": 1289.12,
  "categories": [
    {
      "category": "Dining",
      "this_month": 234.12,
      "prev_month": 210.45,
      "delta": 23.67
    }
  ],
  "needed_per_month": 51.05,
  "suggestions": [
    {
      "category": "Dining",
      "current": 234.12,
      "suggested_cut": 46.82
    }
  ],
  "forecast": { /* same as /forecast */ }
}
```

### `POST /whatif`
Model "what-if" spending cuts scenario.

**Request Body:**
```json
{
  "cuts": {
    "Dining": 60,
    "Coffee": 20
  }
}
```

**Query Params:**
- Same as `/forecast`

**Response:**
```json
{
  "period": "2024-09",
  "current_expense": 1250.45,
  "new_expense": 1170.45,
  "applied": {
    "Dining": 60.0,
    "Coffee": 20.0
  },
  "forecast": {
    "on_track": true,
    "surplus": 629.55,
    "gap": 0.0,
    "need_per_month": 0.0,
    "message": "You're on track!"
  }
}
```

## AI Coaching

### `GET /coach`
Get AI-powered financial coaching insights.

**Query Params:**
- Same as `/forecast` plus:
- `privacy` (boolean): Enable privacy mode

**Response:**
```json
{
  "llm_note": "Based on your September spending of $1,250, you're doing well with grocery budgeting at $346. Consider reducing dining expenses by $47/month to hit your $3,000 savings goal. Your coffee habit at $89 could be optimized - brewing at home 2-3 days per week would save ~$640 annually.",
  "nudges": [
    "🧭 To hit your goal, trim about $51/mo. The What-If panel shows exactly where to take it from.",
    "☕ You've spent $89.45 on coffee in 2024-09. Brewing at home a bit more could save ~$640/yr."
  ],
  "context": { /* financial context data */ }
}
```

### `POST /ask`
Ask natural language questions about your finances.

**Request Body:**
```json
{
  "question": "How much did I spend on coffee this month?"
}
```

**Query Params:**
- Same as `/coach`

**Response:**
```json
{
  "answer": "You spent $89.45 on coffee in September 2024. That's about $3/day, which adds up to roughly $1,070 per year if you maintain this pace.",
  "source": "llm",
  "privacy": false
}
```

## Utilities

### `GET /health`
System health check with data status.

**Response:**
```json
{
  "status": "ok",
  "records": 150,
  "version": 5,
  "last_updated": "2024-09-20T10:30:00Z"
}
```

### `GET /transactions`
Retrieve all transaction data.

**Query Params:**
- `privacy` (boolean): Hash merchant names

**Response:**
```json
[
  {
    "date": "2024-09-20T00:00:00",
    "merchant": "STARBUCKS",
    "amount": 4.50
  }
]
```

### `GET /score`
Calculate financial health score (0-100).

**Query Params:**
- `income_monthly` (float): Monthly income

**Response:**
```json
{
  "score": 78,
  "period": "2024-09",
  "signals": [
    {
      "name": "Savings Rate",
      "value": 82,
      "hint": "Aim for 20%+ of income."
    },
    {
      "name": "Volatility",
      "value": 75,
      "hint": "Flatter is better."
    }
  ]
}
```

### `GET /cancel_draft`
Generate subscription cancellation email template.

**Query Params:**
- `merchant` (string): Subscription merchant name
- `charge` (float): Monthly charge amount

**Response:**
```json
{
  "merchant": "Merchant-A1B2C3",
  "raw_merchant": "NETFLIX",
  "charge": 15.49,
  "email": "Subject: Cancel Subscription - NETFLIX\n\nHello NETFLIX Support,..."
}
```

## Error Responses

All endpoints may return these error formats:

```json
{
  "detail": "Error message describing the issue"
}
```

Common status codes:
- `400` - Bad request (invalid params, missing data)
- `422` - Validation error
- `500` - Internal server error

## CSV Format Requirements

Your CSV must include these columns (case-insensitive):

| Column | Description | Example |
|--------|-------------|---------|
| `date` | Transaction date | `2024-09-15` or `09/15/2024` |
| `merchant` | Vendor name | `STARBUCKS`, `SAFEWAY` |
| `amount` | Amount (+ expense, - income) | `4.50`, `-1800.00` |

**Sample CSV:**
```csv
date,merchant,amount
2024-09-15,STARBUCKS,4.50
2024-09-15,PAYROLL,-1800.00
2024-09-16,SAFEWAY,65.23
```

## Privacy & Security

- **PII Scanning**: Automatic detection of SSNs and credit cards
- **Privacy Mode**: Set `privacy=true` to hash merchant names
- **In-Memory**: No persistent storage during demo
- **Environment**: Set `SFC_SKIP_PII=1` to bypass PII scanning (dev only)