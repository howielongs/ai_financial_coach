from __future__ import annotations

import io
import os
import re
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from fastapi import Body, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# -----------------------------------------------------------------------------
# App & CORS
# -----------------------------------------------------------------------------
app = FastAPI(title="Smart Financial Coach API", version="0.1.0")

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("smart-fin-coach")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Mock data & constants
# -----------------------------------------------------------------------------
CATEGORY_KEYWORDS = {
    "Coffee": ["STARBUCKS", "PEET", "COFFEE", "DUTCH BROS"],
    "Groceries": ["SAFEWAY", "WHOLE FOODS", "TRADER JOE", "KROGER", "RALPHS", "SPROUTS"],
    "Dining": ["UBEREATS", "DOORDASH", "GRUBHUB", "RESTAURANT", "DINER", "PIZZA"],
    "Transport": ["UBER", "LYFT", "SHELL", "CHEVRON", "EXXON", "BP", "GAS"],
    "Shopping": ["AMAZON", "TARGET", "WALMART", "BEST BUY", "APPLE", "NIKE"],
    "Entertainment": ["SPOTIFY", "NETFLIX", "HULU", "DISNEY", "YOUTUBE PREMIUM"],
    "Utilities": ["COMCAST", "XFINITY", "AT&T", "T-MOBILE", "VERIZON", "PG&E", "WATER"],
    "Rent": ["APARTMENTS", "RENT", "PROPERTY MGMT"],
    "Income": ["PAYROLL", "DIRECT DEPOSIT", "VENMO CREDIT", "ZELLE CREDIT", "REFUND"],
}

# -----------------------------------------------------------------------------
# Data versioning for client refresh
# -----------------------------------------------------------------------------
DATAFRAME: Optional[pd.DataFrame] = None
DATA_VERSION = 1
LAST_UPDATED = datetime.now(timezone.utc).isoformat()


def _bump_version():
    global DATA_VERSION, LAST_UPDATED
    DATA_VERSION += 1
    LAST_UPDATED = datetime.now(timezone.utc).isoformat()


# -----------------------------------------------------------------------------
# Generators & transforms
# -----------------------------------------------------------------------------
def generate_sample_transactions(n_days: int = 90, seed: int = 7) -> pd.DataFrame:
    """
    Create ~n_days of mock transactions.
    - Expenses: positive amounts
    - Income (e.g., PAYROLL): negative average, preserved as negative
    Fix: never pass a negative stddev to rng.normal (avoid ValueError: scale < 0).
    """
    rng = np.random.default_rng(seed)
    today = datetime.utcnow().date()
    dates = [today - timedelta(days=i) for i in range(n_days)]
    rows = []

    merchants = [
        ("STARBUCKS", 4.5, 10), ("PEET COFFEE", 5.5, 6),
        ("SAFEWAY", 65, 14), ("TRADER JOE'S", 45, 10),
        ("UBEREATS", 28, 8), ("Local Pizza", 18, 6),
        ("UBER", 16, 10), ("CHEVRON", 52, 5),
        ("NETFLIX", 15.49, 1), ("SPOTIFY", 9.99, 1),
        ("T-MOBILE", 70, 1), ("APARTMENTS LLC RENT", 1500, 1),
        ("AMAZON", 32, 12), ("TARGET", 28, 8),
        ("PAYROLL", -1800, 2),  # income: negative average
    ]

    for d in dates:
        for merchant, avg_amt, freq in merchants:
            p = min(0.9, freq / 30.0)  # rough monthly->daily probability
            if rng.random() < p:
                mu = abs(avg_amt)
                sigma = max(1.0, mu * 0.15)  # std must be >= 0
                sample_mag = max(1.0, rng.normal(mu, sigma))
                amount = -sample_mag if avg_amt < 0 else sample_mag
                rows.append({"date": d.isoformat(), "merchant": merchant, "amount": float(round(amount, 2))})

    # Add a couple anomalies (expenses, positive)
    rows.append({"date": (today - timedelta(days=7)).isoformat(), "merchant": "TARGET", "amount": 450.0})
    rows.append({"date": (today - timedelta(days=22)).isoformat(), "merchant": "UBER", "amount": 120.0})

    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values("date")


def set_dataframe(df: pd.DataFrame):
    """Validate and set the global DATAFRAME."""
    global DATAFRAME
    if df is None or df.empty:
        raise ValueError("Empty dataset.")

    # Case-insensitive normalize
    rename = {c: c.lower() for c in df.columns}
    df = df.rename(columns=rename)
    needed = {"date", "merchant", "amount"}
    if not needed.issubset(df.columns):
        raise ValueError("CSV must include columns: date, merchant, amount")

    # Normalize types
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["merchant"] = df["merchant"].astype(str)
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
    df = df.dropna(subset=["date", "merchant", "amount"]).sort_values("date")
    DATAFRAME = df
    _bump_version()


# Initialize with mock data on startup
set_dataframe(generate_sample_transactions())

# -----------------------------------------------------------------------------
# Feature helpers
# -----------------------------------------------------------------------------
def categorize(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    cats = []
    for _, row in out.iterrows():
        merch = str(row["merchant"]).upper()
        cat = "Other"
        for c, keys in CATEGORY_KEYWORDS.items():
            if any(k in merch for k in keys):
                cat = c
                break
        cats.append(cat)
    out["category"] = cats
    return out


def monthly_bucket(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["year_month"] = out["date"].dt.to_period("M").astype(str)
    return out


def split_income_expense(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Income is negative amounts OR explicit category Income.
    Expenses are everything else; ensure expense amounts are positive for charts.
    """
    income_mask = (df["amount"] < 0) | (df.get("category", "") == "Income")
    income = df[income_mask].copy()
    expense = df[~income_mask].copy()
    expense["amount"] = expense["amount"].abs()
    income["amount"] = income["amount"].abs()
    return income, expense


def detect_subscriptions(expense: pd.DataFrame) -> pd.DataFrame:
    """
    Heuristic: a subscription/gray charge recurs in >= 2 distinct months with similar amounts.
    Robust to small datasets; never raises.
    """
    try:
        if expense is None or expense.empty:
            return pd.DataFrame(columns=["merchant", "charge", "months", "count"])

        exp = expense.copy()
        exp["date"] = pd.to_datetime(exp["date"], errors="coerce")
        exp = exp.dropna(subset=["date", "merchant", "amount"])
        if exp.empty:
            return pd.DataFrame(columns=["merchant", "charge", "months", "count"])

        exp["year_month"] = exp["date"].dt.to_period("M").astype(str)

        grouped = exp.groupby(["merchant", "year_month"])["amount"].median().reset_index()
        if grouped.empty:
            return pd.DataFrame(columns=["merchant", "charge", "months", "count"])

        subs = []
        for merch, g in grouped.groupby("merchant"):
            g = g.sort_values("year_month")
            amounts = g["amount"].astype(float).values
            months = g["year_month"].astype(str).values

            buckets = []
            for m, a in zip(months, amounts):
                placed = False
                for b in buckets:
                    ref = b["ref"]
                    if abs(a - ref) <= 2 or (ref > 0 and abs(a - ref) / ref <= 0.10):
                        b["months"].append(m)
                        b["amts"].append(a)
                        b["ref"] = float(np.median(b["amts"]))
                        placed = True
                        break
                if not placed:
                    buckets.append({"ref": float(a), "months": [m], "amts": [float(a)]})

            for b in buckets:
                uniq = sorted(set(b["months"]))
                if len(uniq) >= 2:
                    subs.append({
                        "merchant": str(merch),
                        "charge": round(float(np.median(b["amts"])), 2),
                        "months": ", ".join(uniq),
                        "count": len(uniq),
                    })

        if not subs:
            return pd.DataFrame(columns=["merchant", "charge", "months", "count"])
        return pd.DataFrame(subs).sort_values(["count", "merchant"], ascending=[False, True])

    except Exception as e:
        log.warning("detect_subscriptions failed: %s", e)
        return pd.DataFrame(columns=["merchant", "charge", "months", "count"])


def anomaly_detection(expense: pd.DataFrame) -> pd.DataFrame:
    """Simple z-score per merchant (|z| >= 2.5)."""
    if expense.empty:
        return pd.DataFrame(columns=["date", "merchant", "amount", "z_score"])

    def zscores(x: pd.Series) -> np.ndarray:
        m = x.mean()
        s = x.std(ddof=0)
        return np.zeros_like(x) if s == 0 else (x - m) / s

    exp = expense.copy()
    exp["z"] = exp.groupby("merchant")["amount"].transform(zscores)
    flagged = exp[exp["z"].abs() >= 2.5].copy()
    flagged.rename(columns={"z": "z_score"}, inplace=True)
    return flagged[["date", "merchant", "amount", "z_score"]].sort_values(["date", "z_score"], ascending=[False, False])


def coffee_insight(expense: pd.DataFrame, period: str) -> Dict[str, Any]:
    exp = monthly_bucket(expense)
    month_df = exp[exp["year_month"] == period]
    coffee_spend = float(month_df.loc[month_df["category"] == "Coffee", "amount"].sum())
    yearly_save = coffee_spend * 0.60 * 12.0
    msg = f"You've spent ${coffee_spend:.2f} on coffee in {period}. Brewing at home a bit more could save ~${yearly_save:,.0f}/yr."
    return {"coffee_spend": coffee_spend, "message": msg}


def goal_forecast(income_mo: float, expense_mo: float, goal_amt: float, months: int) -> Dict[str, Any]:
    surplus = max(0.0, income_mo - expense_mo)
    projected = surplus * months
    gap = max(0.0, goal_amt - projected)
    on_track = gap <= 0.01
    need_per_mo = (gap / months) if (months > 0 and gap > 0) else 0.0
    return {
        "on_track": on_track,
        "surplus": round(surplus, 2),
        "gap": round(gap, 2),
        "need_per_month": round(need_per_mo, 2),
        "message": ("You're on track!" if on_track else f"Need about ${need_per_mo:,.0f}/mo to hit ${goal_amt:,.0f} in {months} months.")
    }


def _month_span(end_ts: pd.Timestamp, n: int) -> List[str]:
    end = pd.Timestamp(end_ts).to_period("M")
    return [(end - i).strftime("%Y-%m") for i in range(n - 1, -1, -1)]


def last_n_months_expense(expense_df: pd.DataFrame, months: int = 6) -> pd.DataFrame:
    """
    Returns a dense month series (YYYY-MM) of length `months`.
    Missing months are filled with 0. Uses the latest expense date as the anchor (or today).
    """
    anchor = pd.Timestamp.utcnow()
    if expense_df is not None and not expense_df.empty:
        anchor = pd.to_datetime(expense_df["date"].max())

    month_order = _month_span(anchor, months)
    if expense_df is None or expense_df.empty:
        return pd.DataFrame({"year_month": month_order, "total": [0.0] * months})

    dfm = expense_df.copy()
    dfm["year_month"] = dfm["date"].dt.to_period("M").astype(str)
    sums = dfm.groupby("year_month")["amount"].sum().to_dict()
    totals = [float(sums.get(m, 0.0)) for m in month_order]
    return pd.DataFrame({"year_month": month_order, "total": totals})


def category_spend_this_and_prev(expense_df: pd.DataFrame, current_period: str) -> pd.DataFrame:
    """Return category totals for current and previous month, plus delta."""
    if expense_df.empty:
        return pd.DataFrame(columns=["category", "this_month", "prev_month", "delta"])
    dfm = expense_df.copy()
    dfm["year_month"] = dfm["date"].dt.to_period("M").astype(str)
    months_sorted = sorted(dfm["year_month"].unique())
    if current_period not in months_sorted or len(months_sorted) < 2:
        return pd.DataFrame(columns=["category", "this_month", "prev_month", "delta"])

    cur_idx = months_sorted.index(current_period)
    if cur_idx == 0:
        return pd.DataFrame(columns=["category", "this_month", "prev_month", "delta"])
    prev_period = months_sorted[cur_idx - 1]

    cur = dfm[dfm["year_month"] == current_period].groupby("category")["amount"].sum()
    prev = dfm[dfm["year_month"] == prev_period].groupby("category")["amount"].sum()
    cats = sorted(set(cur.index).union(prev.index))
    rows = []
    for c in cats:
        t = float(cur.get(c, 0.0))
        p = float(prev.get(c, 0.0))
        rows.append({"category": c, "this_month": t, "prev_month": p, "delta": t - p})
    return pd.DataFrame(rows).sort_values("this_month", ascending=False)


def suggestion_engine(expense_df: pd.DataFrame, needed_per_month: float) -> List[Dict[str, Any]]:
    """Greedily suggest small trims (10–20%) from biggest categories until the monthly gap is covered."""
    if needed_per_month <= 0 or expense_df.empty:
        return []
    dfm = expense_df.copy()
    dfm["year_month"] = dfm["date"].dt.to_period("M").astype(str)
    cur = dfm["year_month"].max()
    cur_exp = dfm[dfm["year_month"] == cur]
    cat_sum = cur_exp.groupby("category")["amount"].sum().sort_values(ascending=False)

    remaining = needed_per_month
    suggestions: List[Dict[str, Any]] = []
    for cat, amt in cat_sum.items():
        if remaining <= 0:
            break
        pct = 0.2 if amt >= 200 else 0.1
        cut = min(amt * pct, remaining)
        if cut >= 5:
            suggestions.append({"category": cat, "current": round(float(amt), 2), "suggested_cut": round(float(cut), 2)})
            remaining -= cut
    return suggestions


def privacy_name(merchant: str) -> str:
    h = hashlib.sha1(merchant.encode()).hexdigest()[:6].upper()
    return f"Merchant-{h}"


def maybe_privacy_map_dict(d: Dict[str, float], privacy: bool) -> Dict[str, float]:
    if not privacy:
        return d
    return {privacy_name(k): v for k, v in d.items()}


def _compose_context(income_monthly: float, goal_amount: float, months_to_goal: int, privacy: bool):
    """Build a compact context object from existing pipelines."""
    if DATAFRAME is None or DATAFRAME.empty:
        return {
            "period": None, "expense_total": 0.0, "by_category": {}, "top_merchants": {},
            "coffee_msg": "", "forecast": goal_forecast(income_monthly, 0.0, goal_amount, months_to_goal),
            "suggestions": [], "delta_categories": [], "anomaly_count": 0
        }
    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    dfm = monthly_bucket(expense_df)
    months = sorted(dfm["year_month"].unique())
    cur = months[-1] if months else datetime.utcnow().strftime("%Y-%m")
    month_expense = dfm[dfm["year_month"] == cur]
    total_expense = float(month_expense["amount"].sum())
    by_cat = month_expense.groupby("category")["amount"].sum().sort_values(ascending=False).to_dict()
    top_merch = month_expense.groupby("merchant")["amount"].sum().sort_values(ascending=False).head(10).to_dict()
    if privacy:
        top_merch = {privacy_name(k): v for k, v in top_merch.items()}
    coffee = coffee_insight(expense_df, cur)
    cmp = category_spend_this_and_prev(expense_df, cur)
    fc = goal_forecast(income_monthly, total_expense, goal_amount, months_to_goal)
    need = float(fc.get("need_per_month", 0.0)) if not fc.get("on_track", False) else 0.0
    sugg = suggestion_engine(expense_df, need)
    anoms = anomaly_detection(expense_df)
    return {
        "period": cur, "expense_total": round(total_expense, 2),
        "by_category": {k: float(v) for k, v in by_cat.items()},
        "top_merchants": {k: float(v) for k, v in top_merch.items()},
        "coffee_msg": coffee["message"],
        "forecast": fc,
        "suggestions": sugg,
        "delta_categories": cmp.to_dict(orient="records") if not cmp.empty else [],
        "anomaly_count": 0 if anoms.empty else int(len(anoms))
    }


def _rule_based_coach(ctx: dict) -> List[str]:
    out = []
    if ctx["forecast"]["on_track"]:
        out.append("🎯 Great pace—your plan looks on track. Keep habits steady and avoid new recurring spend.")
    else:
        need = ctx["forecast"]["need_per_month"]
        out.append(f"🧭 To hit your goal, trim about ${need:,.0f}/mo. The What-If panel shows exactly where to take it from.")
    if "coffee" in ctx["coffee_msg"].lower():
        out.append(f"☕ {ctx['coffee_msg']}")
    if ctx["suggestions"]:
        s = ctx["suggestions"][0]
        out.append(f"✂️ Try cutting **{s['category']}** by ${s['suggested_cut']:,.0f}/mo (currently ${s['current']:,.0f}).")
    if ctx["anomaly_count"] > 0:
        out.append(f"🚨 Spotted {ctx['anomaly_count']} unusual charges recently—give Anomalies a quick review.")
    return out[:4]


def _try_llm(system_prompt: str, user_prompt: str) -> Optional[str]:
    """
    Optional LLM call. Requires:
      pip install "openai>=1.0.0"
      export OPENAI_API_KEY=sk-...
    If package/model/key not present, returns None.
    """
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return None
    try:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=key)
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            resp = client.chat.completions.create(
                model=model,
                temperature=0.6,
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            )
            return (resp.choices[0].message.content or "").strip()
        except ImportError:
            import openai  # type: ignore
            openai.api_key = key
            model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
            resp = openai.ChatCompletion.create(
                model=model,
                temperature=0.6,
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            )
            return (resp["choices"][0]["message"]["content"] or "").strip()
    except Exception as e:
        log.warning("LLM call failed; falling back to rules: %s", e)
        return None


# -----------------------------------------------------------------------------
# PII scan
# -----------------------------------------------------------------------------
RE_SSN = re.compile(r"\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b")


def _luhn_ok(num: str) -> bool:
    total, alt = 0, False
    for ch in num[::-1]:
        if not ch.isdigit():
            return False
        d = ord(ch) - 48
        if alt:
            d *= 2
            if d > 9:
                d -= 9
        total += d
        alt = not alt
    return (total % 10) == 0


def detect_pii(df: pd.DataFrame) -> List[str]:
    """
    Scan non-required columns row-wise for SSN/CCN-like values.
    Skips 'date' and 'amount' to avoid false positives.
    Uses Luhn to reduce CCN false positives.
    """
    required = {"date", "merchant", "amount"}
    flagged = set()
    N = min(len(df), 2000)

    for col in df.columns:
        col_l = str(col).lower()
        if col_l in ("date", "amount"):
            continue
        series = df[col].astype(str).head(N)
        for v in series:
            s = v.strip()
            if not s:
                continue
            if RE_SSN.search(s):
                flagged.add(col)
                break
            digits = re.sub(r"\D", "", s)
            if 13 <= len(digits) <= 16 and _luhn_ok(digits):
                flagged.add(col)
                break
    return sorted(flagged)


# -----------------------------------------------------------------------------
# API endpoints
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health():
    global DATAFRAME, DATA_VERSION, LAST_UPDATED
    return {
        "status": "ok",
        "records": 0 if DATAFRAME is None else int(len(DATAFRAME)),
        "version": int(DATA_VERSION),
        "last_updated": LAST_UPDATED,
    }


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file.")
    try:
        raw = await file.read()
        df = pd.read_csv(io.BytesIO(raw))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    # Optional bypass: export SFC_SKIP_PII=1 if you need to disable scanning temporarily
    if os.getenv("SFC_SKIP_PII") != "1":
        bad_cols = detect_pii(df)
        if bad_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Upload blocked: possible PII detected in columns {bad_cols}. Remove sensitive data for this demo.",
            )

    set_dataframe(df)
    return {"ok": True, "rows": int(len(df)), "version": DATA_VERSION}


@app.post("/api/reset")
def reset_to_sample():
    set_dataframe(generate_sample_transactions())
    return {"ok": True, "rows": int(len(DATAFRAME)), "version": DATA_VERSION}


@app.post("/api/clear")
def clear_data():
    """Clear uploaded data from memory (demo privacy control)."""
    global DATAFRAME
    DATAFRAME = pd.DataFrame(columns=["date", "merchant", "amount"])
    _bump_version()
    return {"ok": True, "rows": 0, "version": DATA_VERSION}


@app.get("/api/transactions")
def get_transactions(privacy: bool = Query(False)):
    if DATAFRAME is None:
        return []
    rows = DATAFRAME.copy()
    if privacy:
        rows["merchant"] = rows["merchant"].apply(privacy_name)
    return rows.to_dict(orient="records")


@app.get("/api/summary")
def get_summary(privacy: bool = Query(False)):
    if DATAFRAME is None or DATAFRAME.empty:
        return {"period": None, "total_expense_month": 0, "by_category": {}, "top_merchants": {}, "coffee": {}, "privacy": privacy}

    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    df_m = monthly_bucket(expense_df)
    months = sorted(df_m["year_month"].unique())
    current = months[-1] if months else datetime.utcnow().strftime("%Y-%m")

    month_expense = df_m[df_m["year_month"] == current]
    total_expense = float(month_expense["amount"].sum())

    cat = month_expense.groupby("category")["amount"].sum().sort_values(ascending=False)
    top_merch = month_expense.groupby("merchant")["amount"].sum().sort_values(ascending=False).head(10)

    return {
        "period": current,
        "total_expense_month": round(total_expense, 2),
        "by_category": cat.to_dict(),
        "top_merchants": maybe_privacy_map_dict(top_merch.to_dict(), privacy),
        "coffee": coffee_insight(expense_df, current),
        "privacy": privacy,
    }


@app.get("/api/subscriptions")
def get_subscriptions(privacy: bool = Query(False)):
    try:
        if DATAFRAME is None or DATAFRAME.empty:
            return []
        df = categorize(DATAFRAME)
        _, expense_df = split_income_expense(df)

        subs = detect_subscriptions(expense_df)
        if subs is None or subs.empty:
            return []

        out = subs.fillna({"months": ""}).to_dict(orient="records")
        if privacy:
            for r in out:
                r["merchant"] = privacy_name(r["merchant"])
        return out

    except Exception as e:
        log.exception("subscriptions failed: %s", e)
        return []


@app.get("/api/anomalies")
def get_anomalies(privacy: bool = Query(False)):
    if DATAFRAME is None or DATAFRAME.empty:
        return []
    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    flagged = anomaly_detection(expense_df).copy()
    if not flagged.empty:
        flagged["date"] = flagged["date"].dt.strftime("%Y-%m-%d")
    out = flagged.to_dict(orient="records")
    if privacy:
        for r in out:
            r["merchant"] = privacy_name(r["merchant"])
    return out


@app.get("/api/anomalies_ml")
def get_anomalies_ml():
    """
    Optional ML-based anomalies using IsolationForest.
    Returns {} if scikit-learn not installed or not enough data.
    """
    try:
        from sklearn.ensemble import IsolationForest  # type: ignore
    except Exception:
        return {"available": False, "reason": "scikit-learn not installed"}

    if DATAFRAME is None or DATAFRAME.empty:
        return {"available": True, "anomalies": []}

    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    if expense_df.empty:
        return {"available": True, "anomalies": []}

    # Simple per-merchant model
    rows = []
    for merch, g in expense_df.groupby("merchant"):
        X = g[["amount"]].values
        if len(X) < 8:
            continue
        try:
            iso = IsolationForest(random_state=0, contamination="auto")
            y = iso.fit_predict(X)
            scores = iso.decision_function(X)
            mask = y == -1
            out = g.loc[mask].copy()
            out["score"] = scores[mask]
            if not out.empty:
                out["date"] = out["date"].dt.strftime("%Y-%m-%d")
                for _, r in out.iterrows():
                    rows.append({"date": r["date"], "merchant": merch, "amount": float(r["amount"]), "score": float(r["score"])})
        except Exception:
            continue

    return {"available": True, "anomalies": sorted(rows, key=lambda r: r["score"])[:100]}


@app.get("/api/forecast")
def get_forecast(
    income_monthly: float = Query(1800),
    goal_amount: float = Query(3000),
    months_to_goal: int = Query(10),
):
    if DATAFRAME is None or DATAFRAME.empty:
        return goal_forecast(income_monthly, 0.0, goal_amount, months_to_goal)

    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    df_m = monthly_bucket(expense_df)
    months = sorted(df_m["year_month"].unique())
    current = months[-1] if months else datetime.utcnow().strftime("%Y-%m")
    month_expense = df_m[df_m["year_month"] == current]
    total_expense = float(month_expense["amount"].sum())
    return goal_forecast(income_monthly, total_expense, goal_amount, months_to_goal)


@app.get("/api/trends")
def get_trends(months: int = Query(6, ge=2, le=24)):
    if DATAFRAME is None:
        return {"months": [], "totals": [], "by_category": {}}
    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)

    totals = last_n_months_expense(expense_df, months=months)  # dense months
    month_order = list(totals["year_month"])
    by_cat_long = (
        expense_df.assign(year_month=expense_df["date"].dt.to_period("M").astype(str))
        .groupby(["year_month", "category"])["amount"]
        .sum()
        .reset_index()
    )
    out = {}
    for cat, g in by_cat_long.groupby("category"):
        m2v = {row["year_month"]: float(row["amount"]) for _, row in g.iterrows()}
        out[cat] = [m2v.get(m, 0.0) for m in month_order]

    return {"months": month_order, "totals": [float(x) for x in totals["total"]], "by_category": out}


@app.get("/api/compare")
def compare_and_suggest(
    income_monthly: float = Query(1800),
    goal_amount: float = Query(3000),
    months_to_goal: int = Query(10),
):
    if DATAFRAME is None or DATAFRAME.empty:
        return {"period": None, "delta_overall": 0.0, "categories": [], "suggestions": []}

    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    dfm = expense_df.assign(year_month=expense_df["date"].dt.to_period("M").astype(str))
    months_sorted = sorted(dfm["year_month"].unique())
    cur = months_sorted[-1]
    cur_total = float(dfm.loc[dfm["year_month"] == cur, "amount"].sum())

    prev_total = 0.0
    if len(months_sorted) >= 2:
        prev = months_sorted[-2]
        prev_total = float(dfm.loc[dfm["year_month"] == prev, "amount"].sum())

    cat_delta = category_spend_this_and_prev(expense_df, cur)
    cat_rows = cat_delta.to_dict(orient="records")

    forecast = goal_forecast(income_monthly, cur_total, goal_amount, months_to_goal)
    needed = float(forecast.get("need_per_month", 0.0)) if not forecast.get("on_track", False) else 0.0
    suggestions = suggestion_engine(expense_df, needed)

    return {
        "period": cur,
        "delta_overall": round(cur_total - prev_total, 2),
        "this_month_total": round(cur_total, 2),
        "prev_month_total": round(prev_total, 2),
        "categories": cat_rows,
        "needed_per_month": round(needed, 2),
        "suggestions": suggestions,
        "forecast": forecast,
    }


@app.get("/api/score")
def get_score(income_monthly: float = Query(1800)):
    if DATAFRAME is None or DATAFRAME.empty:
        return {"score": 50, "signals": [], "explain": "No data — neutral score."}

    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)

    dfm = expense_df.assign(year_month=expense_df["date"].dt.to_period("M").astype(str))
    months_sorted = sorted(dfm["year_month"].unique())
    cur = months_sorted[-1]
    cur_total = float(dfm.loc[dfm["year_month"] == cur, "amount"].sum())
    savings_rate = 0.0 if income_monthly <= 0 else max(0.0, min(1.0, (income_monthly - cur_total) / income_monthly))

    totals = dfm.groupby("year_month")["amount"].sum().reset_index().sort_values("year_month")
    last6 = totals.tail(6)["amount"]
    vol = 0.0
    if len(last6) >= 2 and last6.mean() > 1e-6:
        vol = float(last6.std(ddof=0) / last6.mean())

    subs = detect_subscriptions(expense_df)
    subs_in_cur = 0.0
    if not subs.empty:
        subs_in_cur = float(subs.loc[subs["months"].str.contains(cur, na=False), "charge"].sum())
    recurring_ratio = 0.0 if cur_total <= 0 else min(1.0, subs_in_cur / cur_total)

    anoms = anomaly_detection(expense_df)
    anoms_cur = 0
    tx_cur = len(dfm[dfm["year_month"] == cur])
    if not anoms.empty:
        anoms_cur = int((anoms.assign(year_month=anoms["date"].dt.to_period("M").astype(str))["year_month"] == cur).sum())
    anomaly_rate = 0.0 if tx_cur == 0 else anoms_cur / tx_cur

    raw = (
        0.55 * savings_rate +
        0.15 * (1.0 - min(vol, 1.0)) +
        0.20 * (1.0 - recurring_ratio) +
        0.10 * (1.0 - min(anomaly_rate, 1.0))
    )
    score = int(round(100 * raw))

    signals = [
        {"name": "Savings Rate", "value": round(100 * savings_rate), "hint": "Aim for 20%+ of income."},
        {"name": "Volatility", "value": round(100 * (1.0 - min(vol, 1.0))), "hint": "Flatter is better."},
        {"name": "Recurring Burden", "value": round(100 * (1.0 - recurring_ratio)), "hint": "Trim subscriptions."},
        {"name": "Anomaly Hygiene", "value": round(100 * (1.0 - min(anomaly_rate, 1.0))), "hint": "Review outliers."},
    ]
    return {"score": score, "period": cur, "signals": signals}


@app.post("/api/whatif")
def what_if(
    cuts: Dict[str, float] = Body(..., example={"Dining": 60, "Coffee": 20}),
    income_monthly: float = Query(1800),
    goal_amount: float = Query(3000),
    months_to_goal: int = Query(10),
):
    if DATAFRAME is None or DATAFRAME.empty:
        return {"forecast": goal_forecast(income_monthly, 0.0, goal_amount, months_to_goal), "applied": {}}

    df = categorize(DATAFRAME)
    _, expense_df = split_income_expense(df)
    dfm = expense_df.assign(year_month=expense_df["date"].dt.to_period("M").astype(str))
    cur = dfm["year_month"].max()
    cur_exp = dfm[dfm["year_month"] == cur]

    by_cat = cur_exp.groupby("category")["amount"].sum().to_dict()

    applied = {}
    reduced_total = 0.0
    for cat, cur_amt in by_cat.items():
        want_cut = float(cuts.get(cat, 0.0))
        take = max(0.0, min(want_cut, cur_amt))
        if take > 0:
            applied[cat] = round(take, 2)
            reduced_total += take

    cur_total = float(sum(by_cat.values()))
    new_expense = max(0.0, cur_total - reduced_total)
    forecast = goal_forecast(income_monthly, new_expense, goal_amount, months_to_goal)
    return {"period": cur, "current_expense": round(cur_total, 2), "new_expense": round(new_expense, 2), "applied": applied, "forecast": forecast}


@app.get("/api/coach")
def api_coach(
    income_monthly: float = Query(1800),
    goal_amount: float = Query(3000),
    months_to_goal: int = Query(10),
    privacy: bool = Query(False),
):
    try:
        ctx = _compose_context(income_monthly, goal_amount, months_to_goal, privacy)
        llm_text = None
        if os.getenv("OPENAI_API_KEY"):
            system = (
                "You are a kind, specific financial coach. "
                "Reply in one short paragraph followed by 3 concise bullets. "
                "Use numbers from the JSON and keep it actionable."
            )
            user = f"User Finance Snapshot (JSON):\n{ctx}\nCreate a brief coaching note."
            llm_text = _try_llm(system, user)

        nudges = [] if llm_text else _rule_based_coach(ctx)
        return {"llm_note": llm_text, "nudges": nudges, "context": ctx}

    except Exception as e:
        log.exception("coach endpoint failed")
        safe_ctx = {
            "period": None, "expense_total": 0.0, "by_category": {}, "top_merchants": {},
            "coffee_msg": "", "forecast": {"on_track": False, "surplus": 0, "gap": 0, "need_per_month": 0, "message": "No data"},
            "suggestions": [], "delta_categories": [], "anomaly_count": 0
        }
        fallback = _rule_based_coach(safe_ctx)
        return JSONResponse(status_code=200, content={"llm_note": None, "nudges": fallback, "context": safe_ctx, "error": str(e)})


@app.post("/api/ask")
def api_ask(
    payload: Dict[str, str] = Body(...),
    privacy: bool = Query(False),
    income_monthly: float = Query(1800),
    goal_amount: float = Query(3000),
    months_to_goal: int = Query(10),
):
    question = (payload.get("question") or "").strip()
    ctx = _compose_context(income_monthly, goal_amount, months_to_goal, privacy)

    system = ("You answer questions about the user's spending using the JSON provided. "
              "If data isn’t available, say so briefly. Be specific and concise.")
    user = f"Question: {question}\nData:\n{ctx}"
    llm = _try_llm(system, user)
    if llm:
        return {"answer": llm, "source": "llm"}

    q = question.lower()
    if "coffee" in q:
        return {"answer": ctx["coffee_msg"], "source": "rule"}
    if "subscription" in q or "recurring" in q:
        top = next(iter(ctx["top_merchants"]), None)
        return {"answer": f"Recurring charges are listed on the Subscriptions card. Your top merchant this month is {top or 'n/a'}.", "source": "rule"}
    if "total" in q or "spend" in q:
        return {"answer": f"You’ve spent ${ctx['expense_total']:,.0f} in {ctx['period']}.", "source": "rule"}
    if "goal" in q or "track" in q:
        return {"answer": ctx["forecast"]["message"], "source": "rule"}
    if "anomal" in q or "outlier" in q:
        return {"answer": f"{ctx['anomaly_count']} unusual transactions flagged—check the Anomalies table.", "source": "rule"}
    return {"answer": "I couldn’t find that in the demo data. Try asking about coffee, total spend, subscriptions, anomalies, or your goal.", "source": "rule"}


@app.get("/api/cancel_draft")
def cancel_draft(merchant: str = Query(...), charge: float = Query(0.0)):
    """
    Produce a copyable email template to cancel a subscription/gray charge.
    """
    masked = privacy_name(merchant)
    body = (
        f"Subject: Cancel Subscription - {merchant}\n\n"
        f"Hello {merchant} Support,\n\n"
        f"I'd like to cancel my subscription effective immediately. "
        f"My recent charge was approximately ${charge:,.2f}. "
        f"Please confirm cancellation and any refund eligibility.\n\n"
        f"Thank you,\nA Customer"
    )
    return {"merchant": masked, "raw_merchant": merchant, "charge": round(charge, 2), "email": body}
