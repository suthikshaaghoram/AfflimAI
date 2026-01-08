"""
RAG-based translation pipeline.
Translates English manifestations to target languages while preserving
emotional tone, manifestation phrasing, and psychological intent.
"""

from typing import List, Dict
import logging
import re
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
    
    # SPECIAL PATH FOR TAMIL (As per strict user instruction)
    if target_language == "ta":
        # The System Prompt is now extremely detailed. 
        # We should keep the User Prompt clean to strictly provide the input data.
        prompt = f"""{context_section}

ORIGINAL ENGLISH TEXT TO TRANSLATE:
{chunk_text}
"""
        return prompt.strip()

    prompt = f"""You are an expert translator specializing in manifestation and affirmation language with deep knowledge of {lang_name} culture and expressions.

TASK: Translate the following English manifestation text to {lang_instruction}.

CRITICAL TRANSLATION PRINCIPLES:
1. PRESERVE EMOTIONAL TONE: The translation must carry the EXACT SAME emotional weight and inspirational power as the original
2. USE SIMPLE, CONVERSATIONAL {lang_name.upper()}: Use words that people use in daily heart-to-heart conversations. Avoid complex, formal, or textbook {lang_name}.
3. MAINTAIN MANIFESTATION POWER: Keep the affirmative, present-tense, empowering nature of manifestation language
4. CULTURAL ADAPTATION: Use culturally appropriate {lang_name} expressions and idioms that resonate emotionally
5. AVOID LITERAL TRANSLATION: Don't translate mechanically - capture the essence and spirit
6. KEEP PERSONAL PRONOUNS: Maintain second-person "you" addressing (तुम/आप for Hindi, நீ/நீங்கள் for Tamil)

SPECIFIC RULES:
- Use "Simple Tamil" (எளிய தமிழ்) for maximum emotional connection.
- Avoid Sanskritized or highly formal words if a simpler native word exists.
- Do NOT simplify or dilute the message's MEANING, but simplfy the VOCABULARY.
- Do NOT add explanatory phrases or meta-commentary
- Do NOT change the sentence structure unnecessarily  
- DO use flowing, poetic {lang_name} that sounds NATURAL and POWERFUL
- DO preserve all personal details (names, achievements, goals) exactly
- DO maintain the motivational and uplifting tone throughout
- Output ONLY the translation (no headers, labels, or explanations)
- NO meta-notes (e.g. "(Note: translated from...)")
- NO repetition of words

CRITICAL FIDELITY CHECK:
You MUST translate every single sentence. Do not skip or summarize any part of the input.
Translate sentence by sentence to ensure complete coverage.

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
    
    if target_language == "ta":
        system_prompt = """You are a bilingual English–Tamil language expert and a professional localization translator.

Your task is to translate the given English text into Tamil with **100% semantic accuracy** and **natural spoken flow**.

━━━━━━━━━━━━━━━━━━━━━━
PRIMARY OBJECTIVE (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━
The Tamil output MUST:
- Preserve the **exact meaning** of every sentence
- Preserve the **intent** and **emotional tone**
- Preserve the **logical flow**
- NOT add new ideas
- NOT remove any ideas

This is a **faithful translation**, not a summary or rewrite.

━━━━━━━━━━━━━━━━━━━━━━
TRANSLATION MODE
━━━━━━━━━━━━━━━━━━━━━━
Use **Meaning-Preserving Natural Translation**:
- Translate sentence-by-sentence
- Keep the same intent per sentence
- You may change sentence structure ONLY if required for correct and natural Tamil
- If a sentence exists in English, its meaning MUST exist in Tamil

━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE STYLE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━
- Use **simple spoken Tamil**
- Calm, steady tone
- Second person (“நீ”)
- Present tense only
- No formal, academic, or literary Tamil
- No poetic exaggeration

The output must sound like a **human inner voice** when read aloud.

━━━━━━━━━━━━━━━━━━━━━━
AUDIO / TTS SAFETY RULES
━━━━━━━━━━━━━━━━━━━━━━
- Prefer short, clear sentences
- Use commas and periods for pauses
- Avoid long compound sentences
- Avoid rare or complex Tamil words
- Flow must be comfortable at slow speech speed

━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL & PROPER NOUN HANDLING (STRICT)
━━━━━━━━━━━━━━━━━━━━━━
DO NOT translate these terms. Keep them exactly in English:
- AI/ML
- Backend Developer
- Software Engineer
- Internship
- Full-time
- Hackathon
- Open-source
- Python
- Technical Lead
- Event / Meetup names (e.g., FOSS United Chennai, YuniQ)

━━━━━━━━━━━━━━━━━━━━━━
EMOTIONAL FIDELITY RULE
━━━━━━━━━━━━━━━━━━━━━━
For each English sentence, ask: “What is the feeling this sentence creates?”
The Tamil sentence MUST create the **same feeling**.

━━━━━━━━━━━━━━━━━━━━━━
PROHIBITED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━
❌ Do NOT paraphrase loosely  
❌ Do NOT summarize  
❌ Do NOT generalize  
❌ Do NOT repeat ideas  
❌ Do NOT add motivational lines  
❌ Do NOT remove specific achievements or references  

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT)
━━━━━━━━━━━━━━━━━━━━━━
Return ONLY the Tamil translation.
- No English
- No explanations
- No headings
- No quotes
- No markdown

━━━━━━━━━━━━━━━━━━━━━━
FINAL VERIFICATION (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━
Before responding, internally verify:
- Every English idea exists in Tamil
- No new ideas are added
- No ideas are missing
- Meaning matches sentence-by-sentence
- Tamil sounds natural when spoken"""
    else:
        # Fallback for other languages
        lang_info = SUPPORTED_LANGUAGES.get(target_language, {})
        lang_name = lang_info.get("name", "Target Language")
        system_prompt = f"You are a world-class translator and poet specializing in {lang_name}. Your mission is to translate English manifestation affirmations into emotionally resonant, simple, and powerful {lang_name} (Simple Conversational Style)."

    # Generate translation via LLM
    # Note: verify_ssl or other params might be needed depending on environment, but standard call is enough.
    translated_text = generate_text(prompt, system_prompt=system_prompt, expect_tags=False)
    
    return clean_llm_artifacts(translated_text)

def clean_llm_artifacts(text: str) -> str:
    """
    Aggressively strips LLM meta-commentary that leaks into output.
    Common with smaller models (1B-3B) even with negative constraints.
    """
    # 1. Strip end-of-text notes
    patterns = [
        r'Translation strategy:.*',
        r'Translation Strategy:.*',
        r'Note:.*',
        r'NOTE:.*',
        r'Explanation:.*',
        r'Here is the translation:.*',
        r'Translated text:.*',
        r'Key terms used:.*'
    ]
    
    for pattern in patterns:
        # DOTALL to catch multi-line notes at the end
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
        
    # 2. Strip parenthetical meta-notes within text
    # e.g. "Some text (translated from X)"
    meta_patterns = [
        r'\(\s*Note:.*?\)',
        r'\(\s*Translation:.*?\)',
        r'\(\s*Literal:.*?\)'
    ]
    for pattern in meta_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)

    return text.strip()

def strip_emotional_tags(text: str) -> str:
    """
    Removes emotional tags from text to prepare it for translation.
    
    Rules:
    1. Single tags ([pause]) -> Removed (replaced with space)
    2. Paired tags ([whisper]text[/whisper]) -> Tags removed, content kept
    """
    # 1. Remove paired tags but keep content
    # e.g., [whisper]Hello[/whisper] -> Hello
    tags = ["whisper", "slow", "gentle", "firm", "smile", "rise", "echo"]
    for tag in tags:
        pattern = rf'\[{tag}\](.*?)\[/{tag}\]'
        text = re.sub(pattern, r'\1', text, flags=re.IGNORECASE | re.DOTALL)
        
    # 2. Remove single tags
    # e.g., [pause] -> " "
    single_tags = ["pause", "breathe", "still"]
    for tag in single_tags:
        pattern = rf'\[{tag}\]'
        text = re.sub(pattern, ' ', text, flags=re.IGNORECASE)
        
    # Clean up multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def translate_with_rag(
    text: str,
    target_language: str,
    username: str = "anonymous"
) -> str:
    """
    Translate full manifestation text using RAG-based approach.
    
    This function:
    1. Strips emotional tags (for clean translation input)
    2. Chunks the English text semantically
    3. Generates embeddings for each chunk
    4. Stores chunks in vector DB
    5. Translates each chunk with RAG context
    6. Reassembles translated chunks
    
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
    
    # Step 0: Strip Emotional Tags for clean translation
    clean_text = strip_emotional_tags(text)
    
    # Step 1: Smart Context Decision
    # If text is small enough (< 3000 chars approx 750 tokens), send it ALL at once.
    # This provides SUPERIOR quality compared to chunking.
    if len(clean_text) < 3000:
        logger.info("Text fits in single context window. Using Direct Full-Context Translation.")
        chunks = [clean_text] # Treat as one massive chunk
        
        # We still generate embedding for the whole block for vector storage
        embeddings = get_embeddings_batch(chunks)
    else:
        # Fallback to chunking for massive texts
        chunks = chunk_text(clean_text, sentences_per_chunk=3)
        embeddings = get_embeddings_batch(chunks)
        
    logger.info(f"Processing {len(chunks)} chunks/blocks")
    
    # Step 3: Store chunks (same logic)
    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    store_chunks(
        chunks=chunks,
        embeddings=embeddings,
        username=username,
        session_id=session_id
    )

    # Step 4: Translate
    translated_chunks = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        logger.info(f"Translating block {i+1}/{len(chunks)}...")
        
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
