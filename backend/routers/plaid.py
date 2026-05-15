import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db.client import get_supabase
from middleware.auth import get_current_user
from services.encryption import decrypt_token, encrypt_token
from services.plaid_client import PLAID_COUNTRY_CODES, PLAID_PRODUCTS, get_plaid_client
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser

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
            "linked_at": datetime.now(timezone.utc).isoformat(),
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

        for acct in accounts:
            balances = acct["balances"]
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
                    "last_synced": datetime.now(timezone.utc).isoformat(),
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
