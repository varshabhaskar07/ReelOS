import clsx from 'clsx'

const NICHE_CONFIG = {
  finance:   { bg: 'bg-emerald-950 border-emerald-800', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  fitness:   { bg: 'bg-amber-950 border-amber-800',     text: 'text-amber-400',   dot: 'bg-amber-500' },
  tech:      { bg: 'bg-violet-950 border-violet-800',   text: 'text-violet-400',  dot: 'bg-violet-500' },
  mindset:   { bg: 'bg-purple-950 border-purple-800',   text: 'text-purple-400',  dot: 'bg-purple-500' },
  lifestyle: { bg: 'bg-pink-950 border-pink-800',       text: 'text-pink-400',    dot: 'bg-pink-500' },
  beauty:    { bg: 'bg-rose-950 border-rose-800',       text: 'text-rose-400',    dot: 'bg-rose-500' },
  travel:    { bg: 'bg-sky-950 border-sky-800',         text: 'text-sky-400',     dot: 'bg-sky-500' },
}

const DEFAULT = { bg: 'bg-zinc-900 border-zinc-700', text: 'text-zinc-400', dot: 'bg-zinc-500' }

export default function NicheBadge({ niche, className }) {
  const config = NICHE_CONFIG[niche?.toLowerCase()] || DEFAULT
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
      {niche}
    </span>
  )
}
