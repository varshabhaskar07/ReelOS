import clsx from 'clsx'

const STATUS_CONFIG = {
  draft:    { bg: 'bg-zinc-800',          text: 'text-zinc-400',   label: 'Draft' },
  approved: { bg: 'bg-emerald-950',       text: 'text-emerald-400', label: 'Approved' },
  posted:   { bg: 'bg-violet-950',        text: 'text-violet-400', label: 'Posted' },
  archived: { bg: 'bg-zinc-900',          text: 'text-zinc-600',   label: 'Archived' },
}

export default function StatusPill({ status, className }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}
