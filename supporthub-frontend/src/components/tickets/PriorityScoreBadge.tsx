import React from 'react';

// 0.40 is meaningfully above the 0.25 random baseline for a 4-class classifier.
// Triage is only surfaced on the ticket detail page (showTriage prop).
const TRIAGE_THRESHOLD = 0.40;

type Variant = 'compact' | 'detailed';

interface PriorityScoreBadgeProps {
  score?: number | null;
  confidence?: number | null;
  llmReasoning?: string | null;
  priority?: string | null;
  variant?: Variant;
  className?: string;
  // Controls whether the Triage badge and "Human review advised" warning are
  // rendered. Default false — list and queue views stay clean. Only the ticket
  // detail page passes true to expose the full human-in-the-loop feature.
  showTriage?: boolean;
}

type Tier = { label: string; bar: string; chip: string };

const tierFromScore = (score: number): Tier => {
  if (score >= 0.75) return { label: 'Critical', bar: 'bg-red-500',    chip: 'bg-red-100 text-red-700' };
  if (score >= 0.50) return { label: 'High',     bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' };
  if (score >= 0.25) return { label: 'Medium',   bar: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-700' };
  return                    { label: 'Low',       bar: 'bg-green-500',  chip: 'bg-green-100 text-green-700' };
};

const tierFromLabel = (priority: string): Tier => {
  switch (priority.toLowerCase()) {
    case 'critical': return { label: 'Critical', bar: 'bg-red-500',    chip: 'bg-red-100 text-red-700' };
    case 'high':     return { label: 'High',     bar: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' };
    case 'medium':   return { label: 'Medium',   bar: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-700' };
    case 'low':      return { label: 'Low',      bar: 'bg-green-500',  chip: 'bg-green-100 text-green-700' };
    default:         return { label: 'Medium',   bar: 'bg-yellow-500', chip: 'bg-yellow-100 text-yellow-700' };
  }
};

const modelSource = (llmReasoning: string | null | undefined): string =>
  llmReasoning?.toLowerCase().includes('groq') ? 'Groq fallback' : 'Classified by ML model';

export const PriorityScoreBadge: React.FC<PriorityScoreBadgeProps> = ({
  score,
  confidence,
  llmReasoning,
  priority,
  variant = 'compact',
  className = '',
  showTriage = false,
}) => {
  if (score === undefined || score === null || Number.isNaN(score)) {
    return <span className={`text-xs text-gray-400 ${className}`}>—</span>;
  }

  const clamped = Math.max(0, Math.min(1, score));
  const pct = Math.round(clamped * 100);

  const tier = (priority && priority.trim() !== '')
    ? tierFromLabel(priority)
    : tierFromScore(clamped);

  const hasConfidence = confidence !== undefined && confidence !== null && !Number.isNaN(confidence);
  const needsTriage   = hasConfidence && (confidence as number) < TRIAGE_THRESHOLD;
  const confidencePct = hasConfidence ? Math.round((confidence as number) * 100) : null;
  const source        = modelSource(llmReasoning);

  // Whether to actually render the Triage UI elements
  const showTriageUI = showTriage && needsTriage;

  // ── Compact variant: ticket list rows, my-tasks ───────────────────────────
  // Clean: tier colour bar + score %. No Triage, no warnings.
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 ${className}`}
        title={`AI Confidence: ${confidencePct ?? '—'}% · ${source}`}
      >
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`${tier.bar} h-full rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-700 tabular-nums">{pct}%</span>
      </div>
    );
  }

  // ── Detailed variant: priority queue table + ticket detail sidebar ─────────
  // List / queue views (showTriage=false): tier chip · bar · confidence line.
  // Detail page only (showTriage=true): also shows Triage badge + advisory.
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>

      {/* Row 1: priority chip + Triage badge (detail page only) */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tier.chip}`}>
          {tier.label} · {pct}%
        </span>
        {showTriageUI && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300"
            title={`Model confidence is ${confidencePct}% — a second opinion may help`}
          >
            Triage
          </span>
        )}
      </div>

      {/* Row 2: progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${tier.bar} h-full rounded-full transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Row 3: confidence percentage + model source */}
      <p className="text-[11px] text-gray-400 leading-snug">
        {confidencePct !== null ? `AI Confidence: ${confidencePct}%` : 'Confidence unavailable'}
        {' · '}
        {source}
      </p>

      {/* Row 4: human-in-the-loop advisory — detail page only, low confidence only */}
      {showTriageUI && (
        <p className="text-[11px] text-amber-600 font-medium leading-snug">
          Human review advised
        </p>
      )}
    </div>
  );
};

export default PriorityScoreBadge;
