from collections.abc import Callable

from db.client import get_supabase

ToolFn = Callable[[str], dict]

_TOOL_REGISTRY: dict[str, dict] = {}


def register_tool(name: str, description: str, keywords: list[str]):
    def decorator(fn: ToolFn) -> ToolFn:
        _TOOL_REGISTRY[name] = {
            "name": name,
            "description": description,
            "keywords": keywords,
            "fn": fn,
        }
        return fn

    return decorator


def get_registered_tools() -> dict[str, dict]:
    return dict(_TOOL_REGISTRY)


def call_tool(name: str, user_id: str) -> dict:
    tool = _TOOL_REGISTRY.get(name)
    if tool is None:
        raise KeyError(f"Unknown tool: {name}")
    return tool["fn"](user_id)


@register_tool(
    "get_bills",
    "Returns the user's upcoming and recurring bills",
    keywords=["bill", "bills", "due", "payment"],
)
def _get_bills_tool(user_id: str) -> dict:
    supabase = get_supabase()
    result = (
        supabase.table("bills")
        .select("merchant, avg_amount, recurrence_pattern, next_due_date")
        .eq("user_id", user_id)
        .execute()
    )
    return {"bills": result.data or []}


@register_tool(
    "get_subscriptions",
    "Returns the user's active subscriptions",
    keywords=["subscription", "subscriptions", "sub", "recurring charge"],
)
def _get_subscriptions_tool(user_id: str) -> dict:
    supabase = get_supabase()
    result = (
        supabase.table("subscriptions")
        .select("merchant, avg_amount, price_change_pct, billing_cycle")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )
    return {"subscriptions": result.data or []}


@register_tool(
    "get_spending_by_category",
    "Returns the user's spending broken down by transaction category",
    keywords=["spend", "spent", "spending", "category", "categories"],
)
def _get_spending_by_category_tool(user_id: str) -> dict:
    supabase = get_supabase()
    accounts = (
        supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    ).data or []
    account_ids = [a["id"] for a in accounts]
    if not account_ids:
        return {"transactions": []}

    result = (
        supabase.table("transactions")
        .select("category, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=True)
        .limit(500)
        .execute()
    )
    return {"transactions": result.data or []}
