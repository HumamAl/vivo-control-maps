# Screening Answers — Vivo Control Maps

---

## Q1: Relevant projects involving custom maps, routing, or spatial UI

Built a working GPS routing and security mapping demo for your project specifically: {VERCEL_URL} — covers custom SVG map rendering over GeoJSON, Dijkstra path calculation across a node-edge community graph, and real-time vehicle position updates via WebSocket simulation. Fleet Maintenance SaaS (500+ asset tracking) and Sienna Charles (map-based vendor discovery) are the closest portfolio matches for spatial UI and asset tracking patterns.

---

## Q2: How would you build a reusable GPS routing system without Google Maps?

GeoJSON FeatureCollections define community geometry; a coordinate transformation layer converts GPS lat/lng to SVG viewport coordinates. The routing engine builds a weighted node-edge graph from community paths, runs Dijkstra (or A* for heuristic speed) to resolve shortest access routes, and exposes results as a typed API. Position updates stream via WebSocket or SSE — the Rails backend pushes events, the frontend reconciles moving markers against the static SVG map without re-rendering the geometry. Built this approach into the demo: {VERCEL_URL}
