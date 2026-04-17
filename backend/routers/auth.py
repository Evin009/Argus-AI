import os

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client, create_client

from middleware.auth import get_current_user

router = APIRouter(prefix="/api", tags=["auth"])


def get_supabase() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    """Returns the public.users profile for the authenticated user."""
    supabase = get_supabase()
    result = supabase.table("users").select("*").eq("id", user_id).maybe_single().execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Call POST /api/users/sync to create it.",
        )

    return result.data


@router.post("/users/sync", status_code=201)
async def sync_user(user_id: str = Depends(get_current_user)):
    """
    Creates or updates the public.users row from the authenticated JWT claims.
    Call this once after signup before any other API usage.
    """
    supabase = get_supabase()

    auth_user = supabase.auth.admin.get_user_by_id(user_id)
    if not auth_user.user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auth user not found",
        )

    user_data = {
        "id": user_id,
        "email": auth_user.user.email,
        "auth_provider": (auth_user.user.app_metadata or {}).get("provider", "email"),
    }

    supabase.table("users").upsert(user_data).execute()
    return {"synced": True, "user_id": user_id}
