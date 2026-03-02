"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const routingSteps = [
  {
    id: "graph-load",
    step: "01",
    title: "Load Community Graph",
    description:
      "Parse the community's node-path JSON into an adjacency list. Each node is a gate, intersection, or waypoint. Each edge carries distance, direction (one-way flag), and time-based access rules.",
    code: "graph.loadFromGeoJSON(community.routes)\n// 312 nodes, 489 edges\n// 14 restricted segments",
    highlight: false,
  },
  {
    id: "filter-access",
    step: "02",
    title: "Apply Access Rules",
    description:
      "Before routing, disable edges that are currently inaccessible — restricted zones, time-gated service entrances, or locked perimeter segments. This produces a live subgraph valid for the current timestamp.",
    code: "const subgraph = graph.filterByTime(now)\n// 6 edges disabled (night restriction)\n// 2 edges disabled (VIP zone)",
    highlight: true,
  },
  {
    id: "dijkstra",
    step: "03",
    title: "Dijkstra / A* Pathfind",
    description:
      "Run A* with a euclidean heuristic over the filtered subgraph from origin node to destination. For patrol routes, use pre-computed shortest-path trees and cache them — recalculate only on graph mutations.",
    code: "const path = astar(subgraph, origin, dest)\n// 12 nodes, 847m\n// Computed in 4ms (512 nodes)",
    highlight: true,
  },
  {
    id: "post-process",
    step: "04",
    title: "Post-Process & Emit",
    description:
      "Convert node IDs back to SVG coordinates, smooth the path with a Catmull-Rom spline for natural rendering, and emit the route as a GeoJSON LineString. Update the live patrol assignment.",
    code: "route.toSVGPath(community.transform)\n// Smoothed polyline: 36 points\n// Emitted to patrol unit GPS-07",
    highlight: false,
  },
];

export function VizRoutingEngine() {
  const [current, setCurrent] = useState(0);

  const step = routingSteps[current];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p
          className="text-xs font-mono uppercase tracking-wider flex-1"
          style={{ color: "oklch(0.65 0.20 220 / 0.7)" }}
        >
          Routing pipeline — step {current + 1} of {routingSteps.length}
        </p>
        <div className="flex gap-1">
          {routingSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{
                background:
                  i === current
                    ? "oklch(0.65 0.20 220)"
                    : "oklch(1 0 0 / 0.15)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-5 space-y-3 transition-all duration-200"
        style={{
          background: step.highlight
            ? "oklch(0.65 0.20 220 / 0.06)"
            : "oklch(1 0 0 / 0.03)",
          border: step.highlight
            ? "1px solid oklch(0.65 0.20 220 / 0.20)"
            : "1px solid oklch(1 0 0 / 0.08)",
        }}
      >
        <div className="flex items-start gap-3">
          <span
            className="font-mono text-lg font-bold shrink-0 tabular-nums leading-none mt-0.5"
            style={{
              color: step.highlight
                ? "oklch(0.65 0.20 220)"
                : "oklch(0.35 0 0)",
            }}
          >
            {step.step}
          </span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">{step.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
        <div
          className="rounded-lg px-3 py-2.5 font-mono text-[11px] leading-relaxed"
          style={{
            background: "oklch(0.08 0.01 220)",
            border: "1px solid oklch(1 0 0 / 0.06)",
            color: "oklch(0.65 0.20 220 / 0.9)",
            whiteSpace: "pre",
          }}
        >
          {step.code}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30"
          style={{
            background: "oklch(1 0 0 / 0.04)",
            border: "1px solid oklch(1 0 0 / 0.08)",
            color: "oklch(0.65 0 0)",
          }}
        >
          <ChevronLeft className="w-3 h-3" />
          Previous
        </button>
        <button
          onClick={() =>
            setCurrent((c) => Math.min(routingSteps.length - 1, c + 1))
          }
          disabled={current === routingSteps.length - 1}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30"
          style={{
            background:
              current < routingSteps.length - 1
                ? "oklch(0.65 0.20 220 / 0.12)"
                : "oklch(1 0 0 / 0.04)",
            border:
              current < routingSteps.length - 1
                ? "1px solid oklch(0.65 0.20 220 / 0.30)"
                : "1px solid oklch(1 0 0 / 0.08)",
            color:
              current < routingSteps.length - 1
                ? "oklch(0.65 0.20 220)"
                : "oklch(0.65 0 0)",
          }}
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
