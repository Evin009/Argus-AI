import re

import requests

_CLEARBIT_BASE = "https://logo.clearbit.com"


def _slug(merchant: str) -> str:
    return re.sub(r"[^a-z0-9]", "", merchant.lower())


def get_logo_url(merchant: str, supabase) -> str | None:
    cached = (
        supabase.table("merchant_logos").select("logo_url").eq("merchant", merchant).execute()
    ).data or []

    if cached:
        return cached[0]["logo_url"]

    slug = _slug(merchant)
    url = f"{_CLEARBIT_BASE}/{slug}.com"
    try:
        resp = requests.head(url, timeout=3)
        logo_url = url if resp.status_code == 200 else None
    except requests.RequestException:
        logo_url = None

    supabase.table("merchant_logos").upsert(
        {"merchant": merchant, "logo_url": logo_url},
        on_conflict="merchant",
    ).execute()

    return logo_url
