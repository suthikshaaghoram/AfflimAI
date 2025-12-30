"""
Semantic text chunking for manifestation passages.
Splits text into meaningful chunks while preserving narrative flow.
"""

import nltk
from typing import List
import logging

logger = logging.getLogger(__name__)

# Download required NLTK data on first import
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    logger.info("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt', quiet=True)

def chunk_text(text: str, sentences_per_chunk: int = 3) -> List[str]:
    """
    Split text into semantic chunks of 2-3 sentences each.
    
    This preserves the narrative flow by not breaking mid-thought
    and creates chunks that are meaningful for translation context.
    
    Args:
        text: The full manifestation text to chunk
        sentences_per_chunk: Number of sentences per chunk (default: 3)
        
    Returns:
        List of text chunks, each containing 2-3 sentences
    """
    # Tokenize into sentences
    sentences = nltk.sent_tokenize(text)
    
    if len(sentences) == 0:
        return []
    
    chunks = []
    current_chunk = []
    
    for i, sentence in enumerate(sentences):
        current_chunk.append(sentence)
        
        # Create chunk when we have enough sentences or reached the end
        if len(current_chunk) >= sentences_per_chunk or i == len(sentences) - 1:
            chunk_text = ' '.join(current_chunk)
            chunks.append(chunk_text)
            current_chunk = []
    
    logger.info(f"Chunked text into {len(chunks)} semantic chunks from {len(sentences)} sentences")
    return chunks

def chunk_with_overlap(text: str, sentences_per_chunk: int = 3, overlap: int = 1) -> List[dict]:
    """
    Split text into overlapping chunks for better context preservation.
    
    Args:
        text: The full manifestation text to chunk
        sentences_per_chunk: Number of sentences per chunk
        overlap: Number of overlapping sentences between chunks
        
    Returns:
        List of dicts with 'text' and 'position' keys
    """
    sentences = nltk.sent_tokenize(text)
    
    if len(sentences) == 0:
        return []
    
    chunks = []
    start = 0
    position = 0
    
    while start < len(sentences):
        end = min(start + sentences_per_chunk, len(sentences))
        chunk_sentences = sentences[start:end]
        chunk_text = ' '.join(chunk_sentences)
        
        chunks.append({
            'text': chunk_text,
            'position': position,
            'sentence_start': start,
            'sentence_end': end
        })
        
        position += 1
        start += (sentences_per_chunk - overlap)
    
    logger.info(f"Created {len(chunks)} overlapping chunks from {len(sentences)} sentences")
    return chunks

def semantic_chunk_text(text: str, target_chunks: int = 5, max_chunks: int = 10) -> List[str]:
    """
    Create semantic chunks based on paragraphs/thought boundaries.
    Optimized for performance - targets 4-6 chunks instead of 15-20.
    
    Args:
        text: Input text to chunk
        target_chunks: Target number of chunks (default: 5)
        max_chunks: Maximum number of chunks (default: 10)
        
    Returns:
        List of text chunks
    """
    # Split by double newlines (paragraphs)
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    # If already optimal size
    if len(paragraphs) <= target_chunks:
        logger.info(f"Text already has {len(paragraphs)} paragraphs (target: {target_chunks})")
        return paragraphs
    
    # Merge smaller paragraphs into semantic chunks
    chunks = []
    current_chunk = ""
    target_size = len(text) // target_chunks
    
    for i, para in enumerate(paragraphs):
        # If adding this paragraph doesn't exceed target size by much
        if len(current_chunk) + len(para) < target_size * 1.5:
            current_chunk += "\n\n" + para if current_chunk else para
        else:
            # Save current chunk and start new one
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
            
            # Stop if we've reached max chunks
            if len(chunks) >= max_chunks:
                # Add remaining paragraphs to last chunk
                remaining = paragraphs[i:]
                if current_chunk:
                    chunks[-1] += "\n\n" + "\n\n".join(remaining)
                break
    
    # Add final chunk
    if current_chunk and len(chunks) < max_chunks:
        chunks.append(current_chunk.strip())
    
    logger.info(f"Created {len(chunks)} semantic chunks from {len(paragraphs)} paragraphs (target: {target_chunks})")
    return chunks
