from services.liabilities import extract_liability_fields


def test_extract_credit_card_liability():
    liabilities = {
        "credit": [
            {
                "account_id": "acc-1",
                "minimum_payment_amount": 35.0,
                "aprs": [
                    {"apr_type": "balance_transfer_apr", "apr_percentage": 0.0},
                    {"apr_type": "purchase_apr", "apr_percentage": 22.5},
                ],
            }
        ],
        "student": [],
        "mortgage": [],
    }
    result = extract_liability_fields(liabilities)
    assert result["acc-1"] == {"minimum_payment": 35.0, "interest_rate": 22.5}


def test_extract_credit_card_liability_falls_back_to_first_apr_when_no_purchase_apr():
    liabilities = {
        "credit": [
            {
                "account_id": "acc-2",
                "minimum_payment_amount": 50.0,
                "aprs": [{"apr_type": "cash_apr", "apr_percentage": 27.9}],
            }
        ],
        "student": [],
        "mortgage": [],
    }
    result = extract_liability_fields(liabilities)
    assert result["acc-2"] == {"minimum_payment": 50.0, "interest_rate": 27.9}


def test_extract_student_loan_liability():
    liabilities = {
        "credit": [],
        "student": [
            {
                "account_id": "acc-3",
                "minimum_payment_amount": 210.0,
                "interest_rate_percentage": 5.8,
            }
        ],
        "mortgage": [],
    }
    result = extract_liability_fields(liabilities)
    assert result["acc-3"] == {"minimum_payment": 210.0, "interest_rate": 5.8}


def test_extract_liability_fields_handles_missing_data():
    liabilities = {
        "credit": [{"account_id": "acc-4", "minimum_payment_amount": None, "aprs": []}],
        "student": [],
        "mortgage": [],
    }
    result = extract_liability_fields(liabilities)
    assert result["acc-4"] == {"minimum_payment": None, "interest_rate": None}


def test_extract_liability_fields_empty_response():
    assert extract_liability_fields({"credit": [], "student": [], "mortgage": []}) == {}
