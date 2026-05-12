NICHE_SYSTEM_OVERRIDES: dict[str, str] = {
    "finance": (
        "Use specific dollar amounts, percentages, and timeframes wherever possible. "
        "Reference relatable money mistakes that 20-35 year olds commonly make. "
        "Avoid financial jargon unless immediately explained. "
        "Frame financial decisions as life decisions, not math problems. "
        "High-performing angles: money mistakes, wealth gaps, passive income, "
        "financial freedom timelines, debt payoff, index funds vs active investing."
    ),
    "fitness": (
        "Reference transformation psychology, consistency, and progressive overload. "
        "Use action-oriented verbs and motivational language. Keep sentences punchy. "
        "Debunk common fitness myths using evidence-based reasoning. "
        "High-performing angles: workout efficiency hacks, diet myths debunked, "
        "body recomposition, injury prevention, 10-minute routines, gym beginner guides."
    ),
    "tech": (
        "Explain complex concepts using everyday analogies — never assume prior knowledge. "
        "Reference real, widely-used tools and products (not theoretical ones). "
        "Be opinionated and take clear stances. Avoid marketing speak and buzzwords. "
        "High-performing angles: AI tool comparisons, productivity software, "
        "tech career advice, automation hacks, gadget reviews, digital security."
    ),
    "mindset": (
        "Speak directly to internal struggle, self-doubt, and the gap between "
        "where the viewer is and where they want to be. Use 'you' heavily throughout. "
        "Validate the struggle before challenging it. End with a concrete mental shift, "
        "not just inspiration. High-performing angles: procrastination, self-sabotage, "
        "identity shifts, confidence, decision fatigue, high-performer habits."
    ),
    "lifestyle": (
        "Be aspirational but rooted in relatable reality — avoid unattainable luxury. "
        "Use sensory and visual language that translates well to vertical video. "
        "Focus on systems and routines, not one-off moments. "
        "High-performing angles: morning routines, aesthetic setups, productivity systems, "
        "minimalism, travel hacks, intentional living, capsule wardrobes."
    ),
    "beauty": (
        "Be specific about product names, active ingredients, and skin types. "
        "Use tutorial-style language that implies step-by-step guidance. "
        "Reference trending techniques and viral beauty hacks. "
        "High-performing angles: skincare ingredient education, drugstore dupes, "
        "10-step routines simplified, glow-up transformations, myth-busting."
    ),
    "travel": (
        "Lead with vivid, specific location imagery and a strong sense of place. "
        "Include practical operational details: costs, logistics, timing, hidden gems. "
        "Avoid generic wanderlust clichés — prioritize actionable travel intelligence. "
        "High-performing angles: budget breakdowns, digital nomad setups, "
        "visa tips, underrated destinations, packing systems, travel hacking."
    ),
}

TONE_MODIFIERS: dict[str, str] = {
    "educational": (
        "Structure information logically with clear progression. "
        "Deliver at least one genuinely surprising or non-obvious insight. "
        "Write as if explaining to a smart friend who knows nothing about the topic."
    ),
    "motivational": (
        "Create emotional urgency and belief in possibility. "
        "Make the viewer feel capable of change right now. "
        "Build to a peak of energy — the CTA should feel inevitable."
    ),
    "entertaining": (
        "Prioritize engagement and surprise over information density. "
        "Use pattern interrupts, humor, and unexpected angles. "
        "Keep the tone light even when the subject is serious."
    ),
    "controversial": (
        "Take a strong, clear, defensible position that challenges conventional wisdom. "
        "Use evidence and logic — not shock value alone. "
        "Anticipate the pushback and address it preemptively."
    ),
    "inspirational": (
        "Lead with transformation and possibility. Tell the story of what becomes possible. "
        "Make the viewer feel they are one decision away from a better version of their life. "
        "End with a sense of permission and empowerment."
    ),
}
