import logging
import requests
import json
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from .config import settings

logger = logging.getLogger(__name__)

class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        pass
        
    @abstractmethod
    def get_name(self) -> str:
        pass

class NovitaProvider(LLMProvider):
    """Provider for Novita AI (via Hugging Face Router compatible API)."""
    
    def get_name(self) -> str:
        return "Novita (HuggingFace)"
        
    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        api_url = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": settings.MODEL_ID,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4000,
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content']
            
            # Raise specific error for failover
            logger.warning(f"Novita API Error: {response.status_code} - {response.text}")
            raise Exception(f"Provider Error {response.status_code}")
            
        except Exception as e:
            logger.error(f"Novita Request Failed: {e}")
            raise e

class GroqProvider(LLMProvider):
    """Provider for Groq (High-speed, Free Tier)."""
    
    def get_name(self) -> str:
        return "Groq"
        
    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        api_key = getattr(settings, "GROQ_API_KEY", None)
        if not api_key:
            raise Exception("GROQ_API_KEY not configured")
            
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Use Llama 3 8B or Mixtral as robust defaults
        model = getattr(settings, "GROQ_MODEL", "llama3-8b-8192")
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4000,
            "temperature": 0.7
        }
        
        # Retry logic for Rate Limits (429)
        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                response = requests.post(api_url, headers=headers, json=payload, timeout=30)
                
                if response.status_code == 200:
                    result = response.json()
                    if 'choices' in result and len(result['choices']) > 0:
                        return result['choices'][0]['message']['content']
                
                # Check for Rate Limit
                if response.status_code == 429:
                    error_data = response.json()
                    error_msg = error_data.get("error", {}).get("message", "")
                    
                    if "try again in" in error_msg:
                        import time
                        # Extract wait time or default to 5s
                        wait_time = 5
                        try:
                            # Simple heuristic: if it says "1.47s", we wait 2s.
                            # Just wait 5s to be safe.
                            pass
                        except:
                            pass
                            
                        if attempt < max_retries:
                            logger.warning(f"Groq Rate Limit Hit. Waiting {wait_time}s before retry {attempt+1}/{max_retries}...")
                            time.sleep(wait_time)
                            continue
                            
                logger.warning(f"Groq API Error: {response.status_code} - {response.text}")
                raise Exception(f"Provider Error {response.status_code}")
                
            except Exception as e:
                # If it's the last attempt, raise
                if attempt == max_retries:
                    logger.error(f"Groq Request Failed: {e}")
                    raise e
                time.sleep(1) # Basic backoff

class OllamaProvider(LLMProvider):
    """Provider for Local Ollama."""
    
    def get_name(self) -> str:
        return "Ollama (Local)"
        
    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        base_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
        api_url = f"{base_url}/api/chat"
        
        # Default models to try in order preference
        # The user prioritized: qwen2.5, llama3.1, mistral
        model = getattr(settings, "OLLAMA_MODEL", "llama3") 
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "stream": False,
            "options": {
                "temperature": 0.3, # Lowered for stability on small models
                "repeat_penalty": 1.2, # Critical to prevent loop hallucinations
                "top_p": 0.9,
                "top_k": 40,
                "num_predict": 4000
            }
        }
        
        try:
            # Increase timeout for slow local machines (300s = 5 mins)
            response = requests.post(api_url, json=payload, timeout=300)
            
            if response.status_code == 200:
                result = response.json()
                if 'message' in result:
                    return result['message']['content']
            
            logger.warning(f"Ollama API Error: {response.status_code}")
            raise Exception(f"Provider Error {response.status_code}")
            
        except requests.exceptions.ConnectionError:
            # Common error if Ollama is not running
            raise Exception("Ollama Connection Refused (Is it running?)")
        except Exception as e:
            logger.error(f"Ollama Request Failed: {e}")
            raise e

class DeepSeekProvider(LLMProvider):
    """Provider for DeepSeek Official API."""
    
    def get_name(self) -> str:
        return "DeepSeek (Official)"
        
    def generate_text(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        api_key = getattr(settings, "DEEPSEEK_API_KEY", None)
        if not api_key:
            raise Exception("DEEPSEEK_API_KEY not configured")
            
        api_url = "https://api.deepseek.com/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 4000,
            "temperature": 0.7,
            "stream": False
        }
        
        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content']
            
            error_msg = f"DeepSeek API Error: {response.status_code} - {response.text}"
            logger.warning(error_msg)
            raise Exception(error_msg)
            
        except Exception as e:
            logger.error(f"DeepSeek Request Failed: {e}")
            raise e

class ProviderManager:
    """Manages failover between LLM providers."""
    
    def __init__(self):
        self.providers: List[LLMProvider] = []
        self._init_providers()
        
    def _init_providers(self):
        # Priority Order:
        # 1. Novita (HuggingFace Router) - Current Primary
        # 2. DeepSeek (Official) - If key provided
        # 3. Groq (Fast Fallback) - If key provided
        # 4. Ollama (Local) - If running
        
        self.providers.append(NovitaProvider())
        self.providers.append(DeepSeekProvider())
        self.providers.append(GroqProvider())
        self.providers.append(OllamaProvider())
        
    def generate_text_with_fallback(self, prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
        """
        Try providers in sequence until one succeeds.
        """
        errors = []
        
        for provider in self.providers:
            try:
                # Check prerequisites quickly before attempting (optimization)
                # For now, just try-catch works.
                logger.info(f"Attempting generation with {provider.get_name()}...")
                return provider.generate_text(prompt, system_prompt)
            except Exception as e:
                error_msg = f"{provider.get_name()} failed: {str(e)}"
                # Don't log expected config errors as warnings
                if "not configured" in str(e):
                    logger.info(f"Skipping {provider.get_name()} (Not configured)")
                else:
                    logger.warning(error_msg)
                errors.append(error_msg)
                continue
                
        # All failed
        raise Exception(f"All AI providers failed. Errors: {'; '.join(errors)}")

# Global instance
provider_manager = ProviderManager()
