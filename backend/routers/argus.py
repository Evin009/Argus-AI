import json
import os
from collections.abc import AsyncGenerator

import anthropic
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agents.chat import (
    _CHAT_SYSTEM_PROMPT,
    _build_chat_brief,
    _extract_prediction_block,
    _log_prediction,
    _retrieve_chat_context,
    _strip_prediction_block,
)
from middleware.auth import get_current_user

router = APIRouter(prefix="/argus", tags=["argus"])


class ChatRequest(BaseModel):
    query: str


async def _stream_chat_response(user_id: str, query: str) -> AsyncGenerator[str, None]:
    context = _retrieve_chat_context(user_id, query)
    brief = _build_chat_brief(query, context)

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    full_text = ""

    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=[{
            "type": "text",
            "text": _CHAT_SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        }],
        messages=[{"role": "user", "content": brief}],
    ) as stream:
        for chunk in stream.text_stream:
            full_text += chunk
            yield f"data: {json.dumps({'text': chunk})}\n\n"

    prediction = _extract_prediction_block(full_text)
    if prediction is not None:
        _log_prediction(user_id, prediction)

    yield f"data: {json.dumps({'done': True, 'text': _strip_prediction_block(full_text)})}\n\n"


@router.post("/chat")
async def chat(payload: ChatRequest, user_id: str = Depends(get_current_user)):
    return StreamingResponse(
        _stream_chat_response(user_id, payload.query),
        media_type="text/event-stream",
    )
