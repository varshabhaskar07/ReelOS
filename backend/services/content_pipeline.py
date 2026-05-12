"""
Content generation pipeline orchestrator.
Executes all AI steps in sequence, saves results to Supabase, and returns the full brief.

Each step is synchronous (OpenAI + Supabase are both blocking calls).
FastAPI runs this via its threadpool when called from a `def` route (not async def).
"""

import logging
import time
from typing import Optional

from services.openai_service import (
    generate_broll,
    generate_hooks,
    generate_script,
    generate_social_package,
    generate_voiceover,
    score_content,
)
from services.supabase_client import get_supabase
from services.virality_scorer import select_best_hook, validate_script_length

logger = logging.getLogger(__name__)


def run_content_pipeline(
    channel_id: str,
    topic: str,
    hook_style_override: Optional[str] = None,
    tone_override: Optional[str] = None,
) -> dict:
    db = get_supabase()
    start_time = time.time()

    # ── 0. Fetch channel ──────────────────────────────────────────────────────
    channel_result = db.table("channels").select("*").eq("id", channel_id).maybe_single().execute()
    if not channel_result.data:
        raise ValueError(f"Channel '{channel_id}' not found or is inactive")

    channel = dict(channel_result.data)
    if tone_override:
        channel["tone"] = tone_override

    logger.info(f"Pipeline start | channel='{channel['name']}' niche={channel['niche']} topic='{topic}'")

    # ── 1. Generate 5 hook variations ─────────────────────────────────────────
    logger.info("Step 1/7: Generating hooks...")
    hooks_data = generate_hooks(topic, channel, hook_style_override)
    hooks = hooks_data["hooks"]

    # ── 2. Select best hook (rule-based pre-filter, then AI validates) ────────
    best_hook = select_best_hook(hooks, hook_style_override)
    logger.info(f"Step 2/7: Selected hook | type={best_hook['type']} stop_rate={best_hook.get('estimated_stop_rate')}")

    # ── 3. Generate script ────────────────────────────────────────────────────
    logger.info("Step 3/7: Generating script...")
    script_data = generate_script(topic, best_hook["text"], channel)
    script = script_data["script"]

    script_validation = validate_script_length(script)
    if script_validation["issues"]:
        logger.warning(f"Script validation warnings: {script_validation['issues']}")

    word_count = script_data.get("word_count") or script_validation["word_count"]
    duration = script_data.get("estimated_duration_seconds") or script_validation["estimated_seconds"]

    # ── 4. Generate social package (caption + hashtags + CTA) ─────────────────
    logger.info("Step 4/7: Generating social package...")
    social_data = generate_social_package(topic, script, channel)

    # ── 5. Generate B-roll suggestions ───────────────────────────────────────
    logger.info("Step 5/7: Generating B-roll suggestions...")
    broll_data = generate_broll(script, channel)

    # ── 6. Generate voiceover script ─────────────────────────────────────────
    logger.info("Step 6/7: Generating voiceover script...")
    voiceover_data = generate_voiceover(script, channel)

    # ── 7. Score the complete brief ───────────────────────────────────────────
    logger.info("Step 7/7: Scoring content...")
    score_data = score_content(
        hook=best_hook["text"],
        hook_type=best_hook["type"],
        script=script,
        cta=social_data["cta"],
        caption_hook=social_data["caption_hook"],
        niche=channel["niche"],
    )
    logger.info(f"Virality score: {score_data['overall_score']}/100")

    elapsed = round(time.time() - start_time, 2)
    logger.info(f"Pipeline complete in {elapsed}s")

    # ── 8. Persist content brief ──────────────────────────────────────────────
    brief_payload = {
        "channel_id": channel_id,
        "topic": topic,
        "selected_hook": best_hook["text"],
        "script": script,
        "word_count": word_count,
        "estimated_duration_seconds": duration,
        "caption": social_data["caption"],
        "hashtags": social_data["hashtags"],
        "cta": social_data["cta"],
        "broll_suggestions": broll_data["broll"],
        "voiceover_script": voiceover_data["voiceover_script"],
        "virality_score": score_data["overall_score"],
        "score_breakdown": score_data["breakdown"],
        "score_reasoning": score_data["reasoning"],
        "score_improvement": score_data["improvement"],
        "hook_type": best_hook["type"],
        "status": "draft",
        "generation_meta": {
            "model": "gpt-4o",
            "elapsed_seconds": elapsed,
            "tone_override": tone_override,
            "hook_style_override": hook_style_override,
            "word_count": word_count,
            "estimated_duration_seconds": duration,
        },
    }

    brief_result = db.table("content_briefs").insert(brief_payload).execute()
    brief = brief_result.data[0]
    brief_id = brief["id"]

    # ── 9. Persist all 5 hook variations ─────────────────────────────────────
    hook_rows = [
        {
            "brief_id": brief_id,
            "hook_text": h["text"],
            "hook_type": h["type"],
            "estimated_stop_rate": h.get("estimated_stop_rate", "medium"),
            "is_selected": h["text"] == best_hook["text"],
        }
        for h in hooks
    ]
    db.table("hook_variations").insert(hook_rows).execute()

    return {
        "id": brief_id,
        "channel_id": channel_id,
        "channel_name": channel["name"],
        "topic": topic,
        "hooks": hooks,
        "selected_hook": best_hook["text"],
        "hook_type": best_hook["type"],
        "script": script,
        "word_count": word_count,
        "estimated_duration_seconds": duration,
        "caption": social_data["caption"],
        "caption_hook": social_data["caption_hook"],
        "hashtags": social_data["hashtags"],
        "cta": social_data["cta"],
        "broll_suggestions": broll_data["broll"],
        "voiceover_script": voiceover_data["voiceover_script"],
        "virality_score": score_data["overall_score"],
        "score_breakdown": score_data["breakdown"],
        "score_reasoning": score_data["reasoning"],
        "score_improvement": score_data["improvement"],
        "status": "draft",
        "created_at": brief["created_at"],
        "generation_meta": brief_payload["generation_meta"],
    }
