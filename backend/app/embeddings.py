"""
Multilingual text embeddings using sentence-transformers.
Provides functionality to generate semantic embeddings for RAG-based translation with caching.
"""

from sentence_transformers import SentenceTransformer
from typing import List, Union
import logging
from .cache import get_embedding_cache

logger = logging.getLogger(__name__)

# Global model instance (singleton pattern for efficiency)
_embedding_model = None

def get_embedding_model() -> SentenceTransformer:
    """
    Get or initialize the embedding model (singleton).
    
    Returns:
        SentenceTransformer: Multil...

ingual embedding model
    """
    global _embedding_model
    
    if _embedding_model is None:
        logger.info("Loading multilingual embedding model...")
        # This model supports 50+ languages in a shared embedding space
        _embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        logger.info("Embedding model loaded successfully. Dimension: 384")
    
    return _embedding_model

def get_embedding(text: str, use_cache: bool = True) -> List[float]:
    """
    Generate embedding for a single text with caching support.
    
    Args:
        text: Input text to embed
        use_cache: Whether to use cache (default: True)
        
    Returns:
        List of 384 float values representing the embedding
    """
    # Check cache first
    if use_cache:
        cache = get_embedding_cache()
        cached_embedding = cache.get(text)
        if cached_embedding is not None:
            logger.debug(f"Cache HIT - Using cached embedding ({len(text)} chars)")
            return cached_embedding
    
    # Generate new embedding
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_tensor=False)
    embedding_list = embedding.tolist()
    
    # Store in cache
    if use_cache:
        cache = get_embedding_cache()
        cache.set(text, embedding_list)
        logger.debug(f"Cache MISS - Cached new embedding ({len(text)} chars)")
    
    return embedding_list

def get_embeddings_batch(texts: List[str], use_cache: bool = True) -> List[List[float]]:
    """
    Generate embeddings for multiple texts efficiently with caching.
    
    Args:
        texts: List of input texts to embed
        use_cache: Whether to use cache (default: True)
        
    Returns:
        List of embeddings, each with 384 dimensions
    """
    if not use_cache:
        # Generate all without cache
        model = get_embedding_model()
        embeddings = model.encode(texts, convert_to_tensor=False, show_progress_bar=False)
        return [emb.tolist() for emb in embeddings]
    
    # Check cache for each text
    cache = get_embedding_cache()
    results = []
    texts_to_generate = []
    indices_to_generate = []
    
    for i, text in enumerate(texts):
        cached = cache.get(text)
        if cached is not None:
            results.append(cached)
        else:
            results.append(None)  # Placeholder
            texts_to_generate.append(text)
            indices_to_generate.append(i)
    
    # Generate missing embeddings in batch
    if texts_to_generate:
        logger.info(f"Generating {len(texts_to_generate)}/{len(texts)} embeddings (rest cached)")
        model = get_embedding_model()
        new_embeddings = model.encode(texts_to_generate, convert_to_tensor=False, show_progress_bar=False)
        
        # Store in cache and update results
        for idx, text, emb in zip(indices_to_generate, texts_to_generate, new_embeddings):
            emb_list = emb.tolist()
            cache.set(text, emb_list)
            results[idx] = emb_list
    else:
        logger.info(f"All {len(texts)} embeddings served from cache! ⚡")
    
    return results

def get_embedding_dimension() -> int:
    """
    Get the dimension of embeddings produced by this model.
    
    Returns:
        int: Embedding dimension (384)
    """
    return 384
