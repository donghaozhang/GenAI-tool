#!/usr/bin/env python3
"""
Simplified Jaaz Backend Server
A minimal version that provides WebSocket support and basic AI chat functionality
"""

import os
import sys
import asyncio
import argparse
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

# Simple WebSocket manager
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting Jaaz Backend Server...")
    yield
    print("🛑 Shutting down Jaaz Backend Server...")

app = FastAPI(lifespan=lifespan, title="Jaaz Backend API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic API endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Jaaz Backend is running"}

# WebSocket events
@sio.event
async def connect(sid, environ):
    print(f"🔗 Client connected: {sid}")
    await sio.emit('connected', {'status': 'connected'}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")

@sio.event
async def ping(sid, data):
    print(f"🏓 Ping from {sid}: {data}")
    await sio.emit('pong', {'timestamp': data.get('timestamp', 0)}, room=sid)

@sio.event
async def chat_message(sid, data):
    """Handle chat messages and simulate AI response"""
    print(f"💬 Chat message from {sid}: {data}")
    
    session_id = data.get('session_id')
    message = data.get('message', '')
    
    # Simulate AI processing
    await sio.emit('delta', {
        'session_id': session_id,
        'type': 'delta',
        'text': 'I received your message: "' + message + '". '
    }, room=sid)
    
    await asyncio.sleep(1)
    
    await sio.emit('delta', {
        'session_id': session_id,
        'type': 'delta', 
        'text': 'Let me generate an image for you...'
    }, room=sid)
    
    await asyncio.sleep(2)
    
    # Simulate image generation
    await sio.emit('image_generated', {
        'session_id': session_id,
        'type': 'image_generated',
        'image_url': 'https://picsum.photos/512/512',
        'element': {
            'type': 'image',
            'id': 'test_image_' + str(asyncio.get_event_loop().time()),
            'x': 100,
            'y': 100,
            'width': 512,
            'height': 512
        }
    }, room=sid)
    
    await sio.emit('done', {
        'session_id': session_id,
        'type': 'done'
    }, room=sid)

# Create Socket.IO ASGI application
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/socket.io')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=57988, help='Port to run the server on')
    args = parser.parse_args()
    
    import uvicorn
    print(f"🌟 Starting Jaaz Backend on port {args.port}")
    print(f"🔗 WebSocket endpoint: ws://localhost:{args.port}/socket.io")
    print(f"🌐 API endpoint: http://localhost:{args.port}/api/health")
    
    uvicorn.run(socket_app, host="127.0.0.1", port=args.port, log_level="info")