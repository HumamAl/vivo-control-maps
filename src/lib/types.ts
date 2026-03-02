import type { LucideIcon } from "lucide-react";

// Sidebar navigation
export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Challenge visualization types
export type VisualizationType =
  | "flow"
  | "before-after"
  | "metrics"
  | "architecture"
  | "risk-matrix"
  | "timeline"
  | "dual-kpi"
  | "tech-stack"
  | "decision-flow";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  visualizationType: VisualizationType;
  outcome?: string;
}

// Proposal types
export interface Profile {
  name: string;
  tagline: string;
  bio: string;
  approach: { title: string; description: string }[];
  skillCategories: { name: string; skills: string[] }[];
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  relevance?: string;
  outcome?: string;
  liveUrl?: string;
}

// Screen definition for frame-based demo formats
export interface DemoScreen {
  id: string;
  label: string;
  icon?: LucideIcon;
  href: string;
}

// Conversion element variant types
export type ConversionVariant = "sidebar" | "inline" | "floating" | "banner";

// ── Domain Types ─────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved";
export type PatrolStatus = "on-route" | "off-route" | "idle" | "responding";
export type ZoneType = "residential" | "commercial" | "recreational" | "restricted" | "entry-gate";
export type RouteStatus = "active" | "inactive" | "maintenance";

export interface Community {
  id: string;
  name: string;
  totalProperties: number;
  totalZones: number;
  activeRoutes: number;
  gpsDevices: number;
  coveragePercent: number;
  lastUpdated: string;
}

export interface MapZone {
  id: string;
  communityId: string;
  name: string;
  type: ZoneType;
  coordinates: { x: number; y: number }[];
  properties: number;
  color: string;
}

export interface RouteNode {
  id: string;
  communityId: string;
  x: number;
  y: number;
  label: string;
  type: "gate" | "intersection" | "waypoint" | "checkpoint" | "poi";
}

export interface RoutePath {
  id: string;
  communityId: string;
  name: string;
  status: RouteStatus;
  nodes: string[]; // RouteNode IDs
  distanceMeters: number;
  estimatedMinutes: number;
  lastUsed: string;
}

export interface GPSReading {
  id: string;
  deviceId: string;
  communityId: string;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  accuracy: number; // meters
  heading: number; // degrees
  speed: number; // km/h
  timestamp: string;
  onRoute: boolean;
}

export interface SecurityAlert {
  id: string;
  communityId: string;
  type: "off-path" | "zone-breach" | "speed-violation" | "signal-loss" | "unauthorized-entry" | "perimeter-alert";
  severity: AlertSeverity;
  status: AlertStatus;
  deviceId: string;
  description: string;
  location: { x: number; y: number };
  timestamp: string;
  resolvedAt?: string;
}

export interface PatrolUnit {
  id: string;
  communityId: string;
  name: string;
  status: PatrolStatus;
  currentRoute: string;
  position: { x: number; y: number };
  lastCheckIn: string;
  coveragePercent: number;
}

export interface GPSDevice {
  id: string;
  communityId: string;
  label: string;
  type: "patrol" | "contractor" | "delivery" | "resident";
  status: "online" | "offline" | "low-signal";
  batteryPercent: number;
  lastSeen: string;
  accuracy: number;
}

export interface MonthlyMetric {
  month: string;
  alerts: number;
  routesCompleted: number;
  avgResponseTime: number;
  gpsAccuracy: number;
  coveragePercent: number;
}
