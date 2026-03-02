import Link from "next/link";

export function CtaCloser() {
  return (
    <section
      className="rounded-xl p-6"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.13 0.02 220), oklch(0.10 0.01 220))",
        border: "1px solid oklch(0.65 0.20 220 / 0.20)",
        boxShadow: "0 0 24px oklch(0.65 0.20 220 / 0.06)",
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Ready to discuss the approach?
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            I have thought through the spatial engine, routing, and
            multi-community architecture. Happy to walk through any of this
            in a call or share more detail on any challenge.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/proposal"
            className="text-sm transition-colors duration-200"
            style={{ color: "oklch(0.60 0 0)" }}
          >
            See the proposal{" "}
            <span style={{ color: "oklch(0.65 0.20 220)" }}>→</span>
          </Link>
          <span
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{
              background: "oklch(0.65 0.20 220 / 0.12)",
              border: "1px solid oklch(0.65 0.20 220 / 0.25)",
              color: "oklch(0.65 0.20 220)",
              boxShadow: "0 0 8px oklch(0.65 0.20 220 / 0.12)",
            }}
          >
            Reply on Upwork to start
          </span>
        </div>
      </div>
    </section>
  );
}
