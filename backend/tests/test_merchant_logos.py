from unittest.mock import MagicMock, patch


def _mock_chain(mock_supabase):
    return (
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value
    )


def test_returns_cached_logo():
    mock_supabase = MagicMock()
    _mock_chain(mock_supabase).data = [{"logo_url": "https://logo.clearbit.com/netflix.com"}]
    from services.merchant_logos import get_logo_url

    result = get_logo_url("Netflix", mock_supabase)
    assert result == "https://logo.clearbit.com/netflix.com"


def test_fetches_and_caches_on_miss():
    mock_supabase = MagicMock()
    _mock_chain(mock_supabase).data = []
    upserted = []

    def capture_upsert(payload, **kwargs):
        upserted.append(payload)
        return MagicMock()

    mock_supabase.table.return_value.upsert.side_effect = capture_upsert

    with patch("services.merchant_logos.requests.head") as mock_head:
        mock_head.return_value.status_code = 200
        from services.merchant_logos import get_logo_url

        result = get_logo_url("Spotify", mock_supabase)

    assert result is not None
    assert "spotify" in result.lower()
    assert len(upserted) == 1


def test_returns_none_on_404():
    mock_supabase = MagicMock()
    _mock_chain(mock_supabase).data = []

    with patch("services.merchant_logos.requests.head") as mock_head:
        mock_head.return_value.status_code = 404
        from services.merchant_logos import get_logo_url

        result = get_logo_url("UnknownMerchant99", mock_supabase)

    assert result is None
