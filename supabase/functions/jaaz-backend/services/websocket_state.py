# services/websocket_state.py
import socketio
from typing import Dict

sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    async_mode='asgi'
)

active_connections: Dict[str, dict] = {}

def add_connection(socket_id: str, user_info: dict = None):
    active_connections[socket_id] = user_info or {}
    print(f"New connection added: {socket_id}, total connections: {len(active_connections)}")

def remove_connection(socket_id: str):
    if socket_id in active_connections:
        del active_connections[socket_id]
        print(f"Connection removed: {socket_id}, total connections: {len(active_connections)}")

def get_all_socket_ids():
    return list(active_connections.keys())

def get_connection_count():
    return len(active_connections)

# WebSocket event handlers
@sio.event
async def connect(sid, environ):
    print(f"🔗 Client connected: {sid}")
    add_connection(sid)
    await sio.emit('connected', {'status': 'connected', 'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")
    remove_connection(sid)

@sio.event
async def ping(sid, data):
    print(f"🏓 Ping from {sid}: {data}")
    await sio.emit('pong', {'timestamp': data.get('timestamp', 0)}, room=sid)
