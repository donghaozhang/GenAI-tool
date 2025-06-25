#!/usr/bin/env python3
"""
Full Jaaz Backend with LangGraph Multi-Agent System
Provides complete AI chat, image generation, and canvas integration
"""

import os
import sys
import io
import asyncio
import argparse
from contextlib import asynccontextmanager

# Ensure stdout and stderr use utf-8 encoding to prevent emoji logs from crashing python server
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import socketio

# Import routers
from routers import config, ssl_test
from routers.chat_router import router as chat_router
from routers.canvas import router as canvas_router
from routers.agent import router as agent_router
from routers.workspace import router as workspace_router
from routers.image_tools import router as image_tools_router
from routers.settings import router as settings_router

# Import services
from services.websocket_state import sio

root_dir = os.path.dirname(__file__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Full Jaaz Backend with LangGraph...")
    # Initialize agent if needed
    try:
        from routers.agent import initialize
        await initialize()
    except ImportError:
        print("⚠️ Agent initialization not available, continuing without it")
    yield
    print("🛑 Shutting down Jaaz Backend...")

app = FastAPI(lifespan=lifespan, title="Jaaz AI Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(config.router)
app.include_router(settings_router)
app.include_router(agent_router)
app.include_router(canvas_router)
app.include_router(workspace_router)
app.include_router(image_tools_router)
app.include_router(ssl_test.router)
app.include_router(chat_router)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok", 
        "message": "Full Jaaz Backend with LangGraph is running",
        "features": ["chat", "image_generation", "canvas", "multi_agent"]
    }

# Mount static files if available
react_build_dir = os.environ.get('UI_DIST_DIR', os.path.join(
    os.path.dirname(root_dir), "react", "dist"))

if os.path.exists(react_build_dir):
    static_site = os.path.join(react_build_dir, "assets")
    if os.path.exists(static_site):
        app.mount("/assets", StaticFiles(directory=static_site), name="assets")

    @app.get("/")
    async def serve_react_app():
        response = FileResponse(os.path.join(react_build_dir, "index.html"))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

# Create Socket.IO ASGI application
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/socket.io')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=57988, help='Port to run the server on')
    args = parser.parse_args()
    
    # Set environment variables for APIs
    os.environ.setdefault('OPENROUTER_API_KEY', os.environ.get('OPENROUTER_API_KEY', ''))
    os.environ.setdefault('ANTHROPIC_API_KEY', os.environ.get('ANTHROPIC_API_KEY', ''))
    os.environ.setdefault('OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY', ''))
    os.environ.setdefault('FAL_KEY', os.environ.get('FAL_API_KEY', ''))
    
    import uvicorn
    print(f"🌟 Starting Full Jaaz Backend on port {args.port}")
    print(f"🔗 WebSocket endpoint: ws://localhost:{args.port}/socket.io")
    print(f"🌐 API endpoint: http://localhost:{args.port}/api/health")
    print(f"🎨 Features: Multi-agent AI, Image Generation, Canvas Integration")
    
    uvicorn.run(socket_app, host="127.0.0.1", port=args.port, log_level="info")