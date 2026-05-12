"""
Rule-based pre-filter that runs BEFORE the OpenAI scoring call.
Used to surface obvious quality issues and inform the scoring prompt.
Not a replacement for AI scoring — a fast pre-check only.
"""

import re

STOP_RATE_WEIGHT = {"high": 1.0, "medium": 0.65, "low": 0.3}

WEAK_OPENER_PATTERNS = [
    r"^did you know",
    r"^in today",
    r"^hey guys",
    r"^hello everyone",
    r"^welcome back",
    r"^so today",
    r"^let me tell you",
    r"^i want to talk",
]

POWER_WORDS = [
    "never", "secret", "mistake", "trap", "broke", "rich",
    "wrong", "exposed", "truth", "hack", "instantly", "proven",
    "warn", "danger", "shocking", "hidden", "urgent", "critical",
]


def check_hook_quality(hook_text: str) -> dict:
    hook_lower = hook_text.lower().strip()
    word_count = len(hook_text.split())
    issues = []
    strengths = []

    if word_count > 15:
        issues.append(f"Hook is {word_count} words — too long (max 15)")
    else:
        strengths.append(f"Good hook length: {word_count} words")

    for pattern in WEAK_OPENER_PATTERNS:
        if re.match(pattern, hook_lower):
            issues.append(f"Weak opener detected: matches pattern '{pattern}'")
            break

    has_power_word = any(pw in hook_lower for pw in POWER_WORDS)
    if has_power_word:
        strengths.append("Contains a power word — good scroll-stopping potential")

    has_number = bool(re.search(r"\d", hook_text))
    if has_number:
        strengths.append("Contains a specific number — increases credibility and specificity")

    has_question = "?" in hook_text
    if has_question:
        strengths.append("Question format — creates open loop in viewer's mind")

    return {
        "word_count": word_count,
        "issues": issues,
        "strengths": strengths,
        "pre_score": max(0, 100 - (len(issues) * 20)),
    }


def select_best_hook(hooks: list[dict], override_type: str | None = None) -> dict:
    if override_type:
        for hook in hooks:
            if hook.get("type") == override_type:
                return hook

    def hook_score(h: dict) -> float:
        stop_rate_score = STOP_RATE_WEIGHT.get(h.get("estimated_stop_rate", "low"), 0.3) * 60
        quality = check_hook_quality(h.get("text", ""))
        pre_score = quality["pre_score"] * 0.4
        return stop_rate_score + pre_score

    return max(hooks, key=hook_score)


def estimate_script_duration(script: str) -> int:
    words = len(script.split())
    words_per_second = 2.5
    return round(words / words_per_second)


def validate_script_length(script: str) -> dict:
    word_count = len(script.split())
    duration = estimate_script_duration(script)
    issues = []

    if word_count < 80:
        issues.append(f"Script too short: {word_count} words — may feel incomplete")
    elif word_count > 170:
        issues.append(f"Script too long: {word_count} words — will exceed 60 seconds")

    return {
        "word_count": word_count,
        "estimated_seconds": duration,
        "within_target": 80 <= word_count <= 170,
        "issues": issues,
    }
