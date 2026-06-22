import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.liabilities_get_request import LiabilitiesGetRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from pydantic import BaseModel

from db.client import get_supabase
from middleware.auth import get_current_user
from services.encryption import encrypt_token
from services.liabilities import extract_liability_fields
from services.plaid_client import PLAID_COUNTRY_CODES, PLAID_PRODUCTS, get_plaid_client

router = APIRouter(prefix="/plaid", tags=["plaid"])


class ExchangeTokenRequest(BaseModel):
    public_token: str
    institution_id: str
    institution_name: str


@router.post("/link-token")
async def create_link_token(user_id: str = Depends(get_current_user)):
    client = get_plaid_client()
    request = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=user_id),
        client_name="ArgusAI",
        products=PLAID_PRODUCTS,
        country_codes=PLAID_COUNTRY_CODES,
        language="en",
    )
    try:
        response = client.link_token_create(request)
        return {"link_token": response["link_token"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exchange-token")
async def exchange_public_token(
    body: ExchangeTokenRequest,
    user_id: str = Depends(get_current_user),
):
    client = get_plaid_client()
    supabase = get_supabase()

    try:
        exchange_request = ItemPublicTokenExchangeRequest(public_token=body.public_token)
        exchange_response = client.item_public_token_exchange(exchange_request)
        access_token = exchange_response["access_token"]
        item_id = exchange_response["item_id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    encrypted = encrypt_token(access_token)

    supabase.table("plaid_items").upsert(
        {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "access_token_encrypted": encrypted,
            "institution_id": body.institution_id,
            "institution_name": body.institution_name,
            "linked_at": datetime.now(UTC).isoformat(),
        },
        on_conflict="institution_id,user_id",
    ).execute()

    # Fetch and upsert accounts from Plaid
    try:
        from plaid.model.accounts_get_request import AccountsGetRequest

        accounts_response = client.accounts_get(AccountsGetRequest(access_token=access_token))
        accounts = accounts_response["accounts"]

        item_row = (
            supabase.table("plaid_items")
            .select("id")
            .eq("user_id", user_id)
            .eq("institution_id", body.institution_id)
            .single()
            .execute()
        )
        plaid_item_id = item_row.data["id"]

        # Liabilities (APR, minimum payment) is best-effort — not every linked
        # account is debt-bearing, and some institutions don't support it.
        liability_fields: dict = {}
        try:
            liabilities_response = client.liabilities_get(LiabilitiesGetRequest(access_token=access_token))
            liability_fields = extract_liability_fields(liabilities_response["liabilities"].to_dict())
        except Exception:
            pass

        for acct in accounts:
            balances = acct["balances"]
            liability = liability_fields.get(acct["account_id"], {})
            supabase.table("accounts").upsert(
                {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "plaid_item_id": plaid_item_id,
                    "plaid_account_id": acct["account_id"],
                    "institution": body.institution_name,
                    "account_type": acct["type"].value
                    if hasattr(acct["type"], "value")
                    else str(acct["type"]),
                    "balance": balances.get("current") or balances.get("available") or 0,
                    "credit_limit": balances.get("limit"),
                    "minimum_payment": liability.get("minimum_payment"),
                    "interest_rate": liability.get("interest_rate"),
                    "last_synced": datetime.now(UTC).isoformat(),
                },
                on_conflict="plaid_account_id",
            ).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Account fetch failed: {e}")

    return {"status": "ok", "item_id": item_id}


@router.get("/accounts")
async def get_accounts(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("accounts")
        .select("*")
        .eq("user_id", user_id)
        .order("institution")
        .execute()
    )
    return {"accounts": result.data}


@router.post("/sync")
async def trigger_sync(user_id: str = Depends(get_current_user)):
    from tasks.sync_transactions import sync_transactions_for_user
    task = sync_transactions_for_user.delay(user_id)
    return {"status": "syncing", "task_id": task.id}
