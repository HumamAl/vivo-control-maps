import { ExternalLink, TrendingUp } from "lucide-react";
import { proposalData } from "@/data/proposal";

export default function ProposalPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-12">

      {/* ── Section 1: Hero (Project Brief) ─────────────────────── */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ background: "oklch(0.06 0.02 var(--primary-h, 220))" }}
      >
        {/* Radial glow — dark-premium accent moment */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at top left, oklch(0.65 0.20 220 / 0.12), transparent 65%)",
          }}
        />

        <div className="relative z-10 p-8 md:p-12">
          {/* Effort badge — mandatory */}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium border text-white/80 px-3 py-1 rounded-full mb-6"
            style={{
              background: "oklch(1 0 0 / 0.06)",
              borderColor: "oklch(1 0 0 / 0.12)",
            }}
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            {proposalData.hero.badge}
          </span>

          {/* Role prefix */}
          <p className="font-mono text-xs tracking-widest uppercase text-white/40 mb-4">
            Full-Stack Developer · Spatial & Mapping Systems
          </p>

          {/* Name headline — weight contrast */}
          <h1 className="text-5xl md:text-6xl tracking-tight leading-none mb-4">
            <span className="font-light text-white/70">Hi, I&apos;m</span>{" "}
            <span className="font-black text-white">{proposalData.hero.name}</span>
          </h1>

          {/* Tailored value prop */}
          <p className="text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: "oklch(0.85 0 0 / 0.65)" }}>
            {proposalData.hero.valueProp}
          </p>
        </div>

        {/* Stats shelf */}
        <div
          className="relative z-10 px-8 py-5 border-t grid grid-cols-3 gap-4"
          style={{
            background: "oklch(1 0 0 / 0.04)",
            borderColor: "oklch(1 0 0 / 0.08)",
          }}
        >
          {proposalData.hero.stats.map((stat) => (
            <div key={stat.label}>
              <div
                className="text-2xl font-bold"
                style={{
                  background: "linear-gradient(to right, oklch(0.92 0 0), oklch(0.92 0 0 / 0.6))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: "oklch(0.92 0 0 / 0.45)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 2: Proof of Work ─────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Proof of Work
          </p>
          <h2 className="text-2xl font-bold tracking-tight">Relevant Projects</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {proposalData.portfolioProjects.map((project) => (
            <div
              key={project.name}
              className="aesthetic-card p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug">{project.name}</h3>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                    style={{ transitionDuration: "var(--dur-normal)" }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>

              {/* Outcome — always present */}
              <div className="flex items-start gap-2 text-sm" style={{ color: "var(--success)" }}>
                <TrendingUp className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{project.outcome}</span>
              </div>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-xs font-mono bg-primary/10 text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Relevance note */}
              {project.relevance && (
                <p className="text-xs italic text-primary/70">
                  {project.relevance}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: How I Work ────────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Process
          </p>
          <h2 className="text-2xl font-bold tracking-tight">How I Work</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {proposalData.approach.map((step) => (
            <div key={step.step} className="aesthetic-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-xs tracking-widest uppercase"
                  style={{ color: "var(--primary)" }}
                >
                  Step {step.step}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {step.timeline}
                </span>
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Skills Grid ───────────────────────────────── */}
      <section className="space-y-5">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-1">
            Tech Stack
          </p>
          <h2 className="text-2xl font-bold tracking-tight">What I Build With</h2>
        </div>

        <div className="space-y-3">
          {proposalData.skills.map((category) => (
            <div key={category.category} className="aesthetic-card p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {category.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.items.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-md border text-sm font-mono"
                    style={{
                      borderColor: "oklch(1 0 0 / 0.10)",
                      background: "oklch(1 0 0 / 0.04)",
                      color: "oklch(0.85 0 0 / 0.80)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: CTA ──────────────────────────────────────── */}
      <section
        className="relative rounded-2xl overflow-hidden text-center"
        style={{ background: "oklch(0.06 0.02 var(--primary-h, 220))" }}
      >
        {/* Subtle bottom glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at bottom, oklch(0.65 0.20 220 / 0.08), transparent 70%)",
          }}
        />

        <div className="relative z-10 p-8 md:p-12 space-y-4">
          {/* Pulsing availability indicator */}
          <div className="flex items-center justify-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "var(--success)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "var(--success)" }}
              />
            </span>
            <span
              className="text-sm"
              style={{ color: "color-mix(in oklch, var(--success) 80%, white)" }}
            >
              {proposalData.cta.availability}
            </span>
          </div>

          {/* Headline — tailored */}
          <h2 className="text-2xl font-bold text-white leading-snug">
            {proposalData.cta.headline}
          </h2>

          {/* Body — specific */}
          <p
            className="max-w-lg mx-auto leading-relaxed"
            style={{ color: "oklch(0.92 0 0 / 0.55)" }}
          >
            {proposalData.cta.body}
          </p>

          {/* Primary action — text, not a dead-end button */}
          <p className="text-lg font-semibold text-white pt-2">
            {proposalData.cta.action}
          </p>

          {/* Back to demo */}
          <a
            href="/"
            className="inline-flex items-center gap-1 text-sm cta-back-link"
          >
            ← Back to the demo
          </a>

          {/* Signature */}
          <p
            className="pt-4 text-sm border-t mt-4"
            style={{
              color: "oklch(0.92 0 0 / 0.30)",
              borderColor: "oklch(1 0 0 / 0.08)",
            }}
          >
            — Humam
          </p>
        </div>
      </section>

    </div>
  );
}
