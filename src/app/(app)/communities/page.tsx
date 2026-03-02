"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  communities,
  routePaths,
  mapZones,
  gpsDevices,
  securityAlerts,
} from "@/data/mock-data";
import type { Community } from "@/lib/types";
import {
  Search,
  Building2,
  Route,
  Radar,
  Home,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  X,
  Map,
  CheckCircle2,
} from "lucide-react";

function CoverageBar({ pct }: { pct: number }) {
  const color =
    pct >= 90
      ? "bg-[color:var(--success)]"
      : pct >= 75
      ? "bg-[color:var(--warning)]"
      : "bg-destructive";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Coverage</span>
        <span
          className={cn(
            "font-mono font-semibold",
            pct >= 90
              ? "text-[color:var(--success)]"
              : pct >= 75
              ? "text-[color:var(--warning)]"
              : "text-destructive"
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CoverageBadge({ pct }: { pct: number }) {
  if (pct >= 90)
    return (
      <Badge
        variant="outline"
        className="text-xs font-medium border-0 rounded-full text-[color:var(--success)] bg-[color:var(--success)]/10"
      >
        Full Coverage
      </Badge>
    );
  if (pct >= 75)
    return (
      <Badge
        variant="outline"
        className="text-xs font-medium border-0 rounded-full text-[color:var(--warning)] bg-[color:var(--warning)]/10"
      >
        Partial Coverage
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium border-0 rounded-full text-destructive bg-destructive/10"
    >
      Low Coverage
    </Badge>
  );
}

function formatLastUpdated(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Build derived stats per community
function getCommunityStats(communityId: string) {
  const routes = routePaths.filter((r) => r.communityId === communityId);
  const zones = mapZones.filter((z) => z.communityId === communityId);
  const devices = gpsDevices.filter((d) => d.communityId === communityId);
  const alerts = securityAlerts.filter((a) => a.communityId === communityId);
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const onlineDevices = devices.filter((d) => d.status === "online");

  return {
    routes,
    zones,
    devices,
    alerts,
    activeAlerts,
    onlineDevices,
    activeRoutes: routes.filter((r) => r.status === "active"),
    totalProperties: zones.reduce((s, z) => s + z.properties, 0),
  };
}

type SortKey = keyof Pick<
  Community,
  | "name"
  | "totalProperties"
  | "totalZones"
  | "activeRoutes"
  | "gpsDevices"
  | "coveragePercent"
>;

export default function CommunitiesPage() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("coveragePercent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const displayed = useMemo(() => {
    return communities
      .filter(
        (c) =>
          search === "" ||
          c.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, sortKey, sortDir]);

  const selectedCommunity = communities.find((c) => c.id === selectedId);
  const selectedStats = selectedId
    ? getCommunityStats(selectedId)
    : null;

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sortColumns: Array<{ key: SortKey; label: string }> = [
    { key: "coveragePercent", label: "Coverage" },
    { key: "totalProperties", label: "Properties" },
    { key: "gpsDevices", label: "Devices" },
  ];

  // Network-wide totals
  const networkTotals = {
    communities: communities.length,
    properties: communities.reduce((s, c) => s + c.totalProperties, 0),
    devices: communities.reduce((s, c) => s + c.gpsDevices, 0),
    routes: communities.reduce((s, c) => s + c.activeRoutes, 0),
  };

  return (
    <div
      className="space-y-6"
      style={{ padding: "var(--content-padding)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Managed gated communities — coverage, patrol deployment, and device
            status at a glance
          </p>
        </div>
      </div>

      {/* Network-wide stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { Icon: Building2, label: "Communities", value: networkTotals.communities, cls: "text-primary", bg: "bg-primary/5" },
          { Icon: Home, label: "Properties Managed", value: networkTotals.properties.toLocaleString(), cls: "text-[color:var(--chart-2)]", bg: "bg-[color:var(--chart-2)]/5" },
          { Icon: Radar, label: "GPS Devices", value: networkTotals.devices, cls: "text-[color:var(--chart-3)]", bg: "bg-[color:var(--chart-3)]/5" },
          { Icon: Route, label: "Active Routes", value: networkTotals.routes, cls: "text-[color:var(--chart-4)]", bg: "bg-[color:var(--chart-4)]/5" },
        ].map((s) => (
          <div
            key={s.label}
            className="aesthetic-card flex items-center gap-3"
            style={{ padding: "var(--card-padding-sm)" }}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                s.bg
              )}
            >
              <s.Icon className={cn("w-4 h-4", s.cls)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                {s.label}
              </p>
              <p className="text-xl font-bold font-mono mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Sort:</span>
          {sortColumns.map((col) => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors",
                sortKey === col.key
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:bg-[color:var(--surface-hover)]"
              )}
            >
              {col.label}
              {sortKey === col.key &&
                (sortDir === "desc" ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                ))}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length}{" "}
          {displayed.length === 1 ? "community" : "communities"}
        </span>
      </div>

      {/* Card grid + detail panel */}
      <div className="flex gap-4 items-start">
        {/* Cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
          {displayed.length === 0 ? (
            <div className="sm:col-span-2 aesthetic-card flex items-center justify-center h-32 text-sm text-muted-foreground">
              No communities match this search.
            </div>
          ) : (
            displayed.map((community, idx) => {
              const stats = getCommunityStats(community.id);
              const isSelected = selectedId === community.id;
              return (
                <div
                  key={community.id}
                  className={cn(
                    "aesthetic-card cursor-pointer transition-all",
                    isSelected && "border-primary/40 ring-1 ring-primary/20"
                  )}
                  style={{
                    padding: "var(--card-padding)",
                    animationDelay: `${idx * 50}ms`,
                  }}
                  onClick={() =>
                    setSelectedId(isSelected ? null : community.id)
                  }
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Map className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm leading-tight truncate">
                          {community.name}
                        </h3>
                      </div>
                    </div>
                    <CoverageBadge pct={community.coveragePercent} />
                  </div>

                  {/* Coverage bar */}
                  <CoverageBar pct={community.coveragePercent} />

                  {/* Metrics grid */}
                  <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-border/40">
                    {[
                      {
                        Icon: Home,
                        label: "Properties",
                        value: community.totalProperties,
                      },
                      {
                        Icon: Map,
                        label: "Zones",
                        value: community.totalZones,
                      },
                      {
                        Icon: Route,
                        label: "Routes",
                        value: community.activeRoutes,
                      },
                      {
                        Icon: Radar,
                        label: "Devices",
                        value: community.gpsDevices,
                      },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <m.Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-sm font-bold font-mono">
                          {m.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Alert indicator */}
                  {stats.activeAlerts.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      {stats.activeAlerts.length} active{" "}
                      {stats.activeAlerts.length === 1 ? "alert" : "alerts"}
                    </div>
                  )}
                  {stats.activeAlerts.length === 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[color:var(--success)]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      No active alerts
                    </div>
                  )}

                  {/* Last updated */}
                  <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">
                    Updated {formatLastUpdated(community.lastUpdated)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selectedCommunity && selectedStats && (
          <div
            className="w-72 shrink-0 aesthetic-card"
            style={{ padding: "var(--card-padding)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0 pr-2">
                <h3 className="font-semibold text-sm leading-tight">
                  {selectedCommunity.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Community detail
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[color:var(--surface-hover)] transition-colors text-muted-foreground shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <CoverageBar pct={selectedCommunity.coveragePercent} />

            <div className="mt-4 space-y-0 divide-y divide-border/40">
              {[
                { label: "Total Properties", value: selectedCommunity.totalProperties.toLocaleString() },
                { label: "Mapped Zones", value: selectedStats.zones.length || selectedCommunity.totalZones },
                { label: "Active Routes", value: selectedStats.activeRoutes.length || selectedCommunity.activeRoutes },
                { label: "GPS Devices", value: selectedStats.devices.length || selectedCommunity.gpsDevices },
                { label: "Online Devices", value: selectedStats.onlineDevices.length },
                { label: "Total Alerts (all time)", value: selectedStats.alerts.length },
                { label: "Active Alerts", value: selectedStats.activeAlerts.length },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="text-sm font-mono font-semibold">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Zone breakdown */}
            {selectedStats.zones.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/40">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Zone Breakdown
                </p>
                <div className="space-y-1.5">
                  {selectedStats.zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground truncate max-w-[150px]">
                        {zone.name}
                      </span>
                      <span className="font-mono text-[10px] capitalize text-muted-foreground/70">
                        {zone.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground/60 mt-4 font-mono">
              Last updated {formatLastUpdated(selectedCommunity.lastUpdated)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
