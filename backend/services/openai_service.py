import json
import logging
from typing import Optional

from openai import OpenAI
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from config import settings
from prompts.niche_overrides import NICHE_SYSTEM_OVERRIDES, TONE_MODIFIERS
from prompts.templates import (
    BROLL_USER_PROMPT,
    HOOK_USER_PROMPT,
    SCORE_USER_PROMPT,
    SCRIPT_USER_PROMPT,
    SOCIAL_USER_PROMPT,
    VOICEOVER_USER_PROMPT,
    build_system_context,
)

logger = logging.getLogger(__name__)

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client


def _call_openai(system_prompt: str, user_prompt: str, temperature: float = 0.8) -> dict:
    client = _get_client()
    response = client.chat.completions.create(
        model="gpt-4o",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=2000,
    )
    raw = response.choices[0].message.content
    logger.debug(f"OpenAI raw response: {raw[:200]}...")
    return json.loads(raw)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    retry=retry_if_exception_type((json.JSONDecodeError, KeyError, ValueError)),
    reraise=True,
)
def _call_with_retry(system_prompt: str, user_prompt: str, temperature: float = 0.8) -> dict:
    return _call_openai(system_prompt, user_prompt, temperature)


def _build_system_prompt(channel: dict) -> str:
    niche = channel["niche"]
    tone = channel["tone"]
    niche_override = NICHE_SYSTEM_OVERRIDES.get(niche, "Create high-quality, engaging content relevant to the niche.")
    tone_modifier = TONE_MODIFIERS.get(tone, "Be clear, engaging, and appropriate for the platform.")
    return build_system_context(
        niche=niche,
        tone=tone,
        audience=channel.get("audience", "general audience"),
        style_notes=channel.get("style_notes"),
        niche_override=niche_override,
        tone_modifier=tone_modifier,
    )


# ─── Public Generation Functions ─────────────────────────────────────────────

def generate_hooks(topic: str, channel: dict, hook_style_override: Optional[str] = None) -> dict:
    system_prompt = _build_system_prompt(channel)
    hook_style_instruction = ""
    if hook_style_override:
        hook_style_instruction = (
            f"\nIMPORTANT: Make the '{hook_style_override}' type hook the strongest option "
            f"with estimated_stop_rate: 'high'."
        )
    user_prompt = HOOK_USER_PROMPT.format(
        topic=topic,
        hook_style_instruction=hook_style_instruction,
    )
    result = _call_with_retry(system_prompt, user_prompt, temperature=0.9)
    if "hooks" not in result or not isinstance(result["hooks"], list) or len(result["hooks"]) < 5:
        raise ValueError(f"Malformed hooks response: expected list of 5, got {result}")
    return result


def generate_script(topic: str, hook: str, channel: dict) -> dict:
    system_prompt = _build_system_prompt(channel)
    user_prompt = SCRIPT_USER_PROMPT.format(topic=topic, hook=hook)
    result = _call_with_retry(system_prompt, user_prompt, temperature=0.8)
    if "script" not in result:
        raise ValueError(f"Malformed script response: missing 'script' key in {result}")
    result.setdefault("word_count", len(result["script"].split()))
    result.setdefault("estimated_duration_seconds", 55)
    return result


def generate_social_package(topic: str, script: str, channel: dict) -> dict:
    system_prompt = _build_system_prompt(channel)
    user_prompt = SOCIAL_USER_PROMPT.format(topic=topic, script=script)
    result = _call_with_retry(system_prompt, user_prompt, temperature=0.7)
    required = {"caption", "hashtags", "cta", "caption_hook"}
    missing = required - result.keys()
    if missing:
        raise ValueError(f"Malformed social package response: missing keys {missing}")
    if not isinstance(result["hashtags"], list):
        result["hashtags"] = result["hashtags"].split() if isinstance(result["hashtags"], str) else []
    return result


def generate_broll(script: str, channel: dict) -> dict:
    system_prompt = _build_system_prompt(channel)
    user_prompt = BROLL_USER_PROMPT.format(script=script)
    result = _call_with_retry(system_prompt, user_prompt, temperature=0.7)
    if "broll" not in result or not isinstance(result["broll"], list):
        raise ValueError(f"Malformed broll response: {result}")
    return result


def generate_voiceover(script: str, channel: dict) -> dict:
    system_prompt = _build_system_prompt(channel)
    user_prompt = VOICEOVER_USER_PROMPT.format(script=script)
    result = _call_with_retry(system_prompt, user_prompt, temperature=0.5)
    if "voiceover_script" not in result:
        raise ValueError(f"Malformed voiceover response: {result}")
    result.setdefault("estimated_audio_seconds", 55)
    result.setdefault("pause_count", 4)
    return result


def score_content(
    hook: str,
    hook_type: str,
    script: str,
    cta: str,
    caption_hook: str,
    niche: str,
) -> dict:
    system_prompt = (
        "You are a content performance analyst with deep expertise in short-form video virality metrics. "
        "Score content briefs honestly based on data-driven virality indicators. "
        "Be critical — scores above 85 should be genuinely rare and reserved for exceptional content."
    )
    script_excerpt = script[:500] if len(script) > 500 else script
    user_prompt = SCORE_USER_PROMPT.format(
        hook=hook,
        hook_type=hook_type,
        script_excerpt=script_excerpt,
        cta=cta,
        caption_hook=caption_hook,
        niche=niche,
    )
    result = _call_with_retry(system_prompt, user_prompt, temperature=0.3)
    required = {"overall_score", "breakdown", "reasoning", "improvement"}
    missing = required - result.keys()
    if missing:
        raise ValueError(f"Malformed score response: missing keys {missing}")
    breakdown = result["breakdown"]
    required_breakdown = {"hook_strength", "emotional_trigger", "value_clarity", "cta_power", "shareability"}
    if not required_breakdown.issubset(breakdown.keys()):
        raise ValueError(f"Malformed score breakdown: {breakdown}")
    return result
