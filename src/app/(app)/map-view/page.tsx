"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mapZones,
  routePaths,
  routeNodes,
  gpsReadings,
  gpsDevices,
} from "@/data/mock-data";
import type { MapZone, ZoneType } from "@/lib/types";
import {
  MapPin,
  Navigation,
  Layers,
  Activity,
  X,
} from "lucide-react";

const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  recreational: "Recreational",
  restricted: "Restricted",
  "entry-gate": "Entry Gate",
};

const ZONE_TYPE_COLORS: Record<ZoneType, string> = {
  residential: "text-[color:var(--chart-2)] bg-[color:var(--chart-2)]/10",
  commercial: "text-[color:var(--chart-1)] bg-[color:var(--chart-1)]/10",
  recreational: "text-[color:var(--chart-4)] bg-[color:var(--chart-4)]/10",
  restricted: "text-destructive bg-destructive/10",
  "entry-gate": "text-[color:var(--chart-3)] bg-[color:var(--chart-3)]/10",
};

function ZoneTypeBadge({ type }: { type: ZoneType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border-0 rounded-full",
        ZONE_TYPE_COLORS[type]
      )}
    >
      {ZONE_TYPE_LABELS[type]}
    </Badge>
  );
}

// Active routes for overlay
const activeRoutes = routePaths.filter(
  (r) => r.status === "active" && r.nodes.length > 1
);

// Build node lookup
const nodeMap = Object.fromEntries(routeNodes.map((n) => [n.id, n]));

// Map canvas dimensions (must match coordinate space in mock data)
const MAP_W = 800;
const MAP_H = 700;

export default function MapViewPage() {
  const [zoneFilter, setZoneFilter] = useState<ZoneType | "all">("all");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showDevices, setShowDevices] = useState(true);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null);

  const visibleZones = useMemo(
    () =>
      mapZones.filter(
        (z) => zoneFilter === "all" || z.type === zoneFilter
      ),
    [zoneFilter]
  );

  // GPS readings for comm-1 (the displayed community)
  const comm1Readings = gpsReadings.filter(
    (r) => r.communityId === "comm-1"
  );

  // Build polyline path string from node IDs
  function routePolyline(nodeIds: string[]): string {
    return nodeIds
      .map((id) => nodeMap[id])
      .filter(Boolean)
      .map((n) => `${n.x},${n.y}`)
      .join(" ");
  }

  const zoneTypeOptions: Array<ZoneType | "all"> = [
    "all",
    "residential",
    "commercial",
    "recreational",
    "restricted",
    "entry-gate",
  ];

  return (
    <div
      className="space-y-6"
      style={{ padding: "var(--content-padding)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Community Map
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The Preserves at Eagle Ridge — zone layout, active patrol routes,
            and live GPS positions
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zone filter */}
          <Select
            value={zoneFilter}
            onValueChange={(v) => setZoneFilter(v as ZoneType | "all")}
          >
            <SelectTrigger className="w-40 h-8 text-xs">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Zone type" />
            </SelectTrigger>
            <SelectContent>
              {zoneTypeOptions.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t === "all" ? "All zone types" : ZONE_TYPE_LABELS[t as ZoneType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Route overlay toggle */}
          <button
            onClick={() => setShowRoutes((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium border transition-colors",
              showRoutes
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-[color:var(--surface-hover)]"
            )}
          >
            <Navigation className="w-3.5 h-3.5" />
            Routes
          </button>

          {/* Device overlay toggle */}
          <button
            onClick={() => setShowDevices((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium border transition-colors",
              showDevices
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-[color:var(--surface-hover)]"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            GPS Devices
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {(
          [
            "residential",
            "commercial",
            "recreational",
            "restricted",
            "entry-gate",
          ] as ZoneType[]
        ).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span
              className={cn(
                "w-3 h-3 rounded-sm inline-block",
                t === "restricted"
                  ? "bg-destructive/40"
                  : t === "residential"
                  ? "bg-[color:var(--chart-2)]/40"
                  : t === "commercial"
                  ? "bg-[color:var(--chart-1)]/40"
                  : t === "recreational"
                  ? "bg-[color:var(--chart-4)]/40"
                  : "bg-[color:var(--chart-3)]/40"
              )}
            />
            {ZONE_TYPE_LABELS[t]}
          </span>
        ))}
        {showRoutes && (
          <span className="flex items-center gap-1.5">
            <svg width="14" height="4" className="inline-block">
              <line
                x1="0"
                y1="2"
                x2="14"
                y2="2"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
            </svg>
            Patrol routes
          </span>
        )}
        {showDevices && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[color:var(--success)] inline-block" />
            GPS device
          </span>
        )}
      </div>

      {/* Main layout: map + side panel */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Map canvas */}
        <div className="flex-1 aesthetic-card overflow-hidden min-w-0">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="w-full h-auto"
            style={{ maxHeight: "560px" }}
          >
            {/* Background */}
            <rect
              width={MAP_W}
              height={MAP_H}
              className="fill-[color:var(--muted)]"
            />

            {/* Zones */}
            {visibleZones.map((zone) => {
              const pts = zone.coordinates
                .map((c) => `${c.x},${c.y}`)
                .join(" ");
              const isSelected = selectedZone?.id === zone.id;
              const isHovered = hoveredZone === zone.id;
              const cx =
                zone.coordinates.reduce((s, c) => s + c.x, 0) /
                zone.coordinates.length;
              const cy =
                zone.coordinates.reduce((s, c) => s + c.y, 0) /
                zone.coordinates.length;

              return (
                <g
                  key={zone.id}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedZone(
                      selectedZone?.id === zone.id ? null : zone
                    )
                  }
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <polygon
                    points={pts}
                    fill={
                      zone.type === "restricted"
                        ? "oklch(0.577 0.245 27.325 / 0.18)"
                        : zone.type === "residential"
                        ? "oklch(0.70 0.15 180 / 0.15)"
                        : zone.type === "commercial"
                        ? "oklch(0.65 0.20 220 / 0.15)"
                        : zone.type === "recreational"
                        ? "oklch(0.75 0.16 160 / 0.18)"
                        : "oklch(0.55 0.18 260 / 0.18)"
                    }
                    stroke={
                      isSelected
                        ? "var(--primary)"
                        : zone.type === "restricted"
                        ? "oklch(0.577 0.245 27.325 / 0.6)"
                        : "oklch(1 0 0 / 0.15)"
                    }
                    strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                    opacity={
                      zoneFilter !== "all" && zone.type !== zoneFilter
                        ? 0.3
                        : 1
                    }
                    style={{ transition: "all 150ms" }}
                  />
                  {/* Zone label */}
                  {(isHovered || isSelected) && (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10"
                      fill="var(--foreground)"
                      fontFamily="var(--font-geist-sans, sans-serif)"
                      fontWeight="500"
                      style={{ pointerEvents: "none" }}
                    >
                      {zone.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Route paths */}
            {showRoutes &&
              activeRoutes.slice(0, 6).map((route, i) => {
                const pts = routePolyline(route.nodes);
                if (!pts) return null;
                return (
                  <polyline
                    key={route.id}
                    points={pts}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                    opacity={0.5 + i * 0.05}
                    style={{ pointerEvents: "none" }}
                  />
                );
              })}

            {/* Route nodes */}
            {showRoutes &&
              routeNodes
                .filter((n) => n.communityId === "comm-1")
                .map((node) => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === "gate" ? 6 : 4}
                      fill={
                        node.type === "gate"
                          ? "var(--primary)"
                          : node.type === "checkpoint"
                          ? "var(--warning)"
                          : "oklch(1 0 0 / 0.5)"
                      }
                      stroke="var(--primary)"
                      strokeWidth={node.type === "gate" ? 0 : 1}
                      opacity={0.8}
                    />
                  </g>
                ))}

            {/* GPS device dots */}
            {showDevices &&
              comm1Readings.map((reading) => {
                const device = gpsDevices.find(
                  (d) => d.id === reading.deviceId
                );
                const isOffRoute = !reading.onRoute;
                return (
                  <g key={reading.id}>
                    {/* Pulse ring for online devices */}
                    {device?.status === "online" && (
                      <circle
                        cx={reading.mapX}
                        cy={reading.mapY}
                        r="10"
                        fill="none"
                        stroke={
                          isOffRoute
                            ? "oklch(0.769 0.188 70.08)"
                            : "var(--success)"
                        }
                        strokeWidth="1"
                        opacity="0.4"
                      />
                    )}
                    <circle
                      cx={reading.mapX}
                      cy={reading.mapY}
                      r="5"
                      fill={
                        device?.status === "low-signal"
                          ? "oklch(0.769 0.188 70.08)"
                          : isOffRoute
                          ? "oklch(0.769 0.188 70.08)"
                          : "var(--success)"
                      }
                      stroke="oklch(0.08 0.01 220)"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          {selectedZone ? (
            <div className="aesthetic-card h-full" style={{ padding: "var(--card-padding)" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm leading-tight">
                    {selectedZone.name}
                  </h3>
                  <div className="mt-1.5">
                    <ZoneTypeBadge type={selectedZone.type} />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[color:var(--surface-hover)] transition-colors text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Community</span>
                  <span className="font-medium text-xs text-right">
                    The Preserves at Eagle Ridge
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Properties</span>
                  <span className="font-mono font-medium">
                    {selectedZone.properties === 0
                      ? "—"
                      : selectedZone.properties}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2 border-b border-border/40">
                  <span className="text-muted-foreground">Zone ID</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selectedZone.id.toUpperCase()}
                  </span>
                </div>

                {/* GPS devices in this zone vicinity */}
                <div className="pt-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Devices Nearby
                  </p>
                  {comm1Readings.slice(0, 3).map((r) => {
                    const dev = gpsDevices.find((d) => d.id === r.deviceId);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              dev?.status === "online"
                                ? "bg-[color:var(--success)]"
                                : dev?.status === "low-signal"
                                ? "bg-[color:var(--warning)]"
                                : "bg-destructive"
                            )}
                          />
                          <span className="text-xs truncate max-w-[120px]">
                            {dev?.label ?? r.deviceId}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">
                          {r.accuracy}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="aesthetic-card h-full flex flex-col items-center justify-center text-center gap-3"
              style={{ padding: "var(--card-padding)" }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary/60" />
              </div>
              <div>
                <p className="text-sm font-medium">Select a Zone</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click any shaded zone on the map to view zone details and
                  nearby GPS devices
                </p>
              </div>
              <div className="w-full pt-2 border-t border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Visible Zones
                </p>
                <div className="space-y-1">
                  {visibleZones.map((z) => (
                    <button
                      key={z.id}
                      onClick={() => setSelectedZone(z)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[color:var(--surface-hover)] transition-colors"
                    >
                      <span className="text-xs text-left truncate">
                        {z.name}
                      </span>
                      <ZoneTypeBadge type={z.type} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Zones Mapped", value: mapZones.length, sub: "Eagle Ridge" },
          { label: "Active Routes", value: activeRoutes.length, sub: "Overlaid" },
          { label: "Live GPS Pings", value: comm1Readings.length, sub: "This community" },
          { label: "Route Nodes", value: routeNodes.filter(n => n.communityId === "comm-1").length, sub: "Checkpoints" },
        ].map((s) => (
          <div
            key={s.label}
            className="aesthetic-card"
            style={{ padding: "var(--card-padding-sm)" }}
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold font-mono mt-0.5">{s.value}</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
