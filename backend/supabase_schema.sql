-- ============================================================
-- ReelOS — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- Project: https://app.supabase.com → SQL Editor → New Query
-- ============================================================

-- ─── Channels ────────────────────────────────────────────────────────────────
create table if not exists channels (
    id            uuid primary key default gen_random_uuid(),
    name          text not null,
    niche         text not null,
    tone          text not null,
    audience      text,
    style_notes   text,
    posting_goal  integer default 2,
    avatar_color  text,
    is_active     boolean default true,
    created_at    timestamptz default now()
);

-- ─── Content Briefs ───────────────────────────────────────────────────────────
create table if not exists content_briefs (
    id                         uuid primary key default gen_random_uuid(),
    channel_id                 uuid references channels(id) on delete cascade,
    topic                      text not null,
    selected_hook              text,
    script                     text,
    word_count                 integer,
    estimated_duration_seconds integer,
    caption                    text,
    hashtags                   text[],
    cta                        text,
    broll_suggestions          jsonb,
    voiceover_script           text,
    virality_score             integer,
    score_breakdown            jsonb,
    score_reasoning            text,
    score_improvement          text,
    hook_type                  text,
    status                     text default 'draft',
    generation_meta            jsonb,
    created_at                 timestamptz default now(),
    approved_at                timestamptz,
    posted_at                  timestamptz
);

-- ─── Hook Variations (all 5 generated per brief) ─────────────────────────────
create table if not exists hook_variations (
    id                  uuid primary key default gen_random_uuid(),
    brief_id            uuid references content_briefs(id) on delete cascade,
    hook_text           text not null,
    hook_type           text,
    estimated_stop_rate text,
    is_selected         boolean default false,
    created_at          timestamptz default now()
);

-- ─── Performance Metrics ──────────────────────────────────────────────────────
create table if not exists performance_metrics (
    id               uuid primary key default gen_random_uuid(),
    brief_id         uuid references content_briefs(id) on delete cascade,
    channel_id       uuid references channels(id),
    views            integer default 0,
    likes            integer default 0,
    shares           integer default 0,
    saves            integer default 0,
    comments         integer default 0,
    reach            integer default 0,
    engagement_rate  float,
    watch_time_pct   float,
    recorded_at      timestamptz default now()
);

-- ─── Feedback Patterns (pre-aggregated intelligence layer) ───────────────────
create table if not exists feedback_patterns (
    id            uuid primary key default gen_random_uuid(),
    channel_id    uuid references channels(id) on delete cascade,
    pattern_type  text,
    pattern_value text,
    avg_score     float,
    sample_count  integer default 0,
    trend         text default 'stable',
    updated_at    timestamptz default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_content_briefs_channel_id on content_briefs(channel_id);
create index if not exists idx_content_briefs_status on content_briefs(status);
create index if not exists idx_content_briefs_created_at on content_briefs(created_at desc);
create index if not exists idx_hook_variations_brief_id on hook_variations(brief_id);
create index if not exists idx_performance_metrics_channel_id on performance_metrics(channel_id);
create index if not exists idx_feedback_patterns_channel_id on feedback_patterns(channel_id);

-- ─── RLS Policies (disable for service key access — already bypasses RLS) ────
-- If you're using the anon key from the frontend, enable RLS and add policies.
-- For this prototype using service key from backend only, RLS is not required.
-- alter table channels enable row level security;
-- alter table content_briefs enable row level security;
