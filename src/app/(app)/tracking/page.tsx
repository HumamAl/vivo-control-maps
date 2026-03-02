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
import { gpsDevices, communities } from "@/data/mock-data";
import type { GPSDevice } from "@/lib/types";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Battery,
  BatteryLow,
  BatteryWarning,
  Signal,
  SignalLow,
  SignalZero,
  RefreshCw,
} from "lucide-react";

type DeviceStatus = GPSDevice["status"];
type DeviceType = GPSDevice["type"];
type SortKey = keyof Pick<
  GPSDevice,
  "label" | "status" | "batteryPercent" | "accuracy" | "lastSeen" | "type"
>;

function StatusDot({ status }: { status: DeviceStatus }) {
  return (
    <span
      className={cn(
        "relative inline-flex w-2.5 h-2.5 rounded-full shrink-0",
        status === "online"
          ? "bg-[color:var(--success)]"
          : status === "low-signal"
          ? "bg-[color:var(--warning)]"
          : "bg-destructive"
      )}
    >
      {status === "online" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--success)] opacity-50" />
      )}
    </span>
  );
}

function StatusBadge({ status }: { status: DeviceStatus }) {
  const config: Record<DeviceStatus, { label: string; cls: string }> = {
    online: {
      label: "Online",
      cls: "text-[color:var(--success)] bg-[color:var(--success)]/10",
    },
    "low-signal": {
      label: "Low Signal",
      cls: "text-[color:var(--warning)] bg-[color:var(--warning)]/10",
    },
    offline: {
      label: "Offline",
      cls: "text-destructive bg-destructive/10",
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

function DeviceTypeBadge({ type }: { type: DeviceType }) {
  const config: Record<DeviceType, { label: string; cls: string }> = {
    patrol: {
      label: "Patrol",
      cls: "text-[color:var(--chart-1)] bg-[color:var(--chart-1)]/10",
    },
    contractor: {
      label: "Contractor",
      cls: "text-[color:var(--chart-3)] bg-[color:var(--chart-3)]/10",
    },
    delivery: {
      label: "Delivery",
      cls: "text-[color:var(--chart-4)] bg-[color:var(--chart-4)]/10",
    },
    resident: {
      label: "Resident",
      cls: "text-[color:var(--chart-2)] bg-[color:var(--chart-2)]/10",
    },
  };
  const c = config[type];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium border-0 rounded-full", c.cls)}
    >
      {c.label}
    </Badge>
  );
}

function BatteryBar({ pct }: { pct: number }) {
  const color =
    pct >= 60
      ? "bg-[color:var(--success)]"
      : pct >= 25
      ? "bg-[color:var(--warning)]"
      : "bg-destructive";
  const Icon = pct >= 60 ? Battery : pct >= 25 ? BatteryLow : BatteryWarning;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1 w-14 justify-end">
        <Icon
          className={cn(
            "w-3 h-3 shrink-0",
            pct >= 60
              ? "text-[color:var(--success)]"
              : pct >= 25
              ? "text-[color:var(--warning)]"
              : "text-destructive"
          )}
        />
        <span className="text-xs font-mono">{pct}%</span>
      </div>
    </div>
  );
}

function AccuracyDisplay({ meters }: { meters: number }) {
  const Icon = meters <= 3 ? Signal : meters <= 5 ? SignalLow : SignalZero;
  const cls =
    meters <= 3
      ? "text-[color:var(--success)]"
      : meters <= 5
      ? "text-[color:var(--warning)]"
      : "text-destructive";
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn("w-3.5 h-3.5", cls)} />
      <span className="font-mono text-sm">±{meters}m</span>
    </div>
  );
}

function formatLastSeen(iso: string): string {
  const d = new Date(iso);
  const now = new Date("2026-03-01T15:00:00Z");
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM}m ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h ${diffM % 60}m ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

const communityMap = Object.fromEntries(
  communities.map((c) => [c.id, c.name])
);

export default function TrackingPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeviceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">(
    "all"
  );
  const [sortKey, setSortKey] = useState<SortKey>("lastSeen");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const displayed = useMemo(() => {
    return gpsDevices
      .filter((d) => {
        const matchesType =
          typeFilter === "all" || d.type === typeFilter;
        const matchesStatus =
          statusFilter === "all" || d.status === statusFilter;
        const matchesSearch =
          search === "" ||
          d.label.toLowerCase().includes(search.toLowerCase()) ||
          d.id.toLowerCase().includes(search.toLowerCase()) ||
          d.type.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, typeFilter, statusFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const columns: Array<{
    key: SortKey;
    label: string;
    sortable: boolean;
  }> = [
    { key: "label", label: "Device", sortable: true },
    { key: "type", label: "Type", sortable: true },
    { key: "status", label: "Signal Status", sortable: true },
    { key: "batteryPercent", label: "Battery", sortable: true },
    { key: "accuracy", label: "GPS Accuracy", sortable: true },
    { key: "lastSeen", label: "Last Ping", sortable: true },
  ];

  const onlineCount = gpsDevices.filter((d) => d.status === "online").length;
  const lowSignalCount = gpsDevices.filter((d) => d.status === "low-signal").length;
  const offlineCount = gpsDevices.filter((d) => d.status === "offline").length;
  const avgBattery = Math.round(
    gpsDevices.reduce((s, d) => s + d.batteryPercent, 0) / gpsDevices.length
  );

  return (
    <div
      className="space-y-6"
      style={{ padding: "var(--content-padding)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GPS Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live device status, battery levels, and signal accuracy across all
            communities
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium border border-border/60 text-muted-foreground hover:bg-[color:var(--surface-hover)] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Online",
            value: onlineCount,
            cls: "text-[color:var(--success)]",
            dotCls: "bg-[color:var(--success)]",
          },
          {
            label: "Low Signal",
            value: lowSignalCount,
            cls: "text-[color:var(--warning)]",
            dotCls: "bg-[color:var(--warning)]",
          },
          {
            label: "Offline",
            value: offlineCount,
            cls: "text-destructive",
            dotCls: "bg-destructive",
          },
          {
            label: "Avg Battery",
            value: `${avgBattery}%`,
            cls: "text-foreground",
            dotCls: "bg-primary",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="aesthetic-card flex items-center gap-3"
            style={{ padding: "var(--card-padding-sm)" }}
          >
            <span
              className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dotCls)}
            />
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                {s.label}
              </p>
              <p className={cn("text-xl font-bold font-mono mt-0.5", s.cls)}>
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
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as DeviceType | "all")}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="patrol">Patrol</SelectItem>
            <SelectItem value="contractor">Contractor</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="resident">Resident</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as DeviceStatus | "all")}
        >
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="low-signal">Low Signal</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground shrink-0">
          {displayed.length}{" "}
          {displayed.length === 1 ? "device" : "devices"}
        </span>
      </div>

      {/* Table */}
      <div className="aesthetic-card p-0 overflow-hidden">
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
                        "cursor-pointer select-none hover:text-foreground transition-colors"
                    )}
                    onClick={
                      col.sortable ? () => handleSort(col.key) : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
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
                <TableHead className="bg-muted/50 text-xs font-medium text-muted-foreground">
                  Community
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No devices match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((device) => (
                  <TableRow
                    key={device.id}
                    className="hover:bg-[color:var(--surface-hover)] transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusDot status={device.status} />
                        <div>
                          <p className="text-sm font-medium">{device.label}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {device.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DeviceTypeBadge type={device.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={device.status} />
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <BatteryBar pct={device.batteryPercent} />
                    </TableCell>
                    <TableCell>
                      {device.status === "offline" ? (
                        <span className="text-xs text-muted-foreground italic">
                          No signal
                        </span>
                      ) : (
                        <AccuracyDisplay meters={device.accuracy} />
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {formatLastSeen(device.lastSeen)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {communityMap[device.communityId]
                        ?.split(" ")
                        .slice(0, 2)
                        .join(" ") ?? device.communityId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
