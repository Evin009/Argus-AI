from unittest.mock import MagicMock, patch


def test_recompute_stores_result():
    mock_supabase = MagicMock()
    accounts_mock = MagicMock()
    accounts_mock.data = [{"id": "acc-1", "balance": 1000.0}]
    bills_mock = MagicMock()
    bills_mock.data = []
    onboarding_mock = MagicMock()
    onboarding_mock.data = [{"pay_schedule": "biweekly"}]

    cache_table_mock = MagicMock()
    upserted_payloads = []

    def capture_upsert(payload, **kwargs):
        upserted_payloads.append(payload)
        return MagicMock()

    cache_table_mock.upsert.side_effect = capture_upsert

    def table_side_effect(name):
        if name == "accounts":
            m = MagicMock()
            m.select.return_value.eq.return_value.execute.return_value = accounts_mock
            return m
        elif name == "bills":
            m = MagicMock()
            m.select.return_value.eq.return_value.execute.return_value = bills_mock
            return m
        elif name == "onboarding_responses":
            m = MagicMock()
            m.select.return_value.eq.return_value.execute.return_value = onboarding_mock
            return m
        elif name == "safe_to_spend_cache":
            return cache_table_mock
        return MagicMock()

    mock_supabase.table.side_effect = table_side_effect

    with patch("tasks.recompute_safe_to_spend.get_supabase", return_value=mock_supabase):
        from tasks.recompute_safe_to_spend import recompute_safe_to_spend_for_user

        recompute_safe_to_spend_for_user("user-1")

    assert len(upserted_payloads) == 1
    payload = upserted_payloads[0]
    assert "safe_amount" in payload
    assert payload["user_id"] == "user-1"
