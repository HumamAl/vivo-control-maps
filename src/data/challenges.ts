import type { Challenge } from "@/lib/types";

export interface ExecutiveSummaryData {
  commonApproach: string;
  differentApproach: string;
  accentWord?: string;
}

export const executiveSummary: ExecutiveSummaryData = {
  commonApproach:
    "Most developers reach for Google Maps or Mapbox when they hear 'GPS tracking' — they embed a third-party tile layer, drop markers, and call it done. That works for public streets, but breaks immediately when the map is a private community with custom SVG geometry, proprietary zone schemas, and patrol routes that don't exist on any public map tile.",
  differentApproach:
    "I'd build a self-contained spatial engine: coordinate transformation from raw GPS lat/lng to SVG map space, a graph-based Dijkstra router over community-specific node paths, Kalman-filtered real-time tracking with geofence deviation detection, and a layered map architecture that hot-swaps patrol, delivery, and emergency overlays without re-rendering the base community SVG.",
  accentWord: "self-contained spatial engine",
};

export const challenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "GPS-to-SVG Coordinate Transformation",
    description:
      "Raw GPS lat/lng coordinates must map accurately onto a custom SVG canvas that represents each gated community. Every community has a different orientation, scale, and bounding box — there is no universal projection formula you can borrow from Google Maps.",
    visualizationType: "architecture",
    outcome:
      "Could achieve sub-3-meter positional accuracy across community maps of varying scale and orientation by computing per-community affine transform matrices from known anchor points.",
  },
  {
    id: "challenge-2",
    title: "Graph-Based Routing Without Google Maps",
    description:
      "Patrol routes, contractor access paths, and emergency corridors don't exist in any public map dataset. The routing engine must run entirely on a custom node-path graph that encodes one-way constraints, restricted zones, and time-based gate access rules.",
    visualizationType: "flow",
    outcome:
      "Could enable sub-second route calculation for communities with 500+ nodes by running Dijkstra/A* over a pre-computed adjacency list, with incremental graph updates when access rules change.",
  },
  {
    id: "challenge-3",
    title: "Real-Time GPS Tracking and Off-Path Detection",
    description:
      "Consumer GPS devices inside walled communities report noisy readings — multipath interference from walls, variable polling intervals, and battery-saving firmware introduce positional drift. The system must distinguish genuine route deviations from GPS noise without flooding security staff with false alerts.",
    visualizationType: "dual-kpi",
    outcome:
      "Could reduce false off-path alerts by 60–70% through accuracy-weighted geofence buffers and a Kalman filter that smooths positional variance before evaluating route adherence.",
  },
  {
    id: "challenge-4",
    title: "Multi-Community Map Architecture",
    description:
      "A single platform must serve dozens of gated communities, each with its own SVG layout, zone schema, gate configuration, and access rule set. The map rendering system must load community configs at runtime, hot-swap map layers without full re-renders, and stay maintainable as new communities onboard.",
    visualizationType: "architecture",
    outcome:
      "Could cut new community onboarding from weeks to 1–2 days by standardizing on a GeoJSON-compatible community config schema with a component-based SVG layer system.",
  },
];
