import httpx
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIAssistantService:
    """
    Multi-provider LLM service with automatic failover.

    Provider priority order (first available wins):
      1. Ollama Cloud  — ollama.com hosted models (DEFAULT, requires API key)
      2. Ollama Local  — self-hosted on localhost (no API key needed)
      3. Groq          — free tier, fast inference
      4. Gemini        — Google free tier
      5. HuggingFace   — free tier
      6. OpenAI        — paid
      7. Anthropic     — paid

    Enable providers in Backend/.env — see comments there for instructions.
    """

    def __init__(self):
        self.providers = []

        # ── 1. Ollama Cloud (DEFAULT) ─────────────────────────────────────────
        if settings.OLLAMA_CLOUD_ENABLED and settings.OLLAMA_API_KEY:
            self.providers.append(self._call_ollama_cloud)

        # ── 2. Ollama Local (fallback) ────────────────────────────────────────
        if settings.OLLAMA_ENABLED:
            self.providers.append(self._call_ollama_local)

        # ── 3-7. Other cloud providers ────────────────────────────────────────
        if settings.GROQ_API_KEY:
            self.providers.append(self._call_groq)
        if settings.GEMINI_API_KEY:
            self.providers.append(self._call_gemini)
        if settings.HF_API_KEY:
            self.providers.append(self._call_huggingface)
        if settings.OPENAI_API_KEY:
            self.providers.append(self._call_openai)
        if settings.ANTHROPIC_API_KEY:
            self.providers.append(self._call_anthropic)

    async def generate_response(self, context_str: str, user_message: str) -> str:
        """Attempt each configured provider in order until one succeeds."""
        if not self.providers:
            return (
                "No AI provider is configured. "
                "Add an API key or enable Ollama in Backend/.env to use the assistant."
            )

        system_prompt = (
            "You are FinWise AI, a helpful, encouraging, and highly intelligent personal finance assistant. "
            "You have access to the user's current financial profile. Speak directly to them, provide concise, "
            "practical advice, and never output raw JSON. If they ask about their finances, use the context below.\n\n"
            f"USER CONTEXT:\n{context_str}"
        )

        last_error = ""
        for provider_func in self.providers:
            try:
                response = await provider_func(system_prompt, user_message)
                if response:
                    return response
            except Exception as e:
                logger.warning(f"AI Provider {provider_func.__name__} failed: {e}")
                last_error = str(e)
                continue

        return (
            "I'm temporarily unable to process your request. "
            f"Please try again in a few moments. (Error: {last_error})"
        )

    # ── Ollama Cloud ──────────────────────────────────────────────────────────
    # Hosted by Ollama.com — same models as local but run in the cloud.
    # Get your API key at: https://ollama.com/settings/keys
    # Set in .env:  OLLAMA_CLOUD_ENABLED=true  |  OLLAMA_API_KEY=ollama_...
    # Models:  llama3.3:70b-cloud  |  deepseek-v3.1:671b-cloud  |  gemma3:27b-cloud

    async def _call_ollama_cloud(self, system_prompt: str, user_message: str) -> Optional[str]:
        url = "https://ollama.com/api/chat"
        payload = {
            "model": settings.OLLAMA_CLOUD_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message},
            ],
            "stream": False,
        }
        headers = {
            "Authorization": f"Bearer {settings.OLLAMA_API_KEY}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                logger.error(f"Ollama Cloud error {resp.status_code}: {resp.text}")
            resp.raise_for_status()
            return resp.json()["message"]["content"]

    # ── Ollama Local ──────────────────────────────────────────────────────────
    # Runs on your machine — no API key needed.
    # Install Ollama: https://ollama.com
    # Pull a model:   ollama pull llama3.2
    # Set in .env:    OLLAMA_ENABLED=true
    # Optional:       OLLAMA_HOST=http://localhost:11434  |  OLLAMA_MODEL=llama3.2

    async def _call_ollama_local(self, system_prompt: str, user_message: str) -> Optional[str]:
        url = f"{settings.OLLAMA_HOST}/api/chat"
        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message},
            ],
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=120.0) as client:  # longer timeout for local GPU
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Ollama Local error {resp.status_code}: {resp.text}")
            resp.raise_for_status()
            return resp.json()["message"]["content"]

    # ── Free-tier cloud providers ─────────────────────────────────────────────

    async def _call_groq(self, system_prompt: str, user_message: str) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message},
            ],
            "max_tokens": 1024,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers, json=payload,
            )
            if resp.status_code != 200:
                logger.error(f"Groq API Error: {resp.text}")
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    async def _call_gemini(self, system_prompt: str, user_message: str) -> Optional[str]:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        )
        payload = {
            "contents": [{
                "role": "user",
                "parts": [{"text": f"{system_prompt}\n\nUser: {user_message}"}],
            }],
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

    async def _call_huggingface(self, system_prompt: str, user_message: str) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.HF_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "inputs": f"{system_prompt}\n\nUser: {user_message}\nFinWise AI:",
            "parameters": {"max_new_tokens": 512, "return_full_text": False},
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
                headers=headers, json=payload,
            )
            resp.raise_for_status()
            result = resp.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_text", "").strip()
            return None

    # ── Paid cloud providers ──────────────────────────────────────────────────

    async def _call_openai(self, system_prompt: str, user_message: str) -> Optional[str]:
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message},
            ],
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers, json=payload,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]

    async def _call_anthropic(self, system_prompt: str, user_message: str) -> Optional[str]:
        headers = {
            "x-api-key": settings.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "claude-3-haiku-20240307",
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
            "max_tokens": 1024,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers, json=payload,
            )
            resp.raise_for_status()
            return resp.json()["content"][0]["text"]


ai_assistant_service = AIAssistantService()
