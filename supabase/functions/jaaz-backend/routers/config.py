# Config router
from fastapi import APIRouter

router = APIRouter(prefix="/api/config", tags=["config"])

@router.get("/")
async def get_config():
    return {"status": "ok", "message": "Config router working"}