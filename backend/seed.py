"""
Seed script — populates 10 demo channels with realistic data.
Run once after creating your Supabase schema.

Usage:
    python seed.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    sys.exit(1)

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

CHANNELS = [
    {
        "name": "WealthTheory",
        "niche": "finance",
        "tone": "educational",
        "audience": "25-35 year olds building their first net worth",
        "style_notes": "Use specific dollar amounts and percentages. Reference relatable money mistakes millennials make. Frame investing decisions as life decisions.",
        "posting_goal": 2,
        "avatar_color": "#10b981",
    },
    {
        "name": "GrindMindset",
        "niche": "mindset",
        "tone": "motivational",
        "audience": "Ambitious 18-28 year olds who want to escape mediocrity and build something",
        "style_notes": "Use 'you' constantly — make it feel personal. Speak directly to the internal struggle. End with a belief-shifting statement.",
        "posting_goal": 2,
        "avatar_color": "#8b5cf6",
    },
    {
        "name": "FitProtocol",
        "niche": "fitness",
        "tone": "educational",
        "audience": "Men and women 20-35 who want evidence-based fitness and nutrition advice",
        "style_notes": "Always cite studies or expert consensus where possible. Debunk popular myths. Be specific about exercises, rep ranges, and macros.",
        "posting_goal": 2,
        "avatar_color": "#f59e0b",
    },
    {
        "name": "TechUnlocked",
        "niche": "tech",
        "tone": "entertaining",
        "audience": "Tech-curious 20-35 year olds who want to stay ahead of trends without reading Reddit",
        "style_notes": "Use everyday analogies for complex concepts. Reference real products people own. Be opinionated and take clear stances.",
        "posting_goal": 2,
        "avatar_color": "#6366f1",
    },
    {
        "name": "LifestyleAlpha",
        "niche": "lifestyle",
        "tone": "inspirational",
        "audience": "Aspiring 22-32 year olds wanting aesthetic, intentional living — not just hustle culture",
        "style_notes": "Aspirational but grounded in real routines. Use sensory language. Focus on systems and daily practices, not one-off moments.",
        "posting_goal": 2,
        "avatar_color": "#ec4899",
    },
    {
        "name": "MoneyMoves",
        "niche": "finance",
        "tone": "controversial",
        "audience": "Gen Z (18-24) encountering personal finance concepts for the first time",
        "style_notes": "Challenge conventional financial wisdom in a responsible way. Use Gen Z language naturally. Make finance feel urgent and relevant to right now.",
        "posting_goal": 2,
        "avatar_color": "#14b8a6",
    },
    {
        "name": "AILabsDaily",
        "niche": "tech",
        "tone": "educational",
        "audience": "Professionals 28-45 who want to understand and practically use AI tools at work",
        "style_notes": "Focus on real workflow applications of AI tools. Avoid hype. Give specific prompts and use cases. Be practical, not theoretical.",
        "posting_goal": 2,
        "avatar_color": "#f97316",
    },
    {
        "name": "GlowUpGuide",
        "niche": "beauty",
        "tone": "educational",
        "audience": "Women 18-30 interested in skincare science and evidence-based beauty routines",
        "style_notes": "Reference specific active ingredients and product formulations. Debunk beauty myths with science. Be approachable and relatable — not clinical.",
        "posting_goal": 2,
        "avatar_color": "#f43f5e",
    },
    {
        "name": "NomadSystems",
        "niche": "travel",
        "tone": "educational",
        "audience": "Remote workers and aspiring digital nomads 25-40 who want to travel smarter",
        "style_notes": "Less wanderlust aesthetics, more operational intelligence. Include real costs, logistics, and country comparisons. Give actionable checklists.",
        "posting_goal": 2,
        "avatar_color": "#0ea5e9",
    },
    {
        "name": "EliteRoutines",
        "niche": "mindset",
        "tone": "inspirational",
        "audience": "High-performers 25-40 optimizing their daily systems, habits, and decision-making",
        "style_notes": "Reference habits of proven high-performers with specifics. Focus on systems over motivation. Be precise and data-driven where possible.",
        "posting_goal": 2,
        "avatar_color": "#a855f7",
    },
]


def seed_channels():
    print("\nReelOS — Seeding demo channels")
    print("=" * 40)

    existing = client.table("channels").select("name").execute()
    existing_names = {c["name"] for c in (existing.data or [])}

    to_insert = [c for c in CHANNELS if c["name"] not in existing_names]

    if not to_insert:
        print("All 10 channels already exist. Nothing to seed.")
        return

    result = client.table("channels").insert(to_insert).execute()

    if result.data:
        print(f"Seeded {len(result.data)} channels successfully:\n")
        for ch in result.data:
            print(f"  ✓ {ch['name']:<20} | {ch['niche']:<10} | {ch['tone']}")
        skipped = len(CHANNELS) - len(to_insert)
        if skipped:
            print(f"\n  (skipped {skipped} channels that already exist)")
    else:
        print("ERROR: Seeding failed. Check your Supabase credentials and schema.")
        sys.exit(1)

    print("\nDone. You can now run the FastAPI server and generate content.")


if __name__ == "__main__":
    seed_channels()
