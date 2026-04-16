"""
Shared RAG retriever for ArgusAI agents using Supabase pgvector.
Embeds query -> cosine search on transactions.embedding -> returns context.
"""

import openai
from typing import List, Dict, Any
from supabase import create_client, Client
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

class RetrievalContext(BaseModel):
    transactions: List[Dict[str, Any]]
    summary: str

class RAGRetriever:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.embedding_model = "text-embedding-3-small"
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def embed_query(self, query: str) -> List[float]:
        """Embed query text."""
        response = await self.openai_client.embeddings.create(
            input=query,
            model=self.embedding_model
        )
        return response.data[0].embedding

    async def retrieve(self, user_id: str, query: str, k: int = 10) -> RetrievalContext:
        """RAG: embed query -> pgvector search -> format context."""
        embedding = await self.embed_query(query)

        result = self.supabase.rpc(
            "match_transactions_by_embedding",  # RPC func assumed (create if missing)
            {
                "query_embedding": embedding,
                "user_id": user_id,
                "match_count": k,
                "match_threshold": 0.78  # Cosine threshold
            }
        ).execute()

        transactions = result.data

        # Summarize context
        context_text = "\n".join([f"{t['merchant']} ${t['amount']} on {t['transaction_date'][:10]} ({t.get('category', 'uncat')})" for t in transactions])
        summary = f"Top {k} relevant transactions for '{query}': {context_text}"

        return RetrievalContext(transactions=transactions, summary=summary)
