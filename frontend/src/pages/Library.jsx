import { useState, useEffect } from 'react'
import { Library as LibraryIcon, Filter, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { contentApi } from '@/api/client'
import NicheBadge from '@/components/shared/NicheBadge'
import StatusPill from '@/components/shared/StatusPill'
import ScoreRing from '@/components/shared/ScoreRing'
import EmptyState from '@/components/shared/EmptyState'

const STATUSES = ['all', 'draft', 'approved', 'posted', 'archived']

export default function Library() {
  const channels = useAppStore((s) => s.channels)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [channelFilter, setChannelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchContent = async () => {
    setLoading(true)
    try {
      const params = {}
      if (channelFilter) params.channel_id = channelFilter
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await contentApi.list({ ...params, limit: 50 })
      setItems(res.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContent() }, [channelFilter, statusFilter])

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id)
    try {
      await contentApi.updateStatus(id, status)
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item))
    } catch {
      // silent
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Content Library</h1>
          <p className="text-zinc-500 text-sm mt-1">{items.length} briefs · all channels</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <Filter size={13} className="text-zinc-600" />
        <select
          className="input w-48 py-1.5 text-xs"
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
        >
          <option value="">All channels</option>
          {channels.map((ch) => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
        </select>
        <div className="flex items-center gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card divide-y divide-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-zinc-800 rounded w-1/2" />
                <div className="h-2.5 bg-zinc-800/60 rounded w-1/4" />
              </div>
              <div className="w-16 h-6 bg-zinc-800 rounded" />
              <div className="w-10 h-10 rounded-full bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={LibraryIcon} title="No content found" description="Generate content or adjust your filters." />
      ) : (
        <div className="card divide-y divide-zinc-800/60">
          {items.map((item) => {
            const channel = channels.find((c) => c.id === item.channel_id)
            const expanded = expandedId === item.id
            return (
              <div key={item.id}>
                <div
                  className="px-5 py-4 flex items-center gap-4 hover:bg-zinc-900/40 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                    style={{ backgroundColor: channel?.avatar_color || '#6b7280' }}
                  >
                    {channel?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{item.topic}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-zinc-600">{channel?.name}</span>
                      {channel && <NicheBadge niche={channel.niche} />}
                    </div>
                  </div>
                  <StatusPill status={item.status} />
                  <div className="shrink-0">
                    {item.virality_score && <ScoreRing score={item.virality_score} size={36} strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] text-zinc-600 shrink-0 w-20 text-right">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <div className="shrink-0">
                    {expanded ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
                  </div>
                </div>

                {expanded && (
                  <div className="px-5 pb-5 bg-zinc-900/20 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="section-title mb-2">Selected Hook</p>
                        <p className="text-sm text-zinc-300 leading-relaxed card p-3">{item.selected_hook}</p>
                      </div>
                      <div>
                        <p className="section-title mb-2">Caption Hook</p>
                        <p className="text-sm text-zinc-300 leading-relaxed card p-3">{item.caption?.split('\n')[0]}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="section-title mb-2">Script Preview</p>
                      <p className="text-xs text-zinc-500 card p-3 leading-relaxed line-clamp-4">{item.script}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-600">Change status:</span>
                      {['draft', 'approved', 'posted', 'archived'].map((s) => (
                        <button
                          key={s}
                          disabled={item.status === s || updatingId === item.id}
                          onClick={() => handleStatusChange(item.id, s)}
                          className={`text-xs px-2.5 py-1 rounded-md border transition-all capitalize disabled:opacity-40
                            ${item.status === s ? 'bg-zinc-800 border-zinc-600 text-zinc-300' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'}`}
                        >
                          {updatingId === item.id && s === item.status ? '...' : s}
                        </button>
                      ))}
                      <CopyButton text={[item.selected_hook, item.script, item.caption, item.hashtags?.join(' ')].filter(Boolean).join('\n\n---\n\n')} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="btn-ghost text-xs ml-auto"
    >
      {copied ? <><Check size={11} className="text-emerald-400" /> Copied</> : <><Copy size={11} /> Copy All</>}
    </button>
  )
}
