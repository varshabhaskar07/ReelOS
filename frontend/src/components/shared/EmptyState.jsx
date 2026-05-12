import clsx from 'clsx'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <Icon size={24} className="text-zinc-600" />
        </div>
      )}
      <h3 className="text-zinc-300 font-medium text-sm mb-1.5">{title}</h3>
      {description && <p className="text-zinc-600 text-xs max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
