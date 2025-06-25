# Stream service for managing active tasks
import asyncio
from typing import Dict, Optional

# Global dictionary to store active stream tasks
stream_tasks: Dict[str, asyncio.Task] = {}

def add_stream_task(session_id: str, task: asyncio.Task):
    """Add a stream task for a session"""
    stream_tasks[session_id] = task

def remove_stream_task(session_id: str):
    """Remove a stream task for a session"""
    if session_id in stream_tasks:
        del stream_tasks[session_id]

def get_stream_task(session_id: str) -> Optional[asyncio.Task]:
    """Get the active stream task for a session"""
    return stream_tasks.get(session_id)

async def cancel_stream_task(session_id: str):
    """Cancel the active stream task for a session"""
    task = get_stream_task(session_id)
    if task and not task.done():
        task.cancel()
    remove_stream_task(session_id)