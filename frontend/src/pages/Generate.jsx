import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, Brain, FileText, MessageSquare, Film, Mic, BarChart2,
  Database, CheckCircle2, Loader2, ChevronDown, Copy, Check,
  AlertCircle, Zap, ThumbsUp, Hash, Eye, Volume2
} from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { generateApi, contentApi } from '@/api/client'
import NicheBadge from '@/components/shared/NicheBadge'
import ScoreRing from '@/components/shared/ScoreRing'
import clsx from 'clsx'

// ── Pipeline steps config ─────────────────────────────────────────────────────
const STEPS = [
  { id: 'context',   label: 'Loading channel context',     icon: Brain,         delay: 0    },
  { id: 'hooks',     label: 'Generating 5 hook variations', icon: Zap,           delay: 1800 },
  { id: 'script',    label: 'Writing reel script',          icon: FileText,      delay: 3800 },
  { id: 'social',    label: 'Building social package',      icon: MessageSquare, delay: 6000 },
  { id: 'broll',     label: 'Suggesting B-roll footage',    icon: Film,          delay: 8200 },
  { id: 'voiceover', label: 'Formatting voiceover script',  icon: Mic,           delay: 10000 },
  { id: 'scoring',   label: 'Scoring virality potential',   icon: BarChart2,     delay: 12000 },
  { id: 'saving',    label: 'Saving to content library',    icon: Database,      delay: 13800 },
]

const HOOK_STYLES = ['question', 'stat', 'story', 'controversy', 'listicle']
const TABS = ['Hooks', 'Script', 'Caption', 'B-roll', 'Voiceover', 'Score']

// ── Score bar component ────────────────────────────────────────────────────────
function ScoreBar({ label, value }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 65 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-xs font-mono text-zinc-300">{value}</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full">
        <div className={clsx('h-1.5 rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, className }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className={clsx('btn-ghost text-xs py-1 px-2', className)}>
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function Generate() {
  const { channels, selectedChannelId, setSelectedChannelId } = useAppStore()

  const [topic, setTopic] = useState('')
  const [hookStyle, setHookStyle] = useState('')
  const [toneOverride, setToneOverride] = useState('')

  const [phase, setPhase] = useState('idle') // idle | generating | result | error
  const [currentStep, setCurrentStep] = useState(-1)
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')
  const [apiResult, setApiResult] = useState(null)

  const [activeTab, setActiveTab] = useState('Hooks')
  const [selectedHook, setSelectedHook] = useState(null)
  const [approving, setApproving] = useState(false)
  const [approved, setApproved] = useState(false)

  const timersRef = useRef([])

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) || channels[0] || null

  // When both API resolves and animation completes → show result
  useEffect(() => {
    if (apiResult && currentStep >= STEPS.length - 1) {
      const t = setTimeout(() => {
        setResult(apiResult)
        setSelectedHook(apiResult.hooks?.[0] || null)
        setPhase('result')
        setApproved(false)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [apiResult, currentStep])

  const startGeneration = async () => {
    if (!selectedChannel || !topic.trim()) return

    // Reset state
    setPhase('generating')
    setCurrentStep(-1)
    setResult(null)
    setApiResult(null)
    setApiError('')
    setApproved(false)
    setActiveTab('Hooks')

    // Clear previous timers
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    // Schedule step animations
    STEPS.forEach((step, i) => {
      const t = setTimeout(() => setCurrentStep(i), step.delay)
      timersRef.current.push(t)
    })

    // API call
    try {
      const res = await generateApi.run({
        channel_id: selectedChannel.id,
        topic: topic.trim(),
        hook_style_override: hookStyle || undefined,
        tone_override: toneOverride || undefined,
      })
      setApiResult(res.data)
    } catch (err) {
      timersRef.current.forEach(clearTimeout)
      setApiError(err.message)
      setPhase('error')
    }
  }

  const handleApprove = async () => {
    if (!result?.id) return
    setApproving(true)
    try {
      await contentApi.updateStatus(result.id, 'approved')
      setApproved(true)
    } catch {
      // silent fail for demo
    } finally {
      setApproving(false)
    }
  }

  const reset = () => {
    setPhase('idle')
    setResult(null)
    setApiResult(null)
    setApiError('')
    setCurrentStep(-1)
    setTopic('')
    setHookStyle('')
  }

  return (
    <div className="flex h-full">
      {/* ── LEFT PANEL — Form ──────────────────────────────────────────────── */}
      <div className="w-80 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="px-5 py-5 border-b border-zinc-800">
          <h1 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            Content Generator
          </h1>
          <p className="text-xs text-zinc-500 mt-1">AI pipeline · gpt-4o</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Channel selector */}
          <div>
            <label className="label">Channel</label>
            <div className="relative">
              <select
                className="input pr-8 appearance-none"
                value={selectedChannelId || ''}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                disabled={phase === 'generating'}
              >
                <option value="" disabled>Select a channel...</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name} · {ch.niche}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
            </div>
            {selectedChannel && (
              <div className="flex items-center gap-2 mt-2">
                <NicheBadge niche={selectedChannel.niche} />
                <span className="text-[11px] text-zinc-600">{selectedChannel.tone}</span>
              </div>
            )}
          </div>

          {/* Topic */}
          <div>
            <label className="label">Topic / Angle</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Why saving money in your 20s is a trap"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={phase === 'generating'}
            />
            <p className="text-[10px] text-zinc-600 mt-1">Be specific — better input = better output</p>
          </div>

          {/* Hook style */}
          <div>
            <label className="label">Hook Style <span className="text-zinc-700 normal-case font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-1.5">
              {HOOK_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setHookStyle(hookStyle === style ? '' : style)}
                  disabled={phase === 'generating'}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border',
                    hookStyle === style
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Tone override */}
          <div>
            <label className="label">Tone Override <span className="text-zinc-700 normal-case font-normal">(optional)</span></label>
            <select
              className="input"
              value={toneOverride}
              onChange={(e) => setToneOverride(e.target.value)}
              disabled={phase === 'generating'}
            >
              <option value="">Use channel default</option>
              <option value="educational">Educational</option>
              <option value="motivational">Motivational</option>
              <option value="entertaining">Entertaining</option>
              <option value="controversial">Controversial</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>
        </div>

        {/* Generate button */}
        <div className="p-5 border-t border-zinc-800">
          {phase === 'result' || phase === 'error' ? (
            <button onClick={reset} className="btn-secondary w-full justify-center">
              Generate New Content
            </button>
          ) : (
            <button
              onClick={startGeneration}
              disabled={phase === 'generating' || !selectedChannel || !topic.trim()}
              className={clsx(
                'btn-primary w-full justify-center py-2.5 text-sm font-semibold',
                phase === 'generating' && 'opacity-80 cursor-not-allowed'
              )}
            >
              {phase === 'generating' ? (
                <><Loader2 size={15} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={15} /> Generate Content</>
              )}
            </button>
          )}
          <p className="text-[10px] text-zinc-700 text-center mt-2">~15 seconds · 7 AI steps</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Output ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {phase === 'idle' && <IdleState />}
        {phase === 'generating' && <PipelineAnimation currentStep={currentStep} channel={selectedChannel} topic={topic} />}
        {phase === 'error' && <ErrorState error={apiError} onReset={reset} />}
        {phase === 'result' && result && (
          <ResultPanel
            result={result}
            channel={selectedChannel}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedHook={selectedHook}
            setSelectedHook={setSelectedHook}
            onApprove={handleApprove}
            approving={approving}
            approved={approved}
          />
        )}
      </div>
    </div>
  )
}

// ── IDLE STATE ────────────────────────────────────────────────────────────────
function IdleState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-violet-950/50 border border-violet-900/40 flex items-center justify-center mb-5">
        <Sparkles size={28} className="text-violet-400" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-200 mb-2">Ready to generate</h2>
      <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
        Select a channel, enter a topic, and hit Generate. The AI pipeline will create a complete content brief in ~15 seconds.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm">
        {['Hooks', 'Script', 'Caption', 'B-roll', 'Voiceover', 'Score'].map((label) => (
          <div key={label} className="card px-3 py-2 text-center">
            <span className="text-[11px] text-zinc-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PIPELINE ANIMATION ────────────────────────────────────────────────────────
function PipelineAnimation({ currentStep, channel, topic }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="card p-4 mb-6 flex items-center gap-3">
          {channel && (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: channel.avatar_color || '#6b7280' }}>
              {channel.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500">Generating for {channel?.name}</p>
            <p className="text-sm font-medium text-zinc-200 truncate">{topic}</p>
          </div>
          <div className="shrink-0">
            <Loader2 size={18} className="text-violet-400 animate-spin" />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
            return (
              <div
                key={step.id}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300',
                  state === 'done' && 'bg-emerald-950/20 border-emerald-900/30',
                  state === 'active' && 'bg-violet-950/30 border-violet-700/40 glow-violet',
                  state === 'pending' && 'bg-zinc-900/30 border-zinc-800/50 opacity-40'
                )}
              >
                <div className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  state === 'done' && 'bg-emerald-900/50',
                  state === 'active' && 'bg-violet-900/50',
                  state === 'pending' && 'bg-zinc-800'
                )}>
                  {state === 'done' ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : state === 'active' ? (
                    <Loader2 size={14} className="text-violet-400 animate-spin" />
                  ) : (
                    <Icon size={14} className="text-zinc-600" />
                  )}
                </div>
                <span className={clsx(
                  'text-sm',
                  state === 'done' && 'text-emerald-400',
                  state === 'active' && 'text-violet-300 font-medium',
                  state === 'pending' && 'text-zinc-600'
                )}>
                  {step.label}
                </span>
                {state === 'active' && (
                  <span className="ml-auto text-[10px] text-violet-500 animate-pulse">running</span>
                )}
                {state === 'done' && (
                  <span className="ml-auto text-[10px] text-emerald-700">done</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-5 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-1 bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-xs text-zinc-600 mt-2">
          Step {Math.max(currentStep + 1, 1)} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}

// ── ERROR STATE ───────────────────────────────────────────────────────────────
function ErrorState({ error, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-900/40 flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <h3 className="text-zinc-200 font-semibold mb-2">Generation failed</h3>
      <p className="text-red-400/80 text-sm max-w-sm mb-5">{error}</p>
      <button onClick={onReset} className="btn-secondary">Try again</button>
    </div>
  )
}

// ── RESULT PANEL ──────────────────────────────────────────────────────────────
function ResultPanel({ result, channel, activeTab, setActiveTab, selectedHook, setSelectedHook, onApprove, approving, approved }) {
  return (
    <div className="flex flex-col h-full">
      {/* Result header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950 sticky top-0 z-10">
        {channel && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: channel.avatar_color || '#6b7280' }}>
            {channel.name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{result.topic}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {channel && <NicheBadge niche={channel.niche} />}
            <span className="text-[10px] text-zinc-600">
              Generated in {result.generation_meta?.elapsed_seconds}s · {result.word_count} words · ~{result.estimated_duration_seconds}s spoken
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ScoreRing score={result.virality_score} size={42} strokeWidth={5} />
          <button
            onClick={onApprove}
            disabled={approving || approved}
            className={clsx(
              'btn-primary py-1.5 text-xs',
              approved && 'bg-emerald-700 hover:bg-emerald-700'
            )}
          >
            {approved ? <><Check size={12} /> Approved</> : approving ? 'Approving...' : <><ThumbsUp size={12} /> Approve</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-zinc-800 bg-zinc-950">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeTab === tab
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'Hooks' && (
          <HooksTab hooks={result.hooks} selected={selectedHook} onSelect={setSelectedHook} />
        )}
        {activeTab === 'Script' && <ScriptTab result={result} />}
        {activeTab === 'Caption' && <CaptionTab result={result} />}
        {activeTab === 'B-roll' && <BrollTab result={result} />}
        {activeTab === 'Voiceover' && <VoiceoverTab result={result} />}
        {activeTab === 'Score' && <ScoreTab result={result} />}
      </div>
    </div>
  )
}

// ── TAB CONTENTS ──────────────────────────────────────────────────────────────

function HooksTab({ hooks, selected, onSelect }) {
  const STOP_RATE_COLOR = { high: 'text-emerald-400 bg-emerald-950 border-emerald-800', medium: 'text-amber-400 bg-amber-950 border-amber-800', low: 'text-zinc-400 bg-zinc-800 border-zinc-700' }

  return (
    <div>
      <p className="section-title mb-4">5 Hook Variations — Select your preferred style</p>
      <div className="space-y-3">
        {hooks.map((hook, i) => (
          <div
            key={i}
            onClick={() => onSelect(hook)}
            className={clsx(
              'card p-4 cursor-pointer transition-all',
              selected?.text === hook.text
                ? 'border-violet-500/50 bg-violet-950/20'
                : 'hover:border-zinc-600'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider', STOP_RATE_COLOR[hook.estimated_stop_rate] || STOP_RATE_COLOR.medium)}>
                  {hook.estimated_stop_rate} stop rate
                </span>
                <span className="text-[11px] text-zinc-500 capitalize">{hook.type}</span>
              </div>
              {selected?.text === hook.text && (
                <CheckCircle2 size={15} className="text-violet-400" />
              )}
            </div>
            <p className="text-zinc-200 text-sm leading-relaxed font-medium">{hook.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScriptTab({ result }) {
  const lines = result.script.split('\n').filter(Boolean)
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-title">Reel Script</p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-zinc-600 font-mono">{result.word_count} words · ~{result.estimated_duration_seconds}s</span>
          <CopyBtn text={result.script} />
        </div>
      </div>
      <div className="card p-5 space-y-2">
        {lines.map((line, i) => (
          <p key={i} className={clsx('text-sm leading-relaxed', i === 0 ? 'text-violet-300 font-semibold' : 'text-zinc-300')}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

function CaptionTab({ result }) {
  const captionLines = result.caption.split('\n').filter(Boolean)
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Caption</p>
          <CopyBtn text={result.caption} />
        </div>
        <div className="card p-5 space-y-1.5">
          {captionLines.map((line, i) => (
            <p key={i} className={clsx('text-sm leading-relaxed', i === 0 ? 'text-zinc-100 font-medium' : 'text-zinc-400')}>
              {line}
            </p>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title flex items-center gap-1.5"><Hash size={10} /> Hashtags</p>
          <CopyBtn text={result.hashtags.join(' ')} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {result.hashtags.map((tag, i) => (
            <span key={i} className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded-md font-mono">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="section-title mb-3 flex items-center gap-1.5"><Zap size={10} /> Call to Action</p>
        <div className="card p-4 border-violet-900/40 bg-violet-950/20">
          <p className="text-violet-300 font-medium text-sm">{result.cta}</p>
        </div>
      </div>
    </div>
  )
}

function BrollTab({ result }) {
  return (
    <div>
      <p className="section-title mb-4 flex items-center gap-1.5"><Film size={10} /> B-roll Suggestions</p>
      <div className="space-y-3">
        {result.broll_suggestions.map((item, i) => (
          <div key={i} className="card p-4 flex gap-4">
            <div className="shrink-0">
              <span className="font-mono text-[11px] text-violet-400 bg-violet-950/40 border border-violet-900/30 px-2 py-1 rounded">
                {item.timestamp}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-600 mt-4">
        Source footage from Pexels, Storyblocks, or Artgrid using these descriptions.
      </p>
    </div>
  )
}

function VoiceoverTab({ result }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="section-title flex items-center gap-1.5"><Volume2 size={10} /> Voiceover Script</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-600 font-mono">~{result.generation_meta?.estimated_audio_seconds || result.estimated_duration_seconds}s audio</span>
          <CopyBtn text={result.voiceover_script} />
        </div>
      </div>
      <div className="card p-5">
        <p className="text-sm leading-8 text-zinc-300 whitespace-pre-wrap font-mono">
          {result.voiceover_script}
        </p>
      </div>
      <p className="text-[11px] text-zinc-600 mt-3">
        Paste into ElevenLabs · [PAUSE] markers control breathing · *asterisks* indicate emphasis
      </p>
    </div>
  )
}

function ScoreTab({ result }) {
  const bd = result.score_breakdown || {}
  const dims = [
    { label: 'Hook Strength', key: 'hook_strength' },
    { label: 'Emotional Trigger', key: 'emotional_trigger' },
    { label: 'Value Clarity', key: 'value_clarity' },
    { label: 'CTA Power', key: 'cta_power' },
    { label: 'Shareability', key: 'shareability' },
  ]

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="card p-6 flex items-center gap-6">
        <ScoreRing score={result.virality_score} size={96} strokeWidth={8} />
        <div className="flex-1">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Virality Score</p>
          <p className="text-zinc-200 text-sm leading-relaxed">{result.score_reasoning}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card p-5">
        <p className="section-title mb-4">Score Breakdown</p>
        <div className="space-y-3">
          {dims.map(({ label, key }) => (
            <ScoreBar key={key} label={label} value={bd[key] || 0} />
          ))}
        </div>
      </div>

      {/* Improvement */}
      <div className="card p-4 border-amber-900/40 bg-amber-950/10">
        <p className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-1.5">
          Top Improvement
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">{result.score_improvement}</p>
      </div>
    </div>
  )
}
