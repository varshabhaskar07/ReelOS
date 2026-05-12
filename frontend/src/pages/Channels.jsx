import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles, MoreHorizontal, Radio, X } from 'lucide-react'
import useAppStore from '@/store/useAppStore'
import { channelsApi } from '@/api/client'
import NicheBadge from '@/components/shared/NicheBadge'
import EmptyState from '@/components/shared/EmptyState'
import clsx from 'clsx'

const NICHES = ['finance', 'fitness', 'tech', 'mindset', 'lifestyle', 'beauty', 'travel']
const TONES = ['educational', 'motivational', 'entertaining', 'controversial', 'inspirational']

const EMPTY_FORM = {
  name: '', niche: 'finance', tone: 'educational',
  audience: '', style_notes: '', posting_goal: 2,
}

export default function Channels() {
  const navigate = useNavigate()
  const { channels, channelsLoading, addChannel, setSelectedChannelId } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.audience) { setError('Name and audience are required'); return }
    setSaving(true)
    setError('')
    try {
      const channel = await channelsApi.create(form)
      addChannel(channel)
      setShowModal(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = (channelId) => {
    setSelectedChannelId(channelId)
    navigate('/generate')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Channels</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your AI content channels</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={15} /> New Channel
        </button>
      </div>

      {channelsLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 mb-4" />
              <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2" />
              <div className="h-3 bg-zinc-800/60 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No channels yet"
          description="Create your first channel to start generating AI content at scale."
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={14} /> Create Channel
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {channels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onGenerate={handleGenerate} />
          ))}
          <button
            onClick={() => setShowModal(true)}
            className="card border-dashed flex flex-col items-center justify-center gap-2 p-8 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all cursor-pointer min-h-[200px]"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
              <Plus size={18} className="text-zinc-500" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">Add Channel</p>
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-100">Create Channel</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError('') }} className="btn-ghost p-1.5">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Channel Name *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="WealthTheory" />
                </div>
                <div>
                  <label className="label">Posting Goal (reels/day)</label>
                  <input className="input" type="number" min={1} max={10} value={form.posting_goal} onChange={(e) => setForm({ ...form, posting_goal: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Niche</label>
                  <select className="input" value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })}>
                    {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Tone</label>
                  <select className="input" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                    {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Target Audience *</label>
                <input className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="25-35 year olds building their first net worth" />
              </div>
              <div>
                <label className="label">Style Notes <span className="text-zinc-700 normal-case font-normal">(injected into AI prompts)</span></label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.style_notes}
                  onChange={(e) => setForm({ ...form, style_notes: e.target.value })}
                  placeholder="Use specific dollar amounts. Reference relatable money mistakes. Frame finance as life decisions."
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Channel'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY_FORM); setError('') }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ChannelCard({ channel, onGenerate }) {
  return (
    <div className="card p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors group">
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0"
          style={{ backgroundColor: channel.avatar_color || '#6b7280' }}
        >
          {channel.name[0]}
        </div>
        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-1 rounded">
          {channel.posting_goal} reels/day
        </span>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{channel.name}</h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{channel.audience}</p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <NicheBadge niche={channel.niche} />
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-400">
          {channel.tone}
        </span>
      </div>

      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => onGenerate(channel.id)}
          className="btn-primary flex-1 text-xs justify-center py-1.5"
        >
          <Sparkles size={12} /> Generate
        </button>
      </div>
    </div>
  )
}
