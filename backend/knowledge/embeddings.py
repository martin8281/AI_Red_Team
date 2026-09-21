import os
import aiohttp
from typing import List, Optional
from ..core.config import settings

class OllamaEmbeddingClient:
    def __init__(self, model_name: Optional[str] = None, base_url: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self.base_url = base_url or settings.OLLAMA_BASE_URL

    async def get_embedding(self, text: str) -> List[float]:
        """
        Calls Ollama POST /api/embeddings using nomic-embed-text.
        """
        payload = {
            "model": self.model_name,
            "prompt": text,
        }
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/api/embeddings", json=payload, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        return data.get("embedding", [])
        except Exception:
            pass

        # Fallback pseudo-vector for offline simulation (768-dimension zeros)
        return [0.0] * 768
