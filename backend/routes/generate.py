import logging
from fastapi import APIRouter, HTTPException

from models.schemas import GenerateRequest
from services.content_pipeline import run_content_pipeline

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/")
def generate_content(payload: GenerateRequest):
    """
    Main content generation endpoint.
    Runs the full AI pipeline: hooks → script → social → broll → voiceover → score.
    Saves everything to Supabase and returns the complete brief.
    Expected latency: 10-20 seconds (7 sequential OpenAI calls).
    """
    try:
        result = run_content_pipeline(
            channel_id=payload.channel_id,
            topic=payload.topic,
            hook_style_override=payload.hook_style_override,
            tone_override=payload.tone_override,
        )
        return {"success": True, "data": result}

    except ValueError as e:
        logger.warning(f"generate_content validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"generate_content pipeline error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Content generation failed: {str(e)}",
        )


@router.get("/status")
def generation_status():
    """Health check for generation service — confirms OpenAI connection is configured."""
    from config import settings
    key_preview = settings.openai_api_key[:8] + "..." if settings.openai_api_key else "NOT SET"
    return {
        "service": "content generation",
        "model": "gpt-4o",
        "openai_key_configured": bool(settings.openai_api_key),
        "key_preview": key_preview,
    }
