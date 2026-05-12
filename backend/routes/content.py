import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from models.schemas import ContentStatusUpdate
from services.supabase_client import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)

VALID_STATUSES = {"draft", "approved", "posted", "archived"}


@router.get("/")
def list_content(
    channel_id: Optional[str] = Query(None, description="Filter by channel UUID"),
    status: Optional[str] = Query(None, description="Filter by status: draft|approved|posted|archived"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    db = get_supabase()
    try:
        query = (
            db.table("content_briefs")
            .select("*")
            .order("created_at", desc=True)
        )
        if channel_id:
            query = query.eq("channel_id", channel_id)
        if status:
            if status not in VALID_STATUSES:
                raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {VALID_STATUSES}")
            query = query.eq("status", status)

        query = query.range(offset, offset + limit - 1)
        result = query.execute()

        return {
            "items": result.data,
            "count": len(result.data),
            "limit": limit,
            "offset": offset,
            "filters": {"channel_id": channel_id, "status": status},
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"list_content failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch content")


@router.get("/{content_id}")
def get_content(content_id: str):
    db = get_supabase()
    try:
        result = (
            db.table("content_briefs")
            .select("*, hook_variations(*)")
            .eq("id", content_id)
            .maybe_single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Content brief not found")
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_content failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch content")


@router.patch("/{content_id}/status")
def update_content_status(content_id: str, payload: ContentStatusUpdate):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{payload.status}'. Must be one of: {VALID_STATUSES}",
        )

    db = get_supabase()
    updates: dict = {"status": payload.status}
    now = datetime.now(timezone.utc).isoformat()

    if payload.status == "approved":
        updates["approved_at"] = now
    elif payload.status == "posted":
        updates["posted_at"] = now

    try:
        result = db.table("content_briefs").update(updates).eq("id", content_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Content brief not found")
        return {"success": True, "id": content_id, "status": payload.status}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"update_content_status failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


@router.get("/channel/{channel_id}/summary")
def channel_content_summary(channel_id: str):
    """Returns aggregate stats for a channel's content library — used by the dashboard."""
    db = get_supabase()
    try:
        result = (
            db.table("content_briefs")
            .select("status, virality_score, hook_type, created_at")
            .eq("channel_id", channel_id)
            .execute()
        )
        briefs = result.data or []

        scores = [b["virality_score"] for b in briefs if b.get("virality_score") is not None]
        hook_types = [b["hook_type"] for b in briefs if b.get("hook_type")]

        hook_distribution = {}
        for ht in hook_types:
            hook_distribution[ht] = hook_distribution.get(ht, 0) + 1

        status_counts = {}
        for b in briefs:
            s = b.get("status", "draft")
            status_counts[s] = status_counts.get(s, 0) + 1

        return {
            "channel_id": channel_id,
            "total_briefs": len(briefs),
            "status_breakdown": status_counts,
            "avg_virality_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "top_score": max(scores) if scores else 0,
            "hook_type_distribution": hook_distribution,
        }
    except Exception as e:
        logger.error(f"channel_content_summary failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to compute channel summary")
