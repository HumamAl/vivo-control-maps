import type { ExecutiveSummaryData } from "@/data/challenges";

interface ExecutiveSummaryProps extends ExecutiveSummaryData {}

export function ExecutiveSummary({
  commonApproach,
  differentApproach,
  accentWord,
}: ExecutiveSummaryProps) {
  const renderDifferentApproach = () => {
    if (!accentWord) return <span>{differentApproach}</span>;
    const escaped = accentWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = differentApproach.split(new RegExp(`(${escaped})`, "i"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === accentWord.toLowerCase() ? (
            <span key={i} className="text-primary font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 md:p-8"
      style={{
        background: "oklch(0.10 0.015 220)",
        backgroundImage:
          "radial-gradient(ellipse at 25% 50%, oklch(0.65 0.20 220 / 0.08), transparent 65%), radial-gradient(ellipse at 75% 20%, oklch(0.65 0.20 220 / 0.04), transparent 50%)",
      }}
    >
      <p className="text-sm md:text-base leading-relaxed text-white/50 mb-4">
        {commonApproach}
      </p>
      <hr className="border-white/10 mb-4" />
      <p className="text-base md:text-lg leading-relaxed font-medium text-white/90">
        {renderDifferentApproach()}
      </p>
      <p className="text-xs text-white/35 mt-4">
        {"← "}
        <a
          href="/"
          className="hover:text-white/60 transition-colors duration-200 underline underline-offset-2"
        >
          Back to the live demo
        </a>
      </p>
    </div>
  );
}
