"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  ShieldAlert,
  Radio,
  MapPin,
  Layers,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import {
  mapZones,
  routeNodes,
  routePaths,
  patrolUnits,
  gpsReadings,
  securityAlerts,
  monthlyMetrics,
  dashboardStats,
} from "@/data/mock-data";
import type { AlertSeverity, AlertStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Dynamic import for Recharts chart (SSR-safe) ─────────────────────────────
const MonthlyTrendsChart = dynamic(
  () =>
    import("@/components/dashboard/monthly-trends-chart").then(
      (m) => m.MonthlyTrendsChart
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[260px] rounded-lg animate-pulse"
        style={{ background: "var(--muted)" }}
      />
    ),
  }
);

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(target);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  description,
  accentColor,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  description: string;
  accentColor: string;
  index: number;
}) {
  const { count, ref } = useCountUp(value, 1100 + index * 80);

  const display =
    suffix === "%"
      ? `${(count / 10).toFixed(1)}%`
      : suffix === "/18"
      ? `${count}/18`
      : `${count}`;

  return (
    <div
      ref={ref}
      className="aesthetic-card animate-fade-up-in"
      style={{
        padding: "var(--card-padding)",
        animationDelay: `${index * 50}ms`,
        animationDuration: "150ms",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wide mb-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold font-mono tabular-nums"
            style={{ color: accentColor, letterSpacing: "-0.03em" }}
          >
            {display}
          </p>
          <p
            className="text-xs mt-1.5 truncate"
            style={{ color: "var(--muted-foreground)" }}
          >
            {description}
          </p>
        </div>
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ background: `color-mix(in oklch, ${accentColor}, transparent 82%)` }}
        >
          <Icon
            className="w-4 h-4"
            style={{ color: accentColor }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Alert severity helpers ────────────────────────────────────────────────────
function severityColor(severity: AlertSeverity): string {
  switch (severity) {
    case "critical":
      return "var(--destructive)";
    case "warning":
      return "var(--warning)";
    case "info":
      return "var(--chart-2)";
  }
}

function statusBadge(status: AlertStatus) {
  const styles: Record<AlertStatus, { bg: string; text: string; label: string }> = {
    active: {
      bg: "color-mix(in oklch, var(--destructive), transparent 80%)",
      text: "var(--destructive)",
      label: "Active",
    },
    acknowledged: {
      bg: "color-mix(in oklch, var(--warning), transparent 80%)",
      text: "var(--warning)",
      label: "Acknowledged",
    },
    resolved: {
      bg: "color-mix(in oklch, var(--success), transparent 80%)",
      text: "var(--success)",
      label: "Resolved",
    },
  };
  return styles[status];
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Patrol status color helper ────────────────────────────────────────────────
function patrolStatusColor(status: string): string {
  switch (status) {
    case "on-route":
      return "var(--success)";
    case "off-route":
      return "var(--destructive)";
    case "responding":
      return "var(--warning)";
    default:
      return "var(--muted-foreground)";
  }
}

// ── Zone type label ───────────────────────────────────────────────────────────
function zoneTypeLabel(type: string): string {
  switch (type) {
    case "residential":
      return "Res";
    case "commercial":
      return "Comm";
    case "recreational":
      return "Rec";
    case "restricted":
      return "Restr";
    case "entry-gate":
      return "Gate";
    default:
      return type;
  }
}

// ── Build a lookup map for routeNodes by id ───────────────────────────────────
const nodeMap = Object.fromEntries(routeNodes.map((n) => [n.id, n]));

// ── SVG Community Map ────────────────────────────────────────────────────────
function CommunityMap({
  highlightedAlert,
}: {
  highlightedAlert: string | null;
}) {
  const comm1Patrol = patrolUnits.filter((u) => u.communityId === "comm-1");
  const comm1GPS = gpsReadings.filter((g) => g.communityId === "comm-1");
  const offRouteUnit = comm1Patrol.find((u) => u.status === "off-route");

  // Build SVG paths for active routes (comm-1 only)
  const activeRoutes = routePaths.filter(
    (r) => r.communityId === "comm-1" && r.status === "active" && r.nodes.length > 1
  );

  const routePathData = activeRoutes.map((route) => {
    const points = route.nodes.map((nid) => nodeMap[nid]).filter(Boolean);
    if (points.length < 2) return null;
    const d = points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
      .join(" ");
    return { id: route.id, d, name: route.name };
  });

  return (
    <svg
      viewBox="0 0 800 680"
      className="w-full h-full"
      style={{ background: "transparent" }}
    >
      {/* ── Zone polygons ── */}
      {mapZones.map((zone) => {
        const pts = zone.coordinates
          .map((c) => `${c.x},${c.y}`)
          .join(" ");
        const isRestricted = zone.type === "restricted";
        return (
          <g key={zone.id}>
            <polygon
              points={pts}
              fill={zone.color}
              fillOpacity={isRestricted ? 0.18 : 0.12}
              stroke={zone.color}
              strokeOpacity={0.55}
              strokeWidth={1.5}
            />
            {/* Zone label */}
            <text
              x={
                zone.coordinates.reduce((s, c) => s + c.x, 0) /
                zone.coordinates.length
              }
              y={
                zone.coordinates.reduce((s, c) => s + c.y, 0) /
                  zone.coordinates.length -
                2
              }
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: "9px",
                fill: zone.color,
                fontFamily: "var(--font-geist-sans)",
                fontWeight: 600,
                opacity: 0.85,
                userSelect: "none",
              }}
            >
              {zoneTypeLabel(zone.type)}
            </text>
          </g>
        );
      })}

      {/* ── Route paths ── */}
      {routePathData.map(
        (r) =>
          r && (
            <path
              key={r.id}
              d={r.d}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity={0.3}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
          )
      )}

      {/* ── Route nodes ── */}
      {routeNodes
        .filter((n) => n.communityId === "comm-1")
        .map((node) => {
          const isGate = node.type === "gate";
          const isCheckpoint = node.type === "checkpoint";
          return (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={isGate ? 5 : isCheckpoint ? 4 : 3}
                fill={isGate ? "var(--primary)" : "var(--card)"}
                stroke="var(--primary)"
                strokeOpacity={0.6}
                strokeWidth={1.5}
              />
              {isGate && (
                <text
                  x={node.x}
                  y={node.y - 9}
                  textAnchor="middle"
                  style={{
                    fontSize: "8px",
                    fill: "var(--primary)",
                    fontFamily: "var(--font-geist-sans)",
                    fontWeight: 600,
                    userSelect: "none",
                  }}
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}

      {/* ── GPS position dots (comm-1 only) ── */}
      {comm1GPS.map((gps) => {
        const unit = comm1Patrol.find((u) =>
          u.position.x === gps.mapX && u.position.y === gps.mapY
        );
        const isOffRoute = !gps.onRoute;
        const dotColor = isOffRoute ? "var(--destructive)" : "var(--success)";

        return (
          <g key={gps.id}>
            {/* Pulse ring for off-route or highlighted */}
            {isOffRoute && (
              <circle
                cx={gps.mapX}
                cy={gps.mapY}
                r={10}
                fill="none"
                stroke="var(--destructive)"
                strokeWidth={1.5}
                strokeOpacity={0.5}
                className="animate-pulse-ring"
              />
            )}
            {/* Main dot */}
            <circle
              cx={gps.mapX}
              cy={gps.mapY}
              r={6}
              fill={dotColor}
              fillOpacity={0.9}
              stroke="var(--card)"
              strokeWidth={2}
            />
            {/* Unit label */}
            {unit && (
              <text
                x={gps.mapX + 10}
                y={gps.mapY + 1}
                dominantBaseline="middle"
                style={{
                  fontSize: "8px",
                  fill: dotColor,
                  fontFamily: "var(--font-geist-mono)",
                  fontWeight: 700,
                  userSelect: "none",
                }}
              >
                {unit.name}
              </text>
            )}
          </g>
        );
      })}

      {/* ── Off-route alert indicator ── */}
      {offRouteUnit && (
        <g>
          <circle
            cx={offRouteUnit.position.x}
            cy={offRouteUnit.position.y}
            r={18}
            fill="none"
            stroke="var(--destructive)"
            strokeWidth={2}
            strokeDasharray="4 3"
            strokeOpacity={0.7}
          />
          <text
            x={offRouteUnit.position.x}
            y={offRouteUnit.position.y - 26}
            textAnchor="middle"
            style={{
              fontSize: "9px",
              fill: "var(--destructive)",
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 700,
              userSelect: "none",
            }}
          >
            OFF ROUTE
          </text>
        </g>
      )}

      {/* ── Alert location markers ── */}
      {securityAlerts
        .filter(
          (a) => a.communityId === "comm-1" && a.status === "active"
        )
        .map((alert) => (
          <g key={alert.id}>
            <rect
              x={alert.location.x - 6}
              y={alert.location.y - 6}
              width={12}
              height={12}
              rx={2}
              fill={
                alert.severity === "critical"
                  ? "var(--destructive)"
                  : "var(--warning)"
              }
              fillOpacity={0.85}
              stroke="var(--card)"
              strokeWidth={1.5}
              transform={`rotate(45 ${alert.location.x} ${alert.location.y})`}
            />
          </g>
        ))}

      {/* ── Map legend ── */}
      <g transform="translate(10, 620)">
        <rect x={0} y={0} width={240} height={50} rx={4}
          fill="var(--card)" fillOpacity={0.85}
          stroke="var(--border)" strokeOpacity={0.4}
          strokeWidth={1}
        />
        {/* GPS on-route */}
        <circle cx={16} cy={12} r={5} fill="var(--success)" fillOpacity={0.9} />
        <text x={26} y={12} dominantBaseline="middle"
          style={{ fontSize: "9px", fill: "var(--muted-foreground)", fontFamily: "var(--font-geist-sans)", userSelect: "none" }}>
          On Route
        </text>
        {/* GPS off-route */}
        <circle cx={86} cy={12} r={5} fill="var(--destructive)" fillOpacity={0.9} />
        <text x={96} y={12} dominantBaseline="middle"
          style={{ fontSize: "9px", fill: "var(--muted-foreground)", fontFamily: "var(--font-geist-sans)", userSelect: "none" }}>
          Off Route
        </text>
        {/* Alert marker */}
        <rect x={155} y={7} width={8} height={8} rx={1}
          fill="var(--destructive)" fillOpacity={0.85}
          transform="rotate(45 159 11)"
        />
        <text x={171} y={12} dominantBaseline="middle"
          style={{ fontSize: "9px", fill: "var(--muted-foreground)", fontFamily: "var(--font-geist-sans)", userSelect: "none" }}>
          Alert
        </text>
        {/* Route path */}
        <line x1={8} y1={35} x2={32} y2={35}
          stroke="var(--primary)" strokeOpacity={0.5}
          strokeWidth={1.5} strokeDasharray="5 3"
        />
        <text x={38} y={35} dominantBaseline="middle"
          style={{ fontSize: "9px", fill: "var(--muted-foreground)", fontFamily: "var(--font-geist-sans)", userSelect: "none" }}>
          Patrol Route
        </text>
      </g>
    </svg>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function CommandCenterPage() {
  const [chartView, setChartView] = useState<"security" | "coverage">("security");
  const [alertFilter, setAlertFilter] = useState<AlertStatus | "all">("all");
  const [highlightedAlert, setHighlightedAlert] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    const sorted = [...securityAlerts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (alertFilter === "all") return sorted.slice(0, 8);
    return sorted.filter((a) => a.status === alertFilter).slice(0, 8);
  }, [alertFilter]);

  const comm1PatrolOnRoute = patrolUnits.filter(
    (u) => u.communityId === "comm-1" && u.status === "on-route"
  ).length;

  const stats = [
    {
      icon: Layers,
      label: "Active Communities",
      value: dashboardStats.totalCommunities,
      suffix: undefined,
      description: "4 gated communities monitored · all systems nominal",
      accentColor: "var(--primary)",
    },
    {
      icon: Radio,
      label: "GPS Devices Online",
      value: dashboardStats.activeDevices,
      suffix: "/18",
      description: `${dashboardStats.totalDevices - dashboardStats.activeDevices} offline · 1 low-signal`,
      accentColor: "var(--chart-2)",
    },
    {
      icon: ShieldAlert,
      label: "Active Alerts",
      value: dashboardStats.activeAlerts,
      suffix: undefined,
      description: "2 critical · 2 warning · requires attention",
      accentColor: "var(--destructive)",
    },
    {
      icon: MapPin,
      label: "Patrol Coverage",
      value: 942,
      suffix: "%",
      description: `${comm1PatrolOnRoute} units on-route · 1 off-route flagged`,
      accentColor: "var(--success)",
    },
  ];

  return (
    <div className="page-container space-y-6">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold aesthetic-heading"
            style={{ color: "var(--foreground)" }}
          >
            Patrol Command Center
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            The Preserves at Eagle Ridge · Live GPS + Route Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="relative flex h-2 w-2"
          >
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "var(--success)" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "var(--success)" }}
            />
          </span>
          <span className="text-xs font-mono" style={{ color: "var(--success)" }}>
            LIVE
          </span>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            · Updated 2026-03-01 14:35 UTC
          </span>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} index={i} />
        ))}
      </div>

      {/* ── SVG Map + Alert Feed (side-by-side on lg) ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SVG Community Map — takes 2 of 3 columns */}
        <div
          className="aesthetic-card lg:col-span-2 overflow-hidden"
          style={{ padding: 0 }}
        >
          {/* Map header */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "color-mix(in oklch, var(--border), transparent 40%)" }}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: "var(--primary)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Live Zone Map
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-mono"
                style={{
                  background: "color-mix(in oklch, var(--primary), transparent 84%)",
                  color: "var(--primary)",
                }}
              >
                Eagle Ridge
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span>
                {comm1PatrolOnRoute} on-route
              </span>
              <span
                className="font-semibold"
                style={{ color: "var(--destructive)" }}
              >
                1 off-route
              </span>
            </div>
          </div>

          {/* SVG canvas */}
          <div
            className="w-full"
            style={{ aspectRatio: "800 / 680", maxHeight: "460px", background: "var(--section-dark)" }}
          >
            <CommunityMap highlightedAlert={highlightedAlert} />
          </div>
        </div>

        {/* Live Alert Feed — 1 of 3 columns */}
        <div className="aesthetic-card flex flex-col overflow-hidden" style={{ padding: 0 }}>
          {/* Alert feed header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: "color-mix(in oklch, var(--border), transparent 40%)" }}
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" style={{ color: "var(--destructive)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                Security Alerts
              </span>
            </div>
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                background: "color-mix(in oklch, var(--destructive), transparent 82%)",
                color: "var(--destructive)",
              }}
            >
              {dashboardStats.activeAlerts} active
            </span>
          </div>

          {/* Filter tabs */}
          <div
            className="flex gap-1 px-3 py-2 border-b shrink-0"
            style={{ borderColor: "color-mix(in oklch, var(--border), transparent 50%)" }}
          >
            {(["all", "active", "acknowledged", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                className={cn(
                  "px-2 py-1 text-xs rounded capitalize font-medium transition-colors"
                )}
                style={{
                  background:
                    alertFilter === f
                      ? "color-mix(in oklch, var(--primary), transparent 80%)"
                      : "transparent",
                  color:
                    alertFilter === f
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                  transitionDuration: "var(--dur-fast)",
                }}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto">
            {filteredAlerts.map((alert) => {
              const sev = severityColor(alert.severity);
              const badge = statusBadge(alert.status);
              return (
                <button
                  key={alert.id}
                  className="w-full text-left px-4 py-3 border-b aesthetic-hover flex flex-col gap-1.5"
                  style={{
                    borderColor: "color-mix(in oklch, var(--border), transparent 50%)",
                    borderLeftWidth: "3px",
                    borderLeftColor: sev,
                    background: "transparent",
                  }}
                  onMouseEnter={() => setHighlightedAlert(alert.id)}
                  onMouseLeave={() => setHighlightedAlert(null)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-xs font-semibold leading-tight"
                      style={{ color: "var(--foreground)" }}
                    >
                      {alert.type
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p
                    className="text-[11px] leading-relaxed line-clamp-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock
                      className="w-3 h-3 shrink-0"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {formatTimeAgo(alert.timestamp)}
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredAlerts.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-10 gap-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: "var(--success)" }} />
                <p className="text-xs">No alerts in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Patrol Unit Status Grid ───────────────────────────── */}
      <div className="aesthetic-card" style={{ padding: 0 }}>
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "color-mix(in oklch, var(--border), transparent 40%)" }}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: "var(--chart-2)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Patrol Units
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {patrolUnits.filter((u) => u.status === "on-route").length} of {patrolUnits.length} on-route
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y"
          style={{ borderColor: "color-mix(in oklch, var(--border), transparent 50%)" }}
        >
          {patrolUnits.map((unit) => {
            const route = routePaths.find((r) => r.id === unit.currentRoute);
            const statusColor = patrolStatusColor(unit.status);
            return (
              <div
                key={unit.id}
                className="px-4 py-3 flex flex-col gap-1"
                style={{
                  borderColor: "color-mix(in oklch, var(--border), transparent 50%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: statusColor }}
                  />
                  <span
                    className="text-xs font-semibold font-mono"
                    style={{ color: "var(--foreground)" }}
                  >
                    {unit.name}
                  </span>
                </div>
                <span
                  className="text-[10px] capitalize"
                  style={{ color: statusColor }}
                >
                  {unit.status.replace("-", " ")}
                </span>
                <span
                  className="text-[10px] truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {route?.name ?? "No route assigned"}
                </span>
                <div className="mt-1">
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${unit.coveragePercent}%`,
                        background: statusColor,
                        transitionDuration: "var(--dur-slow)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-mono mt-0.5 block"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {unit.coveragePercent}% coverage
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Monthly Trends Chart ──────────────────────────────── */}
      <div className="aesthetic-card" style={{ padding: 0 }}>
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b"
          style={{ borderColor: "color-mix(in oklch, var(--border), transparent 40%)" }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
              12-Month Operations Trend
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {chartView === "security"
                ? "Security alert frequency and avg response time"
                : "Routes completed and patrol coverage percentage"}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {(["security", "coverage"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                className="px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-colors"
                style={{
                  background:
                    chartView === v
                      ? "var(--primary)"
                      : "color-mix(in oklch, var(--primary), transparent 88%)",
                  color:
                    chartView === v
                      ? "var(--primary-foreground)"
                      : "var(--primary)",
                  transitionDuration: "var(--dur-fast)",
                }}
              >
                {v === "security" ? "Security Events" : "Route Coverage"}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4">
          <MonthlyTrendsChart data={monthlyMetrics} view={chartView} />
        </div>
      </div>

      {/* ── Bottom Proposal Banner ────────────────────────────── */}
      <div
        className="rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklch, var(--primary), transparent 88%), transparent)",
          borderColor: "color-mix(in oklch, var(--primary), transparent 78%)",
        }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            This is a live demo built for{" "}
            <span style={{ color: "var(--primary)" }}>
              {APP_CONFIG.projectName}
            </span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Humam · Full-Stack Developer · Available now
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/challenges"
            className="text-xs transition-colors"
            style={{
              color: "var(--muted-foreground)",
              transitionDuration: "var(--dur-fast)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--foreground)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--muted-foreground)")
            }
          >
            My Approach →
          </a>
          <a
            href="/proposal"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              transitionDuration: "var(--dur-fast)",
            }}
          >
            Work with me
          </a>
        </div>
      </div>
    </div>
  );
}
