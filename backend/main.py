import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    argus,
    auth,
    bills,
    calendar,
    insights,
    onboarding,
    pay_timing,
    plaid,
    profile,
    subscriptions,
    transactions,
)

load_dotenv()

app = FastAPI(
    title="ArgusAI API",
    version="0.1.0",
    description="AI-powered Financial Intelligence System",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# In development allow any localhost port; in production restrict to FRONTEND_URL
_dev_origins = [f"http://localhost:{p}" for p in range(3000, 3100)]
allow_origins = list({frontend_url, *_dev_origins})

class PrivateNetworkAccessMiddleware:
    """Pure ASGI middleware — intercepts Chrome PNA preflights before CORSMiddleware sees them.

    Chrome sends Access-Control-Request-Private-Network: true on localhost→localhost preflights.
    Starlette's CORSMiddleware returns 400 for this header; this wrapper catches it first.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            if (
                scope.get("method") == "OPTIONS"
                and headers.get(b"access-control-request-private-network") == b"true"
            ):
                origin = headers.get(b"origin", b"")
                response_headers = [
                    (b"access-control-allow-origin", origin),
                    (b"access-control-allow-credentials", b"true"),
                    (b"access-control-allow-methods", b"GET, POST, PUT, PATCH, DELETE, OPTIONS"),
                    (b"access-control-allow-headers", b"*"),
                    (b"access-control-allow-private-network", b"true"),
                    (b"access-control-max-age", b"600"),
                    (b"content-length", b"0"),
                ]
                await send({"type": "http.response.start", "status": 200, "headers": response_headers})
                await send({"type": "http.response.body", "body": b""})
                return
        await self.app(scope, receive, send)


app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(PrivateNetworkAccessMiddleware)

app.include_router(auth.router)
app.include_router(plaid.router)
app.include_router(transactions.router)
app.include_router(bills.router)
app.include_router(subscriptions.router)
app.include_router(insights.router)
app.include_router(onboarding.router)
app.include_router(argus.router)
app.include_router(pay_timing.router)
app.include_router(calendar.router)
app.include_router(profile.router)


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "argusai-api"}
