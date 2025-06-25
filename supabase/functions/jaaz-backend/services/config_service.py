# Configuration service
import os

class ConfigService:
    def __init__(self):
        self.app_config = {
            'openai': {
                'api_key': os.environ.get('OPENAI_API_KEY', ''),
                'base_url': 'https://api.openai.com/v1'
            },
            'anthropic': {
                'api_key': os.environ.get('ANTHROPIC_API_KEY', ''),
                'base_url': 'https://api.anthropic.com'
            },
            'ollama': {
                'api_key': '',
                'base_url': 'http://localhost:11434'
            }
        }

config_service = ConfigService()

# Files directory
FILES_DIR = os.path.join(os.path.dirname(__file__), '..', 'files')
os.makedirs(FILES_DIR, exist_ok=True)

# User data directory  
USER_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(USER_DATA_DIR, exist_ok=True)