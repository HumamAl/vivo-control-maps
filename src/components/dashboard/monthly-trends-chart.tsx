"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { MonthlyMetric } from "@/lib/types";

// Custom tooltip using recharts 3.x TooltipContentProps (payload is readonly any[])
function renderTooltip(props: TooltipContentProps<ValueType, NameType>) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border text-sm shadow-lg"
      style={{
        background: "var(--card)",
        borderColor: "color-mix(in oklch, var(--border), transparent 20%)",
        padding: "0.75rem 1rem",
        minWidth: "180px",
      }}
    >
      <p
        className="font-medium mb-2"
        style={{ color: "var(--foreground)", fontSize: "0.75rem" }}
      >
        {String(label ?? "")}
      </p>
      {[...payload].map((entry, i) => (
        <p
          key={i}
          className="flex items-center gap-2 mb-1"
          style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: String(entry.color ?? "var(--primary)") }}
          />
          <span style={{ color: "var(--foreground)" }}>{String(entry.name ?? "")}</span>
          <span
            className="font-mono font-semibold ml-auto"
            style={{ color: String(entry.color ?? "var(--primary)") }}
          >
            {String(entry.value ?? "")}
          </span>
        </p>
      ))}
    </div>
  );
}

interface MonthlyTrendsChartProps {
  data: MonthlyMetric[];
  view: "security" | "coverage";
}

export function MonthlyTrendsChart({ data, view }: MonthlyTrendsChartProps) {
  if (view === "coverage") {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fillRoutes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillCoverage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.4}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: string) => v.split(" ")[0]}
          />
          <YAxis
            yAxisId="routes"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            domain={[250, 450]}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
            domain={[80, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={renderTooltip} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "var(--muted-foreground)" }}
          />
          <Area
            yAxisId="routes"
            type="monotone"
            dataKey="routesCompleted"
            name="Routes Completed"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#fillRoutes)"
            dot={false}
          />
          <Area
            yAxisId="pct"
            type="monotone"
            dataKey="coveragePercent"
            name="Coverage %"
            stroke="var(--chart-4)"
            strokeWidth={2}
            fill="url(#fillCoverage)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // security view
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="fillAlerts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillResponse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          strokeOpacity={0.4}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: string) => v.split(" ")[0]}
        />
        <YAxis
          yAxisId="alerts"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="response"
          orientation="right"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `${v}m`}
          domain={[2, 7]}
        />
        <Tooltip content={renderTooltip} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "var(--muted-foreground)" }}
        />
        <Area
          yAxisId="alerts"
          type="monotone"
          dataKey="alerts"
          name="Security Alerts"
          stroke="var(--destructive)"
          strokeWidth={2}
          fill="url(#fillAlerts)"
          dot={false}
        />
        <Area
          yAxisId="response"
          type="monotone"
          dataKey="avgResponseTime"
          name="Avg Response (min)"
          stroke="var(--chart-2)"
          strokeWidth={2}
          fill="url(#fillResponse)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
