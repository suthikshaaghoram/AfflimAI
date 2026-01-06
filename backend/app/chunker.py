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

def chunk_text(text: str, sentences_per_chunk: int = 3, target_token_limit: int = 140) -> List[str]:
    """
    Split text into adaptive semantic chunks.
    
    Logic:
    - Min 2 sentences (unless solitary long sentence)
    - Max 4 sentences (to prevent massive chunks)
    - Max ~140 tokens (soft limit for emotional focus)
    - Break early if token limit reached, but prefer keeping at least 2 sentences.
    
    Args:
        text: Full text
        sentences_per_chunk: Deprecated/Soft reference (max sentences)
        target_token_limit: Soft max tokens per chunk
        
    Returns:
        List of chunks
    """
    sentences = nltk.sent_tokenize(text)
    
    if not sentences:
        return []
        
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    # Heuristic: 1 word approx 1.3 tokens. 
    # Or simplified: split by spaces count.
    
    for i, sentence in enumerate(sentences):
        # Calculate approx tokens for this sentence
        sent_tokens = len(sentence.split()) * 1.3
        
        # Add to current
        current_chunk.append(sentence)
        current_tokens += sent_tokens
        
        num_sentences = len(current_chunk)
        
        # DECISION: Should we close this chunk?
        
        # Rule 1: Hard Max Sentences (4)
        if num_sentences >= 4:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_tokens = 0
            continue
            
        # Rule 2: Token Limit Reached (Soft)
        # But ensure at least 2 sentences if possible (unless this one sentence is huge)
        if current_tokens >= target_token_limit:
            if num_sentences >= 2 or sent_tokens > target_token_limit:
                 chunks.append(' '.join(current_chunk))
                 current_chunk = []
                 current_tokens = 0
            # Else: keep adding 1 more to reach min 2 (unless next one makes it massive? 
            # for now, keep logic simple: try to reach 2)
            
    # Add any remaining
    if current_chunk:
        chunks.append(' '.join(current_chunk))
        
    logger.info(f"Adaptive Chunking: {len(chunks)} chunks from {len(sentences)} sentences")
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
