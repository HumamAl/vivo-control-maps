"use client";

import { useState } from "react";
import { ArrowRight, MapPin, Grid3X3, Ruler, Map } from "lucide-react";

const steps = [
  {
    id: "raw-gps",
    icon: MapPin,
    label: "Raw GPS",
    sublabel: "lat/lng + accuracy",
    detail: "Latitude: 24.7136°N\nLongitude: 46.6753°E\nAccuracy: ±8m",
    highlight: false,
  },
  {
    id: "anchor-fit",
    icon: Ruler,
    label: "Anchor Fit",
    sublabel: "4-point affine",
    detail:
      "Fit GPS readings to 4 known anchor points (gates/corners) to compute per-community transform matrix T.",
    highlight: true,
  },
  {
    id: "projection",
    icon: Grid3X3,
    label: "SVG Projection",
    sublabel: "affine transform",
    detail:
      "Apply T: [x_svg, y_svg] = T × [lat, lng, 1]. Handles rotation, scale, and offset per community.",
    highlight: false,
  },
  {
    id: "map-position",
    icon: Map,
    label: "Map Position",
    sublabel: "x=412, y=287",
    detail: "Final SVG coords placed on community canvas. Sub-3m accuracy when anchor points are well-spaced.",
    highlight: false,
  },
];

export function VizCoordinateTransform() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p
        className="text-xs font-mono uppercase tracking-wider"
        style={{ color: "oklch(0.65 0.20 220 / 0.7)" }}
      >
        Transformation pipeline — tap a step to inspect
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <button
              onClick={() =>
                setActiveStep(activeStep === step.id ? null : step.id)
              }
              className="flex-1 text-left rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer"
              style={{
                background:
                  activeStep === step.id
                    ? "oklch(0.65 0.20 220 / 0.15)"
                    : step.highlight
                    ? "oklch(0.65 0.20 220 / 0.08)"
                    : "oklch(1 0 0 / 0.04)",
                border:
                  activeStep === step.id
                    ? "1px solid oklch(0.65 0.20 220 / 0.5)"
                    : step.highlight
                    ? "1px solid oklch(0.65 0.20 220 / 0.30)"
                    : "1px solid oklch(1 0 0 / 0.08)",
                boxShadow:
                  activeStep === step.id
                    ? "0 0 12px oklch(0.65 0.20 220 / 0.2)"
                    : step.highlight
                    ? "0 0 6px oklch(0.65 0.20 220 / 0.08)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-2">
                <step.icon
                  className="w-4 h-4 shrink-0"
                  style={{
                    color:
                      activeStep === step.id || step.highlight
                        ? "oklch(0.65 0.20 220)"
                        : "oklch(0.60 0 0)",
                  }}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {step.label}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "oklch(0.55 0 0)" }}
                  >
                    {step.sublabel}
                  </p>
                </div>
              </div>
            </button>
            {i < steps.length - 1 && (
              <ArrowRight
                className="w-3.5 h-3.5 shrink-0 hidden sm:block"
                style={{ color: "oklch(0.40 0 0)" }}
              />
            )}
          </div>
        ))}
      </div>
      {activeStep && (
        <div
          className="rounded-lg px-4 py-3 text-xs leading-relaxed transition-all duration-200"
          style={{
            background: "oklch(0.65 0.20 220 / 0.06)",
            border: "1px solid oklch(0.65 0.20 220 / 0.15)",
            color: "oklch(0.75 0 0)",
            whiteSpace: "pre-line",
          }}
        >
          {steps.find((s) => s.id === activeStep)?.detail}
        </div>
      )}
    </div>
  );
}
