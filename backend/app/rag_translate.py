"""
RAG-based translation pipeline.
Translates English manifestations to target languages while preserving
emotional tone, manifestation phrasing, and psychological intent.
"""

from typing import List, Dict
import logging
from datetime import datetime

from .chunker import chunk_text
from .embeddings import get_embedding, get_embeddings_batch
from .vector_store import store_chunks, retrieve_similar_chunks
from .hf_client import generate_text

logger = logging.getLogger(__name__)

# Language mapping
SUPPORTED_LANGUAGES = {
    "ta": {
        "name": "Tamil",
        "native_name": "தமிழ்",
        "instruction": "Tamil (தமிழ்)"
    },
    "hi": {
        "name": "Hindi",
        "native_name": "हिन्दी",
        "instruction": "Hindi (हिन्दी)"
    }
}

def build_translation_prompt(
    chunk_text: str,
    target_language: str,
    similar_chunks: List[Dict] = None
) -> str:
    """
    Build a strict translation prompt for the LLM.
    
    Args:
        chunk_text: The English chunk to translate
        target_language: Target language code (ta, hi)
        similar_chunks: Optional list of similar chunks for context
        
    Returns:
        Formatted prompt string
    """
    lang_info = SUPPORTED_LANGUAGES.get(target_language, {})
    lang_name = lang_info.get("name", target_language)
    lang_instruction = lang_info.get("instruction", lang_name)
    
    # Build context section with previous translations if available
    context_section = ""
    if similar_chunks and len(similar_chunks) > 0:
        context_section = "\n\nTRANSLATION MEMORY (use these as reference for consistent terminology):\n"
        for i, sim_chunk in enumerate(similar_chunks[:3], 1):
            # Check if this chunk has a translation in the target language
            translation_key = f"translation_{target_language}"
            if translation_key in sim_chunk.get('metadata', {}):
                # Show both English and existing translation as reference
                context_section += f"{i}. ENGLISH: {sim_chunk['text'][:100]}...\n"
                context_section += f"   {lang_name.upper()}: {sim_chunk['metadata'][translation_key][:100]}...\n\n"
            else:
                # No translation available for this chunk yet
                context_section += f"{i}. {sim_chunk['text'][:150]}... (no {lang_name} translation yet)\n"
    
    prompt = f"""You are an expert translator specializing in manifestation and affirmation language with deep knowledge of {lang_name} culture and expressions.

TASK: Translate the following English manifestation text to {lang_instruction}.

CRITICAL TRANSLATION PRINCIPLES:
1. PRESERVE EMOTIONAL TONE: The translation must carry the EXACT SAME emotional weight and inspirational power as the original
2. USE NATURAL {lang_name.upper()}: Write as a native {lang_name} speaker would naturally express these ideas, NOT word-for-word translation
3. MAINTAIN MANIFESTATION POWER: Keep the affirmative, present-tense, empowering nature of manifestation language
4. CULTURAL ADAPTATION: Use culturally appropriate {lang_name} expressions and idioms that resonate emotionally
5. AVOID LITERAL TRANSLATION: Don't translate mechanically - capture the essence and spirit
6. KEEP PERSONAL PRONOUNS: Maintain second-person "you" addressing (तुम/आप for Hindi, நீ/நீங்கள் for Tamil)

SPECIFIC RULES:
- Do NOT simplify or dilute the message
- Do NOT add explanatory phrases or meta-commentary
- Do NOT change the sentence structure unnecessarily  
- DO use flowing, poetic {lang_name} that sounds NATURAL and POWERFUL
- DO preserve all personal details (names, achievements, goals) exactly
- DO maintain the motivational and uplifting tone throughout
- Output ONLY the translation (no headers, labels, or explanations)

QUALITY CHECK:
Ask yourself: "Would a native {lang_name} speaker find this naturally inspiring and emotionally moving?"
If not, rework it to be more authentic and powerful.{context_section}

ORIGINAL ENGLISH TEXT TO TRANSLATE:
{chunk_text}

NATURAL {lang_name.upper()} TRANSLATION (emotionally resonant, culturally appropriate, grammatically perfect):"""

    return prompt.strip()

def translate_chunk(
    chunk_text: str,
    target_language: str,
    chunk_embedding: List[float],
    username: str
) -> str:
    """
    Translate a single chunk using RAG for context.
    
    Args:
        chunk_text: The chunk to translate
        target_language: Target language code
        chunk_embedding: Embedding of the chunk
        username: Username for retrieving similar chunks
        
    Returns:
        Translated chunk text
    """
    # Retrieve similar chunks for context (from same user if available)
    similar_chunks = retrieve_similar_chunks(
        query_embedding=chunk_embedding,
        top_k=2,
        username=username
    )
    
    # Build translation prompt
    prompt = build_translation_prompt(chunk_text, target_language, similar_chunks)
    
    # Generate translation via LLM
    translated_text = generate_text(prompt)
    
    return translated_text.strip()

def translate_with_rag(
    text: str,
    target_language: str,
    username: str = "anonymous"
) -> str:
    """
    Translate full manifestation text using RAG-based approach.
    
    This function:
    1. Chunks the English text semantically
    2. Generates embeddings for each chunk
    3. Stores chunks in vector DB
    4. Translates each chunk with RAG context
    5. Reassembles translated chunks
    
    Args:
        text: Full English manifestation text
        target_language: Target language code (ta, hi)
        username: Username for vector store identification
        
    Returns:
        Complete translated text
        
    Raises:
        ValueError: If target language is not supported
    """
    # Validate language
    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language: {target_language}. "
            f"Supported: {', '.join(SUPPORTED_LANGUAGES.keys())}"
        )
    
    logger.info(f"Starting RAG translation to {target_language} for user: {username}")
    
    # Step 1: Chunk the text semantically
    chunks = chunk_text(text, sentences_per_chunk=3)
    logger.info(f"Created {len(chunks)} semantic chunks")
    
    if len(chunks) == 0:
        return ""
    
    # Step 2: Generate embeddings for all chunks
    embeddings = get_embeddings_batch(chunks)
    logger.info(f"Generated {len(embeddings)} embeddings")
    
    # Step 3: Store chunks in vector database (without translations yet)
    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    store_chunks(
        chunks=chunks,
        embeddings=embeddings,
        username=username,
        session_id=session_id
    )
    logger.info(f"Stored chunks in vector DB (session: {session_id})")
    
    # Step 4: Translate each chunk with RAG context
    translated_chunks = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        logger.info(f"Translating chunk {i+1}/{len(chunks)}...")
        
        translated_chunk = translate_chunk(
            chunk_text=chunk,
            target_language=target_language,
            chunk_embedding=embedding,
            username=username
        )
        
        translated_chunks.append(translated_chunk)
    
    # Step 5: Store translations back in vector DB for future reference
    try:
        # Update the chunks with translation metadata
        translation_dict = {target_language: translated_chunks}
        store_chunks(
            chunks=chunks,
            embeddings=embeddings,
            username=username,
            session_id=f"{session_id}_translated",
            translations=translation_dict
        )
        logger.info(f"Stored {target_language} translations in vector DB for translation memory")
    except Exception as e:
        logger.warning(f"Failed to store translations: {e}")
    
    # Step 6: Reassemble translated chunks
    full_translation = ' '.join(translated_chunks)
    
    logger.info(f"Translation complete. Output length: {len(full_translation)} chars")
    
    return full_translation

def get_supported_languages() -> Dict[str, Dict]:
    """
    Get information about supported languages.
    
    Returns:
        Dict mapping language codes to language info
    """
    return SUPPORTED_LANGUAGES
