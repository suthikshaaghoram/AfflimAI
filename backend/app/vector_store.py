"""
Vector database management using ChromaDB.
Stores and retrieves manifestation chunks for RAG-based translation.
"""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

# Global ChromaDB client (singleton)
_chroma_client = None
_collection = None

COLLECTION_NAME = "manifestation_chunks"

def get_chroma_client():
    """
    Get or initialize ChromaDB client (singleton).
    
    Returns:
        chromadb.Client: ChromaDB client instance
    """
    global _chroma_client
    
    if _chroma_client is None:
        # Use persistent storage in ./chroma_db directory
        persist_directory = os.path.join(os.getcwd(), "chroma_db")
        os.makedirs(persist_directory, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB with persistent storage at: {persist_directory}")
        
        _chroma_client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        logger.info("ChromaDB client initialized successfully")
    
    return _chroma_client

def get_collection():
    """
    Get or create the manifestation chunks collection.
    
    Returns:
        chromadb.Collection: Collection for storing chunks
    """
    global _collection
    
    if _collection is None:
        client = get_chroma_client()
        
        # Get or create collection
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "Manifestation text chunks for RAG translation"}
        )
        
        logger.info(f"Collection '{COLLECTION_NAME}' ready. Current count: {_collection.count()}")
    
    return _collection

def store_chunks(
    chunks: List[str],
    embeddings: List[List[float]],
    username: str,
    session_id: str,
    translations: Optional[Dict[str, str]] = None
) -> None:
    """
    Store text chunks with their embeddings in ChromaDB.
    
    Args:
        chunks: List of text chunks
        embeddings: List of embedding vectors (one per chunk)
        username: Username for identification
        session_id: Unique session identifier (timestamp)
        translations: Optional dict mapping language codes to translation collections
                     e.g., {'ta': ['chunk1_tamil', 'chunk2_tamil'], 'hi': [...]}
    """
    collection = get_collection()
    
    # Prepare data for ChromaDB
    ids = []
    metadatas = []
    
    for i, chunk in enumerate(chunks):
        chunk_id = f"{username}_{session_id}_chunk_{i}"
        ids.append(chunk_id)
        
        metadata = {
            "username": username,
            "session_id": session_id,
            "position": i,
            "chunk_text": chunk,  # Store original text in metadata for retrieval
            "timestamp": datetime.now().isoformat()
        }
        
        # Add translations to metadata if provided
        if translations:
            for lang_code, lang_chunks in translations.items():
                if i < len(lang_chunks):
                    metadata[f"translation_{lang_code}"] = lang_chunks[i]
        
        metadatas.append(metadata)
    
    # Add to collection
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,  # Store as documents too
        metadatas=metadatas
    )
    
    logger.info(f"Stored {len(chunks)} chunks for user '{username}' (session: {session_id})")

def retrieve_similar_chunks(
    query_embedding: List[float],
    top_k: int = 3,
    username: Optional[str] = None
) -> List[Dict]:
    """
    Retrieve similar chunks based on embedding similarity.
    
    Args:
        query_embedding: Embedding vector of the query chunk
        top_k: Number of similar chunks to retrieve
        username: Optional username filter (retrieve only from this user's chunks)
        
    Returns:
        List of dicts containing chunk text, metadata, and similarity distance
    """
    collection = get_collection()
    
    # Build where filter if username is provided
    where = {"username": username} if username else None
    
    # Query similar chunks
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where,
        include=["documents", "metadatas", "distances"]
    )
    
    # Format results
    similar_chunks = []
    if results['documents'] and len(results['documents'][0]) > 0:
        for i in range(len(results['documents'][0])):
            similar_chunks.append({
                'text': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'distance': results['distances'][0][i]
            })
    
    logger.info(f"Retrieved {len(similar_chunks)} similar chunks (top_k={top_k})")
    return similar_chunks

def clear_user_chunks(username: str) -> int:
    """
    Delete all chunks for a specific user.
    
    Args:
        username: Username whose chunks should be deleted
        
    Returns:
        int: Number of chunks deleted
    """
    collection = get_collection()
    
    # Get all IDs for this user
    results = collection.get(
        where={"username": username},
        include=[]
    )
    
    if results['ids']:
        collection.delete(ids=results['ids'])
        count = len(results['ids'])
        logger.info(f"Deleted {count} chunks for user '{username}'")
        return count
    
    return 0

def get_collection_stats() -> Dict:
    """
    Get statistics about the collection.
    
    Returns:
        Dict with collection statistics
    """
    collection = get_collection()
    
    return {
        "name": COLLECTION_NAME,
        "total_chunks": collection.count(),
        "persist_directory": os.path.join(os.getcwd(), "chroma_db")
    }
