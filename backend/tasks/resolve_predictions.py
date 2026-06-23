from datetime import UTC, datetime

from celery_app import celery
from db.client import get_supabase


def _evaluate_prediction(
    prediction_type: str, payload: dict, actual_balance: float | None
) -> bool | None:
    if actual_balance is None:
        return None

    if prediction_type == "balance_below_threshold":
        return actual_balance < payload["threshold"]

    return None


@celery.task(name="tasks.resolve_predictions.resolve_due_predictions")
def resolve_due_predictions() -> dict:
    supabase = get_supabase()

    due = (
        supabase.table("ai_predictions")
        .select("id, prediction_type, prediction_payload")
        .lte("resolves_at", datetime.now(UTC).isoformat())
        .is_("actual_outcome", "null")
        .execute()
    ).data or []

    resolved = 0
    for prediction in due:
        payload = prediction["prediction_payload"]
        account_id = payload.get("account_id")
        actual_balance = None

        if account_id:
            account = (
                supabase.table("accounts").select("balance").eq("id", account_id).execute()
            ).data
            if account:
                actual_balance = account[0]["balance"]

        was_accurate = _evaluate_prediction(prediction["prediction_type"], payload, actual_balance)
        if was_accurate is None:
            continue

        supabase.table("ai_predictions").update(
            {
                "actual_outcome": {"balance": actual_balance},
                "was_accurate": was_accurate,
            }
        ).eq("id", prediction["id"]).execute()
        resolved += 1

    return {"checked": len(due), "resolved": resolved}
