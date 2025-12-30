"""
Embedding caching system for performance optimization.
Uses hash-based persistent caching to avoid re-generating embeddings.
"""

import hashlib
import json
import logging
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)

class EmbeddingCache:
    """
    Persistent cache for embeddings to improve translation performance.
    
    Benefits:
    - First translation: Generate embeddings (~2-3s)
    - Subsequent translations: Load from cache (<0.1s)
    - Deterministic hashing ensures same text = same cache key
    """
    
    def __init__(self, cache_dir: str = "./cache/embeddings"):
        """
        Initialize embedding cache.
        
        Args:
            cache_dir: Directory to store cached embeddings
        """
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Embedding cache initialized at: {self.cache_dir}")
    
    def _get_hash(self, text: str) -> str:
        """
        Generate deterministic hash for text.
        
        Args:
            text: Input text to hash
            
        Returns:
            16-character hex hash
        """
        # Use SHA256 for deterministic hashing
        # Truncate to 16 chars for shorter filenames
        return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
    
    def get(self, text: str) -> Optional[List[float]]:
        """
        Retrieve cached embedding for text.
        
        Args:
            text: Text to lookup
            
        Returns:
            Cached embedding vector or None if not found
        """
        hash_key = self._get_hash(text)
        cache_file = self.cache_dir / f"{hash_key}.json"
        
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    data = json.load(f)
                    logger.debug(f"Cache HIT for hash: {hash_key}")
                    return data['embedding']
            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"Cache file corrupted: {cache_file}, error: {e}")
                return None
        
        logger.debug(f"Cache MISS for hash: {hash_key}")
        return None
    
    def set(self, text: str, embedding: List[float]) -> None:
        """
        Store embedding in cache.
        
        Args:
            text: Original text
            embedding: Embedding vector to cache
        """
        hash_key = self._get_hash(text)
        cache_file = self.cache_dir / f"{hash_key}.json"
        
        try:
            with open(cache_file, 'w') as f:
                json.dump({
                    'hash': hash_key,
                    'text_length': len(text),
                    'embedding_dim': len(embedding),
                    'embedding': embedding
                }, f)
            logger.debug(f"Cached embedding for hash: {hash_key}")
        except Exception as e:
            logger.error(f"Failed to cache embedding: {e}")
    
    def clear(self) -> int:
        """
        Clear all cached embeddings.
        
        Returns:
            Number of files deleted
        """
        count = 0
        for cache_file in self.cache_dir.glob("*.json"):
            cache_file.unlink()
            count += 1
        
        logger.info(f"Cleared {count} cached embeddings")
        return count
    
    def get_stats(self) -> dict:
        """
        Get cache statistics.
        
        Returns:
            Dict with cache stats
        """
        cache_files = list(self.cache_dir.glob("*.json"))
        total_size = sum(f.stat().st_size for f in cache_files)
        
        return {
            "total_entries": len(cache_files),
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "cache_dir": str(self.cache_dir)
        }


# Global cache instance (singleton)
_embedding_cache = None

def get_embedding_cache() -> EmbeddingCache:
    """
    Get global embedding cache instance (singleton).
    
    Returns:
        EmbeddingCache instance
    """
    global _embedding_cache
    
    if _embedding_cache is None:
        _embedding_cache = EmbeddingCache()
    
    return _embedding_cache
