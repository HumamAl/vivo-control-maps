"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { routePaths, routeNodes, communities } from "@/data/mock-data";
import type { RoutePath, RouteStatus } from "@/lib/types";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Route,
  Clock,
  MapPin,
  ArrowRightLeft,
} from "lucide-react";

type SortKey = keyof Pick<
  RoutePath,
  "name" | "distanceMeters" | "estimatedMinutes" | "status" | "lastUsed"
>;

function StatusBadge({ status }: { status: RouteStatus }) {
  const config: Record<
    RouteStatus,
    { label: string; color: "success" | "warning" | "muted" }
  > = {
    active: { label: "Active", color: "success" },
    maintenance: { label: "Maintenance", color: "warning" },
    inactive: { label: "Inactive", color: "muted" },
  };
  const c = config[status];
  const colorClass = {
    success: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    warning: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    muted: "text-muted-foreground bg-muted",
  }[c.color];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium border-0 rounded-full", colorClass)}
    >
      {c.label}
    </Badge>
  );
}

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${meters} m`;
}

function formatLastUsed(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-03-01T15:00:00Z");
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  if (diffH === 0) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ${diffM}m ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// Community lookup
const communityMap = Object.fromEntries(communities.map((c) => [c.id, c.name]));
// Node lookup
const nodeMap = Object.fromEntries(routeNodes.map((n) => [n.id, n]));

const NODE_TYPE_ICONS: Record<string, string> = {
  gate: "G",
  intersection: "X",
  waypoint: "W",
  checkpoint: "C",
  poi: "P",
};

export default function RoutesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RouteStatus | "all">("all");
  const [communityFilter, setCommunityFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastUsed");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedRoute, setSelectedRoute] = useState<RoutePath | null>(null);

  const displayed = useMemo(() => {
    return routePaths
      .filter((r) => {
        const matchesStatus =
          statusFilter === "all" || r.status === statusFilter;
        const matchesCommunity =
          communityFilter === "all" || r.communityId === communityFilter;
        const matchesSearch =
          search === "" ||
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.id.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesCommunity && matchesSearch;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, communityFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const columns: Array<{
    key: SortKey;
    label: string;
    sortable: boolean;
    align?: "right";
  }> = [
    { key: "name", label: "Route Name", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "distanceMeters", label: "Distance", sortable: true, align: "right" },
    { key: "estimatedMinutes", label: "Est. Time", sortable: true, align: "right" },
    { key: "lastUsed", label: "Last Dispatched", sortable: true },
  ];

  // Nodes for selected route
  const selectedNodes = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.nodes
      .map((id) => nodeMap[id])
      .filter(Boolean);
  }, [selectedRoute]);

  return (
    <div
      className="space-y-6"
      style={{ padding: "var(--content-padding)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Route Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Patrol routes across all communities — distances, dispatch times, and
            node sequences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-lg font-bold font-mono">
              {routePaths.filter((r) => r.status === "active").length}
            </p>
            <p className="text-xs text-muted-foreground">Active routes</p>
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Route,
            label: "Total Routes",
            value: routePaths.length,
            color: "text-primary",
          },
          {
            icon: Route,
            label: "Active",
            value: routePaths.filter((r) => r.status === "active").length,
            color: "text-[color:var(--success)]",
          },
          {
            icon: ArrowRightLeft,
            label: "Under Maintenance",
            value: routePaths.filter((r) => r.status === "maintenance").length,
            color: "text-[color:var(--warning)]",
          },
          {
            icon: MapPin,
            label: "Total Waypoints",
            value: routeNodes.length,
            color: "text-[color:var(--chart-3)]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="aesthetic-card flex items-center gap-3"
            style={{ padding: "var(--card-padding-sm)" }}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-primary/5"
              )}
            >
              <s.icon className={cn("w-4 h-4", s.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                {s.label}
              </p>
              <p className="text-lg font-bold font-mono mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as RouteStatus | "all")}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={communityFilter}
          onValueChange={(v) => setCommunityFilter(v)}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All communities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All communities</SelectItem>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name.length > 22 ? c.name.slice(0, 22) + "…" : c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length}{" "}
          {displayed.length === 1 ? "route" : "routes"}
        </span>
      </div>

      {/* Table + node detail side panel */}
      <div className="flex gap-4">
        {/* Table */}
        <div className="flex-1 min-w-0 aesthetic-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "bg-muted/50 text-xs font-medium text-muted-foreground",
                        col.sortable &&
                          "cursor-pointer select-none hover:text-foreground transition-colors",
                        col.align === "right" && "text-right"
                      )}
                      onClick={
                        col.sortable ? () => handleSort(col.key) : undefined
                      }
                    >
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          col.align === "right" && "justify-end"
                        )}
                      >
                        {col.label}
                        {col.sortable && sortKey === col.key &&
                          (sortDir === "asc" ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          ))}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="bg-muted/50 text-xs font-medium text-muted-foreground w-24">
                    Community
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-sm text-muted-foreground"
                    >
                      No routes match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayed.map((route) => (
                    <TableRow
                      key={route.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        selectedRoute?.id === route.id
                          ? "bg-primary/5"
                          : "hover:bg-[color:var(--surface-hover)]"
                      )}
                      onClick={() =>
                        setSelectedRoute(
                          selectedRoute?.id === route.id ? null : route
                        )
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Route className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium">
                            {route.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 ml-5.5 font-mono">
                          {route.nodes.length} waypoints
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={route.status} />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatDistance(route.distanceMeters)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {route.estimatedMinutes} min
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastUsed(route.lastUsed)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                        {communityMap[route.communityId]?.split(" ").slice(0, 2).join(" ") ?? route.communityId}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Node sequence panel */}
        {selectedRoute && (
          <div
            className="w-64 shrink-0 aesthetic-card"
            style={{ padding: "var(--card-padding-sm)" }}
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold leading-tight">
                {selectedRoute.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Node sequence — {selectedRoute.nodes.length} waypoints
              </p>
            </div>

            {selectedNodes.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No waypoint data for this route.
              </p>
            ) : (
              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-3.5 top-4 bottom-4 w-px bg-border/60" />
                <div className="space-y-3">
                  {selectedNodes.map((node, idx) => (
                    <div
                      key={`${node.id}-${idx}`}
                      className="flex items-start gap-3 relative"
                    >
                      {/* Node dot */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold z-10",
                          node.type === "gate"
                            ? "bg-primary text-primary-foreground"
                            : node.type === "checkpoint"
                            ? "bg-[color:var(--warning)]/20 text-[color:var(--warning)]"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {NODE_TYPE_ICONS[node.type] ?? "?"}
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="text-xs font-medium leading-tight truncate">
                          {node.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                          {node.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-lg font-bold font-mono">
                  {formatDistance(selectedRoute.distanceMeters)}
                </p>
                <p className="text-[10px] text-muted-foreground">Distance</p>
              </div>
              <div>
                <p className="text-lg font-bold font-mono">
                  {selectedRoute.estimatedMinutes}m
                </p>
                <p className="text-[10px] text-muted-foreground">Est. time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
