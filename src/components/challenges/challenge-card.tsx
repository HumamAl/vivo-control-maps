import type { ReactNode } from "react";
import { OutcomeStatement } from "./outcome-statement";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  outcome?: string;
  index: number;
  visualization?: ReactNode;
}

export function ChallengeCard({
  title,
  description,
  outcome,
  index,
  visualization,
}: ChallengeCardProps) {
  const stepNumber = String(index + 1).padStart(2, "0");

  return (
    <div
      className="rounded-xl p-6 space-y-4"
      style={{
        background: "oklch(0.12 0.01 220)",
        border: "1px solid oklch(1 0 0 / 0.08)",
        boxShadow:
          "0 0 0 1px oklch(1 0 0 / 0.06), inset 0 1px 0 oklch(1 0 0 / 0.08)",
      }}
    >
      <div>
        <div className="flex items-baseline gap-3 mb-2">
          <span
            className="font-mono text-sm font-medium w-6 shrink-0 tabular-nums"
            style={{ color: "oklch(0.65 0.20 220 / 0.8)" }}
          >
            {stepNumber}
          </span>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground pl-[calc(1.5rem+0.75rem)] leading-relaxed">
          {description}
        </p>
      </div>
      {visualization && <div>{visualization}</div>}
      {outcome && <OutcomeStatement outcome={outcome} />}
    </div>
  );
}
