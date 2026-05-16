import os

from celery_app import celery
from db.client import get_supabase
from openai import OpenAI


def _get_openai_client() -> OpenAI:
    return OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def _build_embedding_input(merchant: str, category: str, amount: float) -> str:
    return f"{merchant} {category} {amount:.2f}"


@celery.task(name="tasks.generate_embeddings.generate_embedding_for_transaction")
def generate_embedding_for_transaction(transaction_id: str) -> None:
    supabase = get_supabase()

    row = (
        supabase.table("transactions")
        .select("id, merchant, category, amount")
        .eq("id", transaction_id)
        .maybe_single()
        .execute()
    )

    if not row.data:
        return

    txn = row.data
    text = _build_embedding_input(
        txn["merchant"],
        txn["category"] or "OTHER",
        float(txn["amount"]),
    )

    client = _get_openai_client()
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    embedding = response.data[0].embedding

    supabase.table("transactions").update({"embedding": embedding}).eq(
        "id", transaction_id
    ).execute()
