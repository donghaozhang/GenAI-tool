# SSL test router
from fastapi import APIRouter

router = APIRouter(prefix="/api/ssl", tags=["ssl"])

@router.get("/test")
async def ssl_test():
    return {"status": "ok", "message": "SSL test passed"}