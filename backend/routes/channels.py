import logging
from fastapi import APIRouter, HTTPException

from models.schemas import ChannelCreate, ChannelUpdate, ChannelResponse
from services.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)

NICHE_COLORS = {
    "finance": "#10b981",
    "fitness": "#f59e0b",
    "tech": "#6366f1",
    "mindset": "#8b5cf6",
    "lifestyle": "#ec4899",
    "beauty": "#f43f5e",
    "travel": "#0ea5e9",
}


@router.post("/", response_model=ChannelResponse, status_code=201)
def create_channel(payload: ChannelCreate):
    db = get_supabase()
    data = payload.model_dump()
    if not data.get("avatar_color"):
        data["avatar_color"] = NICHE_COLORS.get(payload.niche, "#6b7280")

    try:
        result = db.table("channels").insert(data).execute()
        return result.data[0]
    except Exception as e:
        logger.error(f"create_channel failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create channel")


@router.get("/", response_model=list[ChannelResponse])
def list_channels():
    db = get_supabase()
    try:
        result = (
            db.table("channels")
            .select("*")
            .eq("is_active", True)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data
    except Exception as e:
        logger.error(f"list_channels failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch channels")


@router.get("/{channel_id}", response_model=ChannelResponse)
def get_channel(channel_id: str):
    db = get_supabase()
    try:
        result = db.table("channels").select("*").eq("id", channel_id).maybe_single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Channel not found")
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_channel failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch channel")


@router.patch("/{channel_id}", response_model=ChannelResponse)
def update_channel(channel_id: str, payload: ChannelUpdate):
    db = get_supabase()
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        result = db.table("channels").update(updates).eq("id", channel_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Channel not found")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"update_channel failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update channel")


@router.delete("/{channel_id}", status_code=204)
def delete_channel(channel_id: str):
    db = get_supabase()
    try:
        db.table("channels").update({"is_active": False}).eq("id", channel_id).execute()
    except Exception as e:
        logger.error(f"delete_channel failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete channel")


@router.get("/{channel_id}/stats")
def get_channel_stats(channel_id: str):
    db = get_supabase()
    try:
        channel_result = db.table("channels").select("*").eq("id", channel_id).maybe_single().execute()
        if not channel_result.data:
            raise HTTPException(status_code=404, detail="Channel not found")

        content_result = db.table("content_briefs").select("status, virality_score, created_at").eq("channel_id", channel_id).execute()
        briefs = content_result.data or []

        total = len(briefs)
        approved = sum(1 for b in briefs if b["status"] == "approved")
        posted = sum(1 for b in briefs if b["status"] == "posted")
        scores = [b["virality_score"] for b in briefs if b.get("virality_score") is not None]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0

        return {
            "channel": channel_result.data,
            "stats": {
                "total_generated": total,
                "approved": approved,
                "posted": posted,
                "draft": total - approved - posted,
                "avg_virality_score": avg_score,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_channel_stats failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch channel stats")
