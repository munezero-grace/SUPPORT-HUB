import React from 'react';

const TRIAGE_THRESHOLD = 0.80;

type Variant = 'compact' | 'detailed';

interface PriorityScoreBadgeProps {
  score?: number | null;
  confidence?: number | null;
  llmReasoning?: string | null;
  variant?: Variant;
  className?: string;
}

const tierFor = (score: number) => {
  if (score >= 0.75) return { label: 'Critical', bar: 'bg-red-500',    chip: 'bg-red-100 text-red-700' };
  if (score >= 0.50) return { label: 'High',     bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' };
  if (score >= 0.25) return { label: 'Medium',   bar: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-700' };
  return                    { label: 'Low',      bar: 'bg-green-500',  chip: 'bg-green-100 text-green-700' };
};

export const PriorityScoreBadge: React.FC<PriorityScoreBadgeProps> = ({
  score,
  confidence,
  llmReasoning,
  variant = 'compact',
  className = '',
}) => {
  if (score === undefined || score === null || Number.isNaN(score)) {
    return <span className={`text-xs text-gray-400 ${className}`}>—</span>;
  }

  const clamped = Math.max(0, Math.min(1, score));
  const pct = Math.round(clamped * 100);
  const tier = tierFor(clamped);
  const needsTriage = confidence !== undefined && confidence !== null && !Number.isNaN(confidence) && confidence < TRIAGE_THRESHOLD;
  const tooltipText = llmReasoning || `Priority score: ${pct}% (${tier.label})`;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`} title={tooltipText}>
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`${tier.bar} h-full rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-700 tabular-nums">{pct}%</span>
        {needsTriage && (
          <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
            Triage
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tier.chip}`}
          title={tooltipText}
        >
          {tier.label} · {pct}%
        </span>
        {needsTriage && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300"
            title={`Confidence ${Math.round((confidence ?? 0) * 100)}% — human review recommended`}
          >
            Triage
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`${tier.bar} h-full rounded-full transition-[width] duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {llmReasoning && (
        <p className="text-xs text-gray-500 leading-snug">{llmReasoning}</p>
      )}
    </div>
  );
};

export default PriorityScoreBadge;
