from collections import defaultdict
from datetime import date, timedelta


def compute_spending_by_category(transactions: list) -> dict:
    totals: dict[str, float] = defaultdict(float)
    for t in transactions:
        cat = t.get("category") or "uncategorized"
        totals[cat] += float(t.get("amount") or 0)
    return dict(totals)


def compute_utilization_summary(accounts: list) -> dict:
    credit_accounts = [a for a in accounts if a.get("account_type") == "credit"]
    total_limit = sum(float(a.get("credit_limit") or 0) for a in credit_accounts)
    total_balance = sum(float(a.get("balance") or 0) for a in credit_accounts)
    utilization_pct = round((total_balance / total_limit * 100), 2) if total_limit > 0 else 0.0
    return {
        "total_credit_limit": total_limit,
        "total_balance": total_balance,
        "utilization_pct": utilization_pct,
    }


def compute_merchant_rankings(transactions: list) -> list:
    today = date.today()
    cutoff_30d = today - timedelta(days=30)
    cutoff_60d = today - timedelta(days=60)

    totals: dict[str, float] = defaultdict(float)
    counts: dict[str, int] = defaultdict(int)
    recent_30: dict[str, float] = defaultdict(float)
    prev_30: dict[str, float] = defaultdict(float)

    for t in transactions:
        merchant = t.get("merchant") or "unknown"
        amount = float(t.get("amount") or 0)
        ts = t.get("timestamp", "")
        try:
            tx_date = date.fromisoformat(ts[:10])
        except (ValueError, TypeError):
            tx_date = today

        totals[merchant] += amount
        counts[merchant] += 1

        if tx_date >= cutoff_30d:
            recent_30[merchant] += amount
        elif tx_date >= cutoff_60d:
            prev_30[merchant] += amount

    merchants = []
    for merchant, total in totals.items():
        r = recent_30.get(merchant, 0)
        p = prev_30.get(merchant, 0)
        if p == 0:
            trend = "up" if r > 0 else "flat"
        elif r > p * 1.1:
            trend = "up"
        elif r < p * 0.9:
            trend = "down"
        else:
            trend = "flat"

        merchants.append(
            {
                "merchant": merchant,
                "total_spend": round(total, 2),
                "transaction_count": counts[merchant],
                "trend": trend,
            }
        )

    return sorted(merchants, key=lambda x: x["total_spend"], reverse=True)


def compute_merchant_detail(transactions: list, merchant: str) -> dict:
    today = date.today()
    merchant_txns = [t for t in transactions if t.get("merchant") == merchant]

    total_spend = sum(float(t.get("amount") or 0) for t in merchant_txns)

    # heatmap: {day_of_week: {week_of_month: count}}
    heatmap: dict[int, dict[int, int]] = defaultdict(lambda: defaultdict(int))
    monthly: dict[str, float] = defaultdict(float)

    for t in merchant_txns:
        ts = t.get("timestamp", "")
        try:
            tx_date = date.fromisoformat(ts[:10])
        except (ValueError, TypeError):
            tx_date = today

        dow = tx_date.weekday()
        wom = (tx_date.day - 1) // 7
        heatmap[dow][wom] += 1

        month_key = tx_date.strftime("%Y-%m")
        monthly[month_key] += float(t.get("amount") or 0)

    # last 6 months sorted
    sorted_months = sorted(monthly.keys())[-6:]
    monthly_trend = [{"month": m, "amount": round(monthly[m], 2)} for m in sorted_months]

    # serialize heatmap
    heatmap_out = {
        str(dow): {str(wom): count for wom, count in weeks.items()}
        for dow, weeks in heatmap.items()
    }

    return {
        "merchant": merchant,
        "total_spend": round(total_spend, 2),
        "transaction_count": len(merchant_txns),
        "heatmap": heatmap_out,
        "monthly_trend": monthly_trend,
    }
