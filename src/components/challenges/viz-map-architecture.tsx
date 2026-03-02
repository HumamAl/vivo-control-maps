"use client";

import { useState } from "react";
import { Layers, Shield, Truck, AlertTriangle, Map, Settings } from "lucide-react";

type LayerDef = {
  id: string;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  detail: string;
  accentColor: string;
};

const layers: LayerDef[] = [
  {
    id: "base",
    icon: Map,
    label: "Base SVG Layer",
    sublabel: "Community geometry",
    detail:
      "Static SVG per community: streets, buildings, perimeter walls, gate positions. Loaded once, never re-rendered on layer swaps. Transforms applied via CSS matrix() — no DOM mutations.",
    accentColor: "oklch(0.55 0 0)",
  },
  {
    id: "zones",
    icon: Settings,
    label: "Zone Schema",
    sublabel: "Configurable per community",
    detail:
      "Zone definitions loaded from GeoJSON config: residential, commercial, restricted, entry-gate. Each zone carries access rules and alert thresholds. Hot-reloadable without touching the base layer.",
    accentColor: "oklch(0.65 0.20 220)",
  },
  {
    id: "patrol",
    icon: Shield,
    label: "Patrol Layer",
    sublabel: "Active routes + positions",
    detail:
      "Real-time overlay of active patrol routes and GPS positions. Renders only patrol-type devices. Can be toggled independently — security operations often run this without the delivery overlay.",
    accentColor: "oklch(0.62 0.19 145)",
  },
  {
    id: "delivery",
    icon: Truck,
    label: "Delivery Layer",
    sublabel: "Contractor + visitor access",
    detail:
      "Delivery vehicles and contractors have time-limited access corridors. This layer shows allowed entry paths, time windows, and current positions of delivery-type devices.",
    accentColor: "oklch(0.75 0.18 85)",
  },
  {
    id: "alerts",
    icon: AlertTriangle,
    label: "Alert Overlay",
    sublabel: "Security events",
    detail:
      "Live security alerts rendered as georeferenced markers. Off-path deviations, zone breaches, signal-loss events. Always rendered on top — never hidden by layer ordering.",
    accentColor: "oklch(0.60 0.18 27)",
  },
];

export function VizMapArchitecture() {
  const [activeLayer, setActiveLayer] = useState<string>("patrol");
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(
    new Set(["base", "zones", "patrol"])
  );

  const toggleLayer = (id: string) => {
    if (id === "base") return;
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeLayerDef = layers.find((l) => l.id === activeLayer);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers
          className="w-3.5 h-3.5"
          style={{ color: "oklch(0.65 0.20 220 / 0.7)" }}
        />
        <p
          className="text-xs font-mono uppercase tracking-wider"
          style={{ color: "oklch(0.65 0.20 220 / 0.7)" }}
        >
          Map layer system — toggle layers, click to inspect
        </p>
      </div>

      <div className="space-y-1.5">
        {layers.map((layer) => {
          const isVisible = visibleLayers.has(layer.id);
          const isActive = activeLayer === layer.id;
          const isBase = layer.id === "base";
          const LayerIcon = layer.icon;

          return (
            <div key={layer.id} className="flex items-stretch">
              {/* Visibility dot toggle */}
              <button
                onClick={() => toggleLayer(layer.id)}
                disabled={isBase}
                className="flex items-center justify-center w-8 shrink-0 rounded-l-lg transition-all duration-200"
                style={{
                  background: isVisible
                    ? "oklch(1 0 0 / 0.05)"
                    : "oklch(1 0 0 / 0.02)",
                  borderTop: "1px solid oklch(1 0 0 / 0.07)",
                  borderLeft: "1px solid oklch(1 0 0 / 0.07)",
                  borderBottom: "1px solid oklch(1 0 0 / 0.07)",
                  cursor: isBase ? "default" : "pointer",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    background: isVisible ? layer.accentColor : "oklch(1 0 0 / 0.12)",
                  }}
                />
              </button>

              {/* Layer row */}
              <button
                onClick={() => setActiveLayer(layer.id)}
                className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-r-lg transition-all duration-200 text-left"
                style={{
                  background: isActive
                    ? "oklch(1 0 0 / 0.06)"
                    : "oklch(1 0 0 / 0.02)",
                  borderTop: "1px solid oklch(1 0 0 / 0.07)",
                  borderRight: "1px solid oklch(1 0 0 / 0.07)",
                  borderBottom: "1px solid oklch(1 0 0 / 0.07)",
                  opacity: isVisible ? 1 : 0.4,
                }}
              >
                <LayerIcon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{
                    color: isActive ? layer.accentColor : "oklch(0.45 0 0)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{
                      color: isActive ? "oklch(0.88 0 0)" : "oklch(0.60 0 0)",
                    }}
                  >
                    {layer.label}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "oklch(0.42 0 0)" }}
                  >
                    {layer.sublabel}
                  </p>
                </div>
                {isBase && (
                  <span
                    className="text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{
                      background: "oklch(1 0 0 / 0.05)",
                      color: "oklch(0.42 0 0)",
                    }}
                  >
                    always on
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {activeLayerDef && (
        <div
          className="rounded-lg px-3 py-2.5 text-xs leading-relaxed transition-all duration-200"
          style={{
            background: "oklch(0.65 0.20 220 / 0.04)",
            border: "1px solid oklch(0.65 0.20 220 / 0.12)",
            color: "oklch(0.65 0 0)",
          }}
        >
          {activeLayerDef.detail}
        </div>
      )}
    </div>
  );
}
