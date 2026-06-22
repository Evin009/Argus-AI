def _credit_card_interest_rate(aprs: list[dict]) -> float | None:
    if not aprs:
        return None
    for apr in aprs:
        if apr.get("apr_type") == "purchase_apr":
            return apr.get("apr_percentage")
    return aprs[0].get("apr_percentage")


def extract_liability_fields(liabilities: dict) -> dict[str, dict]:
    """Maps a Plaid /liabilities/get response to {account_id: {minimum_payment, interest_rate}}."""
    fields: dict[str, dict] = {}

    for credit in liabilities.get("credit") or []:
        fields[credit["account_id"]] = {
            "minimum_payment": credit.get("minimum_payment_amount"),
            "interest_rate": _credit_card_interest_rate(credit.get("aprs") or []),
        }

    for student in liabilities.get("student") or []:
        fields[student["account_id"]] = {
            "minimum_payment": student.get("minimum_payment_amount"),
            "interest_rate": student.get("interest_rate_percentage"),
        }

    for mortgage in liabilities.get("mortgage") or []:
        fields[mortgage["account_id"]] = {
            "minimum_payment": mortgage.get("last_payment_amount"),
            "interest_rate": (mortgage.get("interest_rate") or {}).get("percentage"),
        }

    return fields
