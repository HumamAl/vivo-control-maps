"use client";

import { useState } from "react";

type Mode = "naive" | "optimized";

const configs: Record<
  Mode,
  {
    label: string;
    pollInterval: string;
    positionalError: string;
    falseAlerts: string;
    batteryHours: string;
    kalman: string;
    geofenceBuffer: string;
    pollValue: number;
    errorValue: number;
    alertValue: number;
    batteryValue: number;
  }
> = {
  naive: {
    label: "Naive approach",
    pollInterval: "1s",
    positionalError: "±12m",
    falseAlerts: "~18/day",
    batteryHours: "6h",
    kalman: "Off",
    geofenceBuffer: "Fixed 5m",
    pollValue: 95,
    errorValue: 85,
    alertValue: 80,
    batteryValue: 30,
  },
  optimized: {
    label: "Kalman + adaptive polling",
    pollInterval: "3–8s adaptive",
    positionalError: "±2.4m",
    falseAlerts: "~5/day",
    batteryHours: "18h+",
    kalman: "Active",
    geofenceBuffer: "Accuracy-weighted",
    pollValue: 35,
    errorValue: 20,
    alertValue: 25,
    batteryValue: 85,
  },
};

const metrics = [
  {
    key: "pollInterval" as const,
    label: "Poll Interval",
    lower: "naive",
    valueKey: "pollValue" as const,
    invertBar: false,
  },
  {
    key: "positionalError" as const,
    label: "Positional Error",
    lower: "optimized",
    valueKey: "errorValue" as const,
    invertBar: false,
  },
  {
    key: "falseAlerts" as const,
    label: "False Off-Path Alerts",
    lower: "optimized",
    valueKey: "alertValue" as const,
    invertBar: false,
  },
  {
    key: "batteryHours" as const,
    label: "Battery Life",
    lower: "optimized",
    valueKey: "batteryValue" as const,
    invertBar: true,
  },
];

export function VizGpsTradeoff() {
  const [mode, setMode] = useState<Mode>("naive");

  const cfg = configs[mode];
  const isOptimized = mode === "optimized";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p
          className="text-xs font-mono uppercase tracking-wider flex-1"
          style={{ color: "oklch(0.65 0.20 220 / 0.7)" }}
        >
          GPS tracking strategy
        </p>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {(["naive", "optimized"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                background:
                  mode === m
                    ? "oklch(0.65 0.20 220 / 0.15)"
                    : "oklch(1 0 0 / 0.03)",
                color:
                  mode === m ? "oklch(0.65 0.20 220)" : "oklch(0.55 0 0)",
                borderRight:
                  m === "naive" ? "1px solid oklch(1 0 0 / 0.08)" : "none",
              }}
            >
              {m === "naive" ? "Naive" : "Optimized"}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-4 space-y-3 transition-all duration-200"
        style={{
          background: "oklch(1 0 0 / 0.03)",
          border: "1px solid oklch(1 0 0 / 0.07)",
        }}
      >
        <p
          className="text-xs font-medium"
          style={{
            color: isOptimized
              ? "oklch(0.65 0.20 220)"
              : "oklch(0.65 0 0)",
          }}
        >
          {cfg.label}
        </p>

        {metrics.map((m) => {
          const value = cfg[m.valueKey];
          const barColor = m.invertBar
            ? isOptimized
              ? "oklch(0.62 0.19 145)"
              : "oklch(0.60 0.18 27)"
            : !isOptimized
            ? "oklch(0.60 0.18 27)"
            : "oklch(0.62 0.19 145)";

          return (
            <div key={m.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span style={{ color: "oklch(0.60 0 0)" }}>{m.label}</span>
                <span
                  className="font-mono font-medium"
                  style={{ color: "oklch(0.80 0 0)" }}
                >
                  {cfg[m.key]}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full"
                style={{ background: "oklch(1 0 0 / 0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${value}%`,
                    background: barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div
          className="rounded-lg px-3 py-2 space-y-0.5"
          style={{
            background: "oklch(1 0 0 / 0.03)",
            border: "1px solid oklch(1 0 0 / 0.07)",
          }}
        >
          <p style={{ color: "oklch(0.50 0 0)" }}>Kalman filter</p>
          <p
            className="font-medium"
            style={{
              color: isOptimized
                ? "oklch(0.62 0.19 145)"
                : "oklch(0.60 0 0)",
            }}
          >
            {cfg.kalman}
          </p>
        </div>
        <div
          className="rounded-lg px-3 py-2 space-y-0.5"
          style={{
            background: "oklch(1 0 0 / 0.03)",
            border: "1px solid oklch(1 0 0 / 0.07)",
          }}
        >
          <p style={{ color: "oklch(0.50 0 0)" }}>Geofence buffer</p>
          <p
            className="font-medium"
            style={{
              color: isOptimized
                ? "oklch(0.65 0.20 220)"
                : "oklch(0.60 0 0)",
            }}
          >
            {cfg.geofenceBuffer}
          </p>
        </div>
      </div>
    </div>
  );
}
