import os

from celery import Celery
from dotenv import load_dotenv

load_dotenv()

celery = Celery(
    "argusai",
    broker=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    include=["tasks.sync_transactions", "tasks.generate_embeddings"],
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)
