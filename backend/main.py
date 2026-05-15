import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, plaid

load_dotenv()

app = FastAPI(
    title="ArgusAI API",
    version="0.1.0",
    description="AI-powered Financial Intelligence System",
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(plaid.router)


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "argusai-api"}
