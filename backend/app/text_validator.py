"""
Text validation and enforcement for generation modes.
Ensures strict word limits and semantic trimming.
"""
import re
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

MODE_LIMITS = {
    "quick": {"target": (200, 250), "max": 250},
    "deep": {"target": (400, 500), "max": 500}
}

def count_words(text: str) -> int:
    """
    Count words in text.
    
    Args:
        text: Input text
        
    Returns:
        Word count
    """
    # Remove extra whitespace
    text = ' '.join(text.split())
    # Split on whitespace
    return len(text.split())

def enforce_word_limit(text: str, mode: str) -> Tuple[str, int, bool]:
    """
    Enforce word limit for given mode.
    Trims at sentence boundary if exceeded.
    
    Args:
        text: Generated manifestation text
        mode: Generation mode ("quick" or "deep")
        
    Returns:
        Tuple of (validated_text, word_count, was_trimmed)
    """
    word_count = count_words(text)
    max_words = MODE_LIMITS[mode]["max"]
    
    if word_count <= max_words:
        logger.info(f"Text within limit: {word_count}/{max_words} words for '{mode}' mode")
        return text, word_count, False
    
    # Text exceeds limit - trim at semantic boundary
    logger.warning(f"Text exceeds limit: {word_count}/{max_words} words for '{mode}' mode. Trimming...")
    trimmed_text = trim_at_sentence_boundary(text, max_words)
    final_count = count_words(trimmed_text)
    
    logger.info(f"Trimmed to {final_count} words")
    return trimmed_text, final_count, True

def trim_at_sentence_boundary(text: str, max_words: int) -> str:
    """
    Trim text to max_words at nearest sentence boundary.
    Preserves semantic coherence by keeping complete sentences.
    
    Args:
        text: Input text
        max_words: Maximum word count
        
    Returns:
        Trimmed text ending at sentence boundary
    """
    # Split into sentences (at . ! ? followed by space)
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    trimmed = []
    current_count = 0
    
    for sentence in sentences:
        sentence_words = count_words(sentence)
        if current_count + sentence_words <= max_words:
            trimmed.append(sentence)
            current_count += sentence_words
        else:
            # Would exceed limit, stop here
            break
    
    result = ' '.join(trimmed)
    
    # Ensure we have proper ending punctuation
    if result and not result.endswith(('.', '!', '?')):
        result += '.'
    
    return result

def validate_mode(mode: Optional[str]) -> str:
    """
    Validate and normalize generation mode.
    
    Args:
        mode: Input mode (can be None or invalid)
        
    Returns:
        Valid mode ("quick" or "deep"), defaults to "deep"
    """
    if mode not in ["quick", "deep"]:
        logger.info(f"Invalid or missing mode '{mode}', defaulting to 'deep'")
        return "deep"
    return mode

def get_mode_config(mode: str) -> dict:
    """
    Get configuration for a generation mode.
    
    Args:
        mode: Generation mode
        
    Returns:
        Dict with target_words, max_words, target_duration, instruction
    """
    configs = {
        "quick": {
            "target_words": 225,
            "max_words": 250,
            "target_duration": "2 minutes",
            "instruction": "concise, focused, and impactful"
        },
        "deep": {
            "target_words": 450,
            "max_words": 500,
            "target_duration": "4 minutes",
            "instruction": "immersive, detailed, and meditative"
        }
    }
    return configs.get(mode, configs["deep"])
