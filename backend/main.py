import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import argus, auth, bills, insights, onboarding, pay_timing, plaid, subscriptions, transactions

load_dotenv()

app = FastAPI(
    title="ArgusAI API",
    version="0.1.0",
    description="AI-powered Financial Intelligence System",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# In development allow any localhost port; in production restrict to FRONTEND_URL
_dev_origins = [f"http://localhost:{p}" for p in range(3000, 3010)]
allow_origins = list({frontend_url, *_dev_origins})

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(plaid.router)
app.include_router(transactions.router)
app.include_router(bills.router)
app.include_router(subscriptions.router)
app.include_router(insights.router)
app.include_router(onboarding.router)
app.include_router(argus.router)
app.include_router(pay_timing.router)


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "argusai-api"}
