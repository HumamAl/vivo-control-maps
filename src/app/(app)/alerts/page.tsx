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
import { securityAlerts, communities, gpsDevices } from "@/data/mock-data";
import type { AlertSeverity, AlertStatus, SecurityAlert } from "@/lib/types";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  MapPin,
  Clock,
  X,
} from "lucide-react";

type AlertType = SecurityAlert["type"];
type SortKey = keyof Pick<SecurityAlert, "severity" | "status" | "timestamp" | "type">;

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const config: Record<AlertSeverity, { label: string; cls: string; Icon: React.ElementType }> = {
    critical: {
      label: "Critical",
      cls: "text-destructive bg-destructive/10",
      Icon: AlertCircle,
    },
    warning: {
      label: "Warning",
      cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
      Icon: AlertTriangle,
    },
    info: {
      label: "Info",
      cls: "text-[color:var(--chart-3)] bg-[color:var(--chart-3)]/10",
      Icon: Info,
    },
  };
  const c = config[severity];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium border-0 rounded-full gap-1", c.cls)}
    >
      <c.Icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AlertStatus }) {
  const config: Record<AlertStatus, { label: string; cls: string }> = {
    active: { label: "Active", cls: "text-destructive bg-destructive/10" },
    acknowledged: {
      label: "Acknowledged",
      cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    },
    resolved: {
      label: "Resolved",
      cls: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    },
  };
  const c = config[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium border-0 rounded-full", c.cls)}
    >
      {c.label}
    </Badge>
  );
}

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  "off-path": "Off-Path Deviation",
  "zone-breach": "Zone Breach",
  "speed-violation": "Speed Violation",
  "signal-loss": "Signal Loss",
  "unauthorized-entry": "Unauthorized Entry",
  "perimeter-alert": "Perimeter Alert",
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatResponseTime(alertIso: string, resolvedIso?: string): string {
  if (!resolvedIso) return "—";
  const start = new Date(alertIso).getTime();
  const end = new Date(resolvedIso).getTime();
  const mins = Math.floor((end - start) / 60000);
  const secs = Math.floor(((end - start) % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

const communityMap = Object.fromEntries(
  communities.map((c) => [c.id, c.name])
);
const deviceMap = Object.fromEntries(
  gpsDevices.map((d) => [d.id, d.label])
);

export default function AlertsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
  const [communityFilter, setCommunityFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayed = useMemo(() => {
    return securityAlerts
      .filter((a) => {
        const matchesSeverity =
          severityFilter === "all" || a.severity === severityFilter;
        const matchesStatus =
          statusFilter === "all" || a.status === statusFilter;
        const matchesType = typeFilter === "all" || a.type === typeFilter;
        const matchesCommunity =
          communityFilter === "all" || a.communityId === communityFilter;
        const matchesSearch =
          search === "" ||
          a.description.toLowerCase().includes(search.toLowerCase()) ||
          a.id.toLowerCase().includes(search.toLowerCase()) ||
          ALERT_TYPE_LABELS[a.type]
            .toLowerCase()
            .includes(search.toLowerCase());
        return (
          matchesSeverity &&
          matchesStatus &&
          matchesType &&
          matchesCommunity &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    search,
    severityFilter,
    statusFilter,
    typeFilter,
    communityFilter,
    sortKey,
    sortDir,
  ]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const totalAlerts = securityAlerts.length;
  const activeAlerts = securityAlerts.filter((a) => a.status === "active").length;
  const resolvedAlerts = securityAlerts.filter((a) => a.status === "resolved").length;

  // Average response time for resolved alerts (in minutes)
  const resolvedWithTime = securityAlerts.filter(
    (a) => a.status === "resolved" && a.resolvedAt
  );
  const avgResponseMin =
    resolvedWithTime.length > 0
      ? Math.round(
          resolvedWithTime.reduce((sum, a) => {
            const diff =
              (new Date(a.resolvedAt!).getTime() -
                new Date(a.timestamp).getTime()) /
              60000;
            return sum + diff;
          }, 0) / resolvedWithTime.length
        )
      : 0;

  const alertTypes = Array.from(
    new Set(securityAlerts.map((a) => a.type))
  ) as AlertType[];

  const sortableColumns: Array<{ key: SortKey; label: string }> = [
    { key: "severity", label: "Severity" },
    { key: "type", label: "Alert Type" },
    { key: "status", label: "Status" },
    { key: "timestamp", label: "Timestamp" },
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
            Security Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zone breaches, route deviations, signal anomalies, and perimeter
            events across all communities
          </p>
        </div>
        {activeAlerts > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
            </span>
            <span className="text-sm font-medium text-destructive">
              {activeAlerts} active{" "}
              {activeAlerts === 1 ? "alert" : "alerts"}
            </span>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            Icon: ShieldAlert,
            label: "Total Alerts",
            value: totalAlerts,
            cls: "text-foreground",
            iconCls: "text-primary",
            bg: "bg-primary/5",
          },
          {
            Icon: AlertCircle,
            label: "Active",
            value: activeAlerts,
            cls: "text-destructive",
            iconCls: "text-destructive",
            bg: "bg-destructive/5",
          },
          {
            Icon: ShieldCheck,
            label: "Resolved",
            value: resolvedAlerts,
            cls: "text-[color:var(--success)]",
            iconCls: "text-[color:var(--success)]",
            bg: "bg-[color:var(--success)]/5",
          },
          {
            Icon: Clock,
            label: "Avg Response",
            value: `${avgResponseMin}m`,
            cls: "text-foreground",
            iconCls: "text-[color:var(--chart-4)]",
            bg: "bg-[color:var(--chart-4)]/5",
          },
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
              <s.Icon className={cn("w-4 h-4", s.iconCls)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                {s.label}
              </p>
              <p className={cn("text-lg font-bold font-mono mt-0.5", s.cls)}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select
          value={severityFilter}
          onValueChange={(v) =>
            setSeverityFilter(v as AlertSeverity | "all")
          }
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AlertStatus | "all")}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as AlertType | "all")}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Alert type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {alertTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {ALERT_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={communityFilter}
          onValueChange={(v) => setCommunityFilter(v)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Community" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All communities</SelectItem>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length} {displayed.length === 1 ? "alert" : "alerts"}
        </span>
      </div>

      {/* Table */}
      <div className="aesthetic-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {sortableColumns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="bg-muted/50 text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="bg-muted/50 text-xs font-medium text-muted-foreground">
                  Device
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-medium text-muted-foreground">
                  Community
                </TableHead>
                <TableHead className="bg-muted/50 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No security alerts match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((alert) => (
                  <>
                    <TableRow
                      key={alert.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        expandedId === alert.id
                          ? "bg-[color:var(--surface-hover)]"
                          : "hover:bg-[color:var(--surface-hover)]",
                        alert.severity === "critical" &&
                          alert.status === "active" &&
                          "border-l-2 border-l-destructive"
                      )}
                      onClick={() =>
                        setExpandedId(
                          expandedId === alert.id ? null : alert.id
                        )
                      }
                    >
                      <TableCell>
                        <SeverityBadge severity={alert.severity} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {ALERT_TYPE_LABELS[alert.type]}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={alert.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                        {formatTimestamp(alert.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                        {deviceMap[alert.deviceId] ?? alert.deviceId}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                        {communityMap[alert.communityId]
                          ?.split(" ")
                          .slice(0, 2)
                          .join(" ") ?? alert.communityId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end">
                          {expandedId === alert.id ? (
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded row */}
                    {expandedId === alert.id && (
                      <TableRow key={`${alert.id}-detail`}>
                        <TableCell
                          colSpan={7}
                          className="bg-muted/30 px-6 py-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="sm:col-span-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                                Incident Description
                              </p>
                              <p className="text-sm leading-relaxed">
                                {alert.description}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                  Location
                                </p>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-mono">
                                    ({alert.location.x}, {alert.location.y})
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                  Response Time
                                </p>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="font-mono">
                                    {formatResponseTime(
                                      alert.timestamp,
                                      alert.resolvedAt
                                    )}
                                  </span>
                                </div>
                              </div>
                              {alert.resolvedAt && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                    Resolved At
                                  </p>
                                  <p className="text-xs font-mono">
                                    {formatTimestamp(alert.resolvedAt)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
