"""
Copilot router: /copilot/chat endpoint using LangGraph multi-agent.
Streaming SSE responses.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import json
import asyncio
from supervisor import invoke_copilot, AgentState
from supabase import create_client
import os
from dotenv import load_dotenv
from ..middleware.auth import get_current_user  # Assume auth middleware

load_dotenv()

router = APIRouter(prefix="/copilot", tags=["copilot"])

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None  # For memory

class ChatResponse(BaseModel):
    role: str  # "assistant"
    content: str
    agent: str | None  # e.g., "CashflowAgent"

@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user=Depends(get_current_user)
):
    user_id = current_user["id"]

    async def event_stream():
        try:
            # Invoke multi-agent graph
            result = await invoke_copilot(user_id, request.message)
            
            # Stream chunks (simulate streaming for now; extend for real token stream)
            for msg in result["messages"]:
                if msg.type == "ai":
                    chunk = {
                        "id": "msg",
                        "type": "message",
                        "content": msg.content,
                        "agent": getattr(msg, "agent", None)  # From graph metadata
                    }
                    yield f"data: {json.dumps(chunk)}\n\n"
                    await asyncio.sleep(0.05)  # Simulate streaming
            
            # Final disclaimer
            disclaimer = {
                "id": "disclaimer",
                "type": "system",
                "content": "Agents powered by custom LangGraph multi-agent system. Not financial advice."
            }
            yield f"data: {json.dumps(disclaimer)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

# Memory persistence (future)
@router.post("/memory")
async def save_memory(conversation_id: str, state: AgentState, current_user=Depends(get_current_user)):
    # Save to ai_insights.conversation_history JSONB
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    supabase.table("ai_insights").insert({
        "user_id": current_user["id"],
        "insight_type": "agent_memory",
        "structured_output_json": state
    }).execute()
    return {"status": "saved"}
