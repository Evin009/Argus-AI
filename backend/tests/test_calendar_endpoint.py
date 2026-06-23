from datetime import date, timedelta
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "user-1"
client = TestClient(app)


def make_supabase(bills_data, subs_data):
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "bills":
            m.select.return_value.eq.return_value.order.return_value.execute.return_value.data = (
                bills_data
            )
        elif name == "subscriptions":
            m.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = (
                subs_data
            )
        elif name == "merchant_logos":
            m.select.return_value.eq.return_value.execute.return_value.data = []
            m.upsert.return_value.execute.return_value = MagicMock()
        return m

    mock_supabase.table.side_effect = table_side
    return mock_supabase


def test_calendar_returns_sorted_entries():
    today = date.today()
    bills = [
        {
            "id": "b1",
            "merchant": "Electric",
            "avg_amount": 80.0,
            "next_due_date": (today + timedelta(days=5)).isoformat(),
        }
    ]
    subs = [
        {
            "id": "s1",
            "merchant": "Netflix",
            "avg_amount": 15.0,
            "next_due_date": (today + timedelta(days=2)).isoformat(),
        }
    ]

    mock_supabase = make_supabase(bills, subs)
    with (
        patch("routers.calendar.get_supabase", return_value=mock_supabase),
        patch("services.merchant_logos.requests.head") as h,
    ):
        h.return_value.status_code = 404
        resp = client.get("/calendar")

    assert resp.status_code == 200
    entries = resp.json()["entries"]
    assert len(entries) == 2
    assert entries[0]["merchant"] == "Netflix"
    assert entries[1]["merchant"] == "Electric"


def test_calendar_urgency_high_within_3_days():
    today = date.today()
    bills = [
        {
            "id": "b1",
            "merchant": "Rent",
            "avg_amount": 1200.0,
            "next_due_date": (today + timedelta(days=1)).isoformat(),
        }
    ]

    mock_supabase = make_supabase(bills, [])
    with (
        patch("routers.calendar.get_supabase", return_value=mock_supabase),
        patch("services.merchant_logos.requests.head") as h,
    ):
        h.return_value.status_code = 404
        resp = client.get("/calendar")

    entries = resp.json()["entries"]
    assert entries[0]["urgency"] == "high"


def test_calendar_urgency_medium_within_7_days():
    today = date.today()
    bills = [
        {
            "id": "b1",
            "merchant": "Car",
            "avg_amount": 350.0,
            "next_due_date": (today + timedelta(days=5)).isoformat(),
        }
    ]

    mock_supabase = make_supabase(bills, [])
    with (
        patch("routers.calendar.get_supabase", return_value=mock_supabase),
        patch("services.merchant_logos.requests.head") as h,
    ):
        h.return_value.status_code = 404
        resp = client.get("/calendar")

    entries = resp.json()["entries"]
    assert entries[0]["urgency"] == "medium"
