# Files service for handling file operations
import os
from fastapi.responses import FileResponse

def download_file(file_path: str):
    """Download a file from the server"""
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise FileNotFoundError(f"File not found: {file_path}")