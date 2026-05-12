from pydantic import BaseModel, Field
from typing import Optional


# ─── Channel Schemas ─────────────────────────────────────────────────────────

class ChannelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    niche: str = Field(..., description="finance|fitness|tech|mindset|lifestyle|beauty|travel")
    tone: str = Field(..., description="educational|motivational|entertaining|controversial|inspirational")
    audience: str = Field(..., description="Target audience description")
    style_notes: Optional[str] = Field(None, description="Additional style guidance injected into AI prompts")
    posting_goal: int = Field(default=2, ge=1, le=10, description="Reels per day target")
    avatar_color: Optional[str] = Field(None, description="Hex color for UI avatar")


class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    niche: Optional[str] = None
    tone: Optional[str] = None
    audience: Optional[str] = None
    style_notes: Optional[str] = None
    posting_goal: Optional[int] = Field(None, ge=1, le=10)
    avatar_color: Optional[str] = None
    is_active: Optional[bool] = None


class ChannelResponse(BaseModel):
    id: str
    name: str
    niche: str
    tone: str
    audience: str
    style_notes: Optional[str]
    posting_goal: int
    avatar_color: Optional[str]
    is_active: bool
    created_at: str


# ─── Content Generation Schemas ───────────────────────────────────────────────

class GenerateRequest(BaseModel):
    channel_id: str
    topic: str = Field(..., min_length=3, max_length=500, description="Topic or angle for the reel")
    hook_style_override: Optional[str] = Field(
        None,
        description="Force a specific hook type: question|stat|story|controversy|listicle",
    )
    tone_override: Optional[str] = Field(
        None,
        description="Override the channel's default tone for this generation only",
    )


class RegenerateSectionRequest(BaseModel):
    brief_id: str
    section: str = Field(
        ...,
        description="Section to regenerate: hooks|script|social|broll|voiceover|score",
    )
    notes: Optional[str] = Field(None, description="Optional direction for the regeneration")


# ─── Content Status Schemas ───────────────────────────────────────────────────

class ContentStatusUpdate(BaseModel):
    status: str = Field(..., description="draft|approved|posted|archived")
