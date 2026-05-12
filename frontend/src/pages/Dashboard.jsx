import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Radio, TrendingUp, Clock, ArrowRight, Zap } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { contentApi } from '@/api/client'
import NicheBadge from '@/components/shared/NicheBadge'
import StatusPill from '@/components/shared/StatusPill'
import ScoreRing from '@/components/shared/ScoreRing'

export default function Dashboard() {
  const navigate = useNavigate()
  const channels = useAppStore((s) => s.channels)
  const [recentContent, setRecentContent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contentApi.list({ limit: 8 })
      .then((res) => setRecentContent(res.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    channels: channels.length,
    generated: recentContent.length,
    avgScore: recentContent.length
      ? Math.round(recentContent.reduce((a, b) => a + (b.virality_score || 0), 0) / recentContent.length)
      : 0,
    pending: recentContent.filter((c) => c.status === 'draft').length,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Command Center</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {channels.length} channels active · AI-first content pipeline
          </p>
        </div>
        <button onClick={() => navigate('/generate')} className="btn-primary glow-violet">
          <Sparkles size={15} />
          Generate Content
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Radio}
          label="Active Channels"
          value={stats.channels}
          sub="across all niches"
          color="violet"
        />
        <StatCard
          icon={Sparkles}
          label="Content Briefs"
          value={stats.generated}
          sub="in library"
          color="indigo"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Virality Score"
          value={stats.avgScore ? `${stats.avgScore}/100` : '—'}
          sub="across all content"
          color="emerald"
        />
        <StatCard
          icon={Clock}
          label="Pending Approval"
          value={stats.pending}
          sub="awaiting review"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Recent Content</h2>
            <button onClick={() => navigate('/library')} className="btn-ghost text-xs">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-zinc-800 rounded w-2/3" />
                    <div className="h-2.5 bg-zinc-800/60 rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : recentContent.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-zinc-600 text-sm">No content generated yet.</p>
                <button onClick={() => navigate('/generate')} className="btn-primary mt-3 mx-auto">
                  <Zap size={13} /> Generate your first reel
                </button>
              </div>
            ) : (
              recentContent.map((item) => {
                const channel = channels.find((c) => c.id === item.channel_id)
                return (
                  <div key={item.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-900/50 transition-colors">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: channel?.avatar_color || '#6b7280' }}
                    >
                      {channel?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 font-medium truncate">{item.topic}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {channel && <NicheBadge niche={channel.niche} />}
                        <StatusPill status={item.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {item.virality_score && (
                        <ScoreRing score={item.virality_score} size={36} strokeWidth={4} />
                      )}
                      <span className="text-[11px] text-zinc-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Channel Overview */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Channels</h2>
            <button onClick={() => navigate('/channels')} className="btn-ghost text-xs">
              Manage <ArrowRight size={12} />
            </button>
          </div>
          <div className="p-3 space-y-1.5">
            {channels.length === 0 ? (
              <p className="text-zinc-600 text-xs text-center py-6">No channels yet</p>
            ) : (
              channels.slice(0, 8).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-default"
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: ch.avatar_color || '#6b7280' }}
                  >
                    {ch.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-300 truncate">{ch.name}</p>
                    <p className="text-[10px] text-zinc-600">{ch.niche}</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">{ch.posting_goal}/d</span>
                </div>
              ))
            )}
          </div>

          {/* Scale indicator */}
          <div className="mx-4 mb-4 p-3 rounded-lg bg-violet-950/40 border border-violet-900/40">
            <p className="text-[11px] text-violet-400 font-medium">Scale capacity</p>
            <p className="text-xs text-zinc-500 mt-1">
              {channels.length} channels × 2 reels/day ={' '}
              <span className="text-zinc-300 font-semibold">{channels.length * 2} reels/day</span>
            </p>
            <div className="mt-2 h-1 bg-zinc-800 rounded-full">
              <div
                className="h-1 bg-violet-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((channels.length / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-600 mt-1">{channels.length}/10 channels</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    violet: 'text-violet-400 bg-violet-950 border-violet-900',
    indigo: 'text-indigo-400 bg-indigo-950 border-indigo-900',
    emerald: 'text-emerald-400 bg-emerald-950 border-emerald-900',
    amber: 'text-amber-400 bg-amber-950 border-amber-900',
  }
  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-lg border mb-3 ${colors[color]}`}>
        <Icon size={15} />
      </div>
      <p className="text-2xl font-bold text-zinc-100 font-mono">{value}</p>
      <p className="text-xs font-medium text-zinc-300 mt-0.5">{label}</p>
      <p className="text-[11px] text-zinc-600 mt-0.5">{sub}</p>
    </div>
  )
}
