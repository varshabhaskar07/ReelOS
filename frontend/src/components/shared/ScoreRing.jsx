import clsx from 'clsx'

function scoreColor(score) {
  if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-400' }
  if (score >= 65) return { stroke: '#f59e0b', text: 'text-amber-400' }
  return { stroke: '#ef4444', text: 'text-red-400' }
}

export default function ScoreRing({ score, size = 80, strokeWidth = 7 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const { stroke, text } = scoreColor(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={clsx('font-bold font-mono', text, size >= 80 ? 'text-xl' : 'text-sm')}>
          {score}
        </span>
        {size >= 80 && <span className="text-zinc-600 text-[9px] uppercase tracking-wider">score</span>}
      </div>
    </div>
  )
}
