from typing import Optional


def build_system_context(
    niche: str,
    tone: str,
    audience: str,
    style_notes: Optional[str],
    niche_override: str,
    tone_modifier: str,
) -> str:
    return f"""You are an expert short-form content strategist specializing in {niche} content for Instagram Reels.

CHANNEL PROFILE:
- Niche: {niche}
- Tone: {tone}
- Target Audience: {audience}
- Operator Style Notes: {style_notes or "None provided — use best judgment for the niche."}

NICHE EXPERTISE:
{niche_override}

TONE DIRECTION:
{tone_modifier}

ABSOLUTE RULES — violating these invalidates the output:
1. All content must be optimized for vertical, mobile, short-form video
2. Write for the ear — this will be spoken aloud by a narrator
3. Hooks must stop a scrolling thumb in under 3 seconds
4. Scripts must fit within 60 seconds when spoken at a natural pace (~150 words)
5. Output ONLY valid JSON in the exact structure specified — no extra text, no markdown, no explanation"""


HOOK_USER_PROMPT = """Generate exactly 5 viral hook variations for this topic: "{topic}"

Each hook must use a DIFFERENT type from this list:
- question: poses a provocative or counterintuitive question the viewer can't ignore
- stat: opens with a specific, surprising statistic or dollar amount
- story: drops the viewer mid-scene in a first-person moment (immersive, cinematic)
- controversy: directly challenges a widely-held belief or common advice
- listicle: makes a numbered promise ("3 things...", "5 reasons...", "The 2 habits...")

HOOK QUALITY STANDARDS:
- Maximum 15 words per hook
- Must feel like an interruption of the scroll — surprising, specific, or emotionally charged
- No generic openers ("In today's video...", "Did you know...", "Here's the thing...")
- Each hook must make the viewer think: "wait, what?" or "that's me"

{hook_style_instruction}

Return ONLY this exact JSON structure — no other text:
{{
  "hooks": [
    {{"type": "question", "text": "hook text here", "estimated_stop_rate": "high"}},
    {{"type": "stat", "text": "hook text here", "estimated_stop_rate": "medium"}},
    {{"type": "story", "text": "hook text here", "estimated_stop_rate": "high"}},
    {{"type": "controversy", "text": "hook text here", "estimated_stop_rate": "medium"}},
    {{"type": "listicle", "text": "hook text here", "estimated_stop_rate": "low"}}
  ]
}}"""


SCRIPT_USER_PROMPT = """Write a complete Instagram Reel script using this opening hook.

Hook (use verbatim as the first line): "{hook}"
Topic: "{topic}"

SCRIPT STRUCTURE:
1. HOOK — the exact hook text above (0-3 seconds)
2. CONTEXT — why this matters to the viewer right now (2-3 sentences)
3. VALUE POINT 1 — first key insight or step (2-3 sentences)
4. VALUE POINT 2 — second key insight or step (2-3 sentences)
5. PATTERN INTERRUPT — unexpected twist, statistic, or reframe (1-2 sentences)
6. CTA BRIDGE — one line that creates urgency to take action

SCRIPT RULES:
- Total: 120-150 words (fits 50-60 seconds spoken at natural pace)
- One idea per line — formatted so a creator can read it from a teleprompter
- Short, punchy sentences — no sentence over 15 words
- No filler: "basically", "kind of", "you know", "right?"
- The pattern interrupt must be genuinely surprising — not just a restatement
- End on an open loop or revelation that the CTA resolves

Return ONLY this exact JSON structure — no other text:
{{
  "script": "full script here, use \\n to separate each line/beat",
  "word_count": 142,
  "estimated_duration_seconds": 55,
  "structure_tags": ["hook", "context", "value_1", "value_2", "pattern_interrupt", "cta_bridge"]
}}"""


SOCIAL_USER_PROMPT = """Create the complete Instagram social media package for this Reel.

Topic: "{topic}"
Reel Script: "{script}"

DELIVERABLES:

1. CAPTION (150-200 words):
   - First line must be a standalone hook that mirrors the reel's energy (this appears in the feed preview)
   - Use line breaks and spacing for mobile readability
   - Deliver 2-3 extra value points not covered in the reel
   - End with an engagement question to drive comments

2. HASHTAGS (exactly 15):
   - 5 niche-specific hashtags (mid-size, 50k-500k posts)
   - 5 topic-specific hashtags (under 200k posts)
   - 5 broad reach hashtags (over 1M posts)

3. CTA (one line, spoken in the video):
   - Clear action: follow, save, comment, or share
   - Creates mild urgency or social proof
   - Maximum 12 words

Return ONLY this exact JSON structure — no other text:
{{
  "caption": "full caption text here with \\n line breaks",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10", "#tag11", "#tag12", "#tag13", "#tag14", "#tag15"],
  "cta": "one CTA line here",
  "caption_hook": "just the first line of the caption here"
}}"""


BROLL_USER_PROMPT = """Suggest specific B-roll footage for this Instagram Reel that can be sourced from stock libraries.

Reel Script: "{script}"

REQUIREMENTS:
- Provide exactly 6 B-roll suggestions, one per major script beat
- Each suggestion must be hyper-specific — not "person working" but:
  "Extreme close-up of hands scrolling through a red stock market graph on iPhone, warm coffee steam in background"
- Every suggestion must be sourceable from Pexels, Storyblocks, or Artgrid
- Suggestions must match the emotional arc of the script (intensity, pacing)
- Include the exact timestamp range each clip should cover

Return ONLY this exact JSON structure — no other text:
{{
  "broll": [
    {{"timestamp": "0-4s", "description": "hyper-specific visual description"}},
    {{"timestamp": "5-9s", "description": "hyper-specific visual description"}},
    {{"timestamp": "10-15s", "description": "hyper-specific visual description"}},
    {{"timestamp": "16-22s", "description": "hyper-specific visual description"}},
    {{"timestamp": "23-30s", "description": "hyper-specific visual description"}},
    {{"timestamp": "31-55s", "description": "hyper-specific visual description"}}
  ]
}}"""


VOICEOVER_USER_PROMPT = """Convert this reel script into an optimized voiceover script for AI text-to-speech narration (ElevenLabs).

Original Script: "{script}"

FORMATTING RULES:
- Add [PAUSE 0.5s] for short breaths between sentences
- Add [PAUSE 1s] at major structural transitions (after hook, before CTA)
- Wrap words that need emphasis in *asterisks* — use sparingly, max 1 per sentence
- Add [HOOK] marker before the opening line
- Add [CTA] marker before the final call to action
- Remove any visual cues or stage directions — audio only
- Preserve all original content and meaning — only reformat

Return ONLY this exact JSON structure — no other text:
{{
  "voiceover_script": "formatted script here with markers",
  "estimated_audio_seconds": 52,
  "pause_count": 6
}}"""


SCORE_USER_PROMPT = """You are a short-form video performance analyst. Score this Instagram Reel content brief on viral potential.

CONTENT TO SCORE:
- Hook: "{hook}"
- Hook Type: {hook_type}
- Script Opening (first 120 words): "{script_excerpt}"
- CTA: "{cta}"
- Caption First Line: "{caption_hook}"
- Niche: "{niche}"

SCORING DIMENSIONS (0-100 each):
- hook_strength: Does it stop the scroll in 3 seconds? Specific, surprising, emotionally charged?
- emotional_trigger: Does it activate curiosity, fear, aspiration, or social proof effectively?
- value_clarity: Is the promised value delivered clearly and completely in the script?
- cta_power: Is the CTA action-specific, urgent, and natural to the content?
- shareability: Would a viewer send this to a friend or save it for later?

SCORING CALIBRATION:
- 90-100: Exceptional — this will likely go viral
- 75-89: Strong — good chance of above-average performance
- 60-74: Solid — average performance expected
- 45-59: Weak — needs significant improvement
- Below 45: Poor — recommend full regeneration

Overall score = weighted average: hook(30%) + emotional(20%) + value(25%) + cta(10%) + share(15%)

Be honest and critical. Scores above 85 should be rare.

Return ONLY this exact JSON structure — no other text:
{{
  "overall_score": 74,
  "breakdown": {{
    "hook_strength": 80,
    "emotional_trigger": 70,
    "value_clarity": 75,
    "cta_power": 65,
    "shareability": 68
  }},
  "reasoning": "One sentence explaining the overall score — be specific about what works and what doesn't",
  "improvement": "One concrete, actionable suggestion targeting the weakest scoring dimension"
}}"""
