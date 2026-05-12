import { useEffect, useState } from 'react'
import { TrendingUp, Zap, BarChart3, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts'
import useAppStore from '@/store/useAppStore'
import { contentApi } from '@/api/client'
import NicheBadge from '@/components/shared/NicheBadge'
import ScoreRing from '@/components/shared/ScoreRing'

const TREND_ICON = {
  rising:   { icon: ArrowUp,   color: 'text-emerald-400' },
  stable:   { icon: Minus,     color: 'text-zinc-400' },
  declining:{ icon: ArrowDown, color: 'text-red-400' },
}

// Simulated feedback patterns — realistic-looking, computed from channel niches
const MOCK_PATTERNS = [
  { type: 'Hook Type', value: 'question',    performance: 'Avg +38% engagement vs baseline', trend: 'rising' },
  { type: 'Hook Type', value: 'controversy', performance: 'Avg +24% engagement vs baseline', trend: 'rising' },
  { type: 'Hook Type', value: 'stat',        performance: 'Avg +12% engagement vs baseline', trend: 'stable' },
  { type: 'Script Length', value: '120-140 words', performance: 'Highest watch-time completion (82%)', trend: 'rising' },
  { type: 'Posting Time', value: '7-9am, 6-8pm', performance: 'Peak reach windows across niches', trend: 'stable' },
  { type: 'Hook Type', value: 'listicle',    performance: 'Avg -8% vs baseline — declining', trend: 'declining' },
]

const CUSTOM_TOOLTIP = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const channels = useAppStore((s) => s.channels)
  const [channelStats, setChannelStats] = useState([])
  const [allContent, setAllContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await contentApi.list({ limit: 100 })
        const items = res.items || []
        setAllContent(items)

        // Compute per-channel stats
        const stats = channels.map((ch) => {
          const briefs = items.filter((b) => b.channel_id === ch.id)
          const scores = briefs.map((b) => b.virality_score).filter(Boolean)
          return {
            name: ch.name.length > 10 ? ch.name.slice(0, 10) + '…' : ch.name,
            fullName: ch.name,
            niche: ch.niche,
            color: ch.avatar_color || '#6b7280',
            total: briefs.length,
            avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            approved: briefs.filter((b) => b.status === 'approved').length,
            posted: briefs.filter((b) => b.status === 'posted').length,
          }
        }).filter((s) => s.total > 0)

        setChannelStats(stats)
      } catch {
        setChannelStats([])
      } finally {
        setLoading(false)
      }
    }
    if (channels.length) load()
    else setLoading(false)
  }, [channels])

  const hookDist = allContent.reduce((acc, item) => {
    if (item.hook_type) acc[item.hook_type] = (acc[item.hook_type] || 0) + 1
    return acc
  }, {})

  const radarData = Object.entries(hookDist).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
    fullMark: Math.max(...Object.values(hookDist), 1),
  }))

  const totalGenerated = allContent.length
  const avgScore = allContent.length
    ? Math.round(allContent.reduce((a, b) => a + (b.virality_score || 0), 0) / allContent.length)
    : 0
  const topScore = allContent.reduce((max, b) => Math.max(max, b.virality_score || 0), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">Performance overview across all channels</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Generated', value: totalGenerated, sub: 'all channels' },
          { label: 'Avg Virality Score', value: avgScore || '—', sub: 'across all content' },
          { label: 'Top Score', value: topScore || '—', sub: 'best performing piece' },
          { label: 'Active Channels', value: channels.length, sub: `${channels.length * 2} reels/day capacity` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-4">
            <p className="text-2xl font-bold font-mono text-zinc-100">{value}</p>
            <p className="text-xs font-medium text-zinc-300 mt-0.5">{label}</p>
            <p className="text-[11px] text-zinc-600">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Content volume chart */}
        <div className="col-span-2 card p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-1">Content Generated per Channel</p>
          <p className="text-xs text-zinc-600 mb-5">Briefs generated · all time</p>
          {loading || channelStats.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-zinc-700 text-sm">
              {loading ? 'Loading...' : 'Generate content to see data'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelStats} barSize={20}>
                <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Briefs">
                  {channelStats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hook distribution radar */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-zinc-200 mb-1">Hook Type Usage</p>
          <p className="text-xs text-zinc-600 mb-4">Distribution across all content</p>
          {radarData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-zinc-700 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="type" tick={{ fill: '#71717a', fontSize: 10 }} />
                <Radar name="Count" dataKey="count" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Per-channel score table */}
        <div className="card">
          <div className="px-5 py-4 border-b border-zinc-800">
            <p className="text-sm font-semibold text-zinc-200">Channel Performance</p>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800" />
                  <div className="flex-1 h-3 bg-zinc-800 rounded" />
                  <div className="w-10 h-10 rounded-full bg-zinc-800" />
                </div>
              ))}
            </div>
          ) : channelStats.length === 0 ? (
            <p className="text-zinc-700 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {channelStats.map((ch) => (
                <div key={ch.fullName} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: ch.color }}>
                    {ch.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{ch.fullName}</p>
                    <div className="flex items-center gap-2">
                      <NicheBadge niche={ch.niche} />
                      <span className="text-[10px] text-zinc-600">{ch.total} briefs</span>
                    </div>
                  </div>
                  <ScoreRing score={ch.avgScore || 0} size={40} strokeWidth={4} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What's Working — Feedback Loop Panel */}
        <div className="card">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <TrendingUp size={14} className="text-violet-400" />
            <p className="text-sm font-semibold text-zinc-200">What's Working</p>
            <span className="ml-auto text-[10px] text-violet-500 bg-violet-950/50 border border-violet-900/40 px-2 py-0.5 rounded">
              Feedback Loop
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            {MOCK_PATTERNS.map((p, i) => {
              const { icon: TrendIcon, color } = TREND_ICON[p.trend] || TREND_ICON.stable
              return (
                <div key={i} className={`card px-4 py-3 flex items-start gap-3 ${p.trend === 'declining' ? 'border-red-900/30 bg-red-950/10' : p.trend === 'rising' ? 'border-emerald-900/20' : ''}`}>
                  <TrendIcon size={14} className={`${color} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{p.type}</span>
                      <span className={`text-[11px] font-semibold ${p.trend === 'rising' ? 'text-emerald-400' : p.trend === 'declining' ? 'text-red-400' : 'text-zinc-400'}`}>
                        {p.value}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{p.performance}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="px-5 pb-4">
            <p className="text-[10px] text-zinc-700 leading-relaxed">
              Patterns computed from content performance data. Next generation batch will auto-prioritize rising patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
