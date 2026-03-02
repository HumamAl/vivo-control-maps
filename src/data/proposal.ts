// Proposal data — Vivo Control Maps
// GPS routing and security mapping engine for private gated communities
// Aesthetic: dark-premium | Domain: spatial-mapping / security

export const proposalData = {
  hero: {
    name: "Humam",
    valueProp:
      "Full-stack developer who builds spatial tools that actually work — from custom SVG maps to real-time GPS tracking pipelines. I've already built a working version for your review in Tab 1.",
    badge: "Built this demo for your project",
    stats: [
      { value: "24+", label: "Projects Shipped" },
      { value: "< 48hr", label: "Demo Turnaround" },
      { value: "15+", label: "Industries" },
    ],
  },

  portfolioProjects: [
    {
      name: "Fleet Maintenance SaaS",
      description:
        "Fleet and maintenance management platform with asset tracking, work orders, preventive maintenance scheduling, inspections, parts inventory, and analytics dashboard.",
      outcome:
        "6-module SaaS covering the full maintenance lifecycle — from asset registry to work orders to parts inventory",
      tech: ["Next.js", "TypeScript", "Recharts", "shadcn/ui"],
      url: null, // no URL in developer-profile.md
      relevance:
        "Closest match for asset tracking and spatial operations management — same multi-module complexity as your mapping engine.",
    },
    {
      name: "Sienna Charles — Vendor Admin",
      description:
        "Luxury vendor management platform with vendor directory, map-based discovery, AI-powered search, and booking management with spend analytics.",
      outcome:
        "Vendor discovery and booking platform with map view, category filters, and spend tracking per booking",
      tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
      url: "https://sienna-vendor-admin.vercel.app",
      relevance:
        "Interactive map view built entirely on the frontend — same coordinate-to-render pipeline your gated community maps require.",
    },
    {
      name: "ConstructionIQ",
      description:
        "Construction project intelligence platform with real-time project tracking, permit monitoring, supplier matching, and regional analytics across multiple markets.",
      outcome:
        "Multi-region project intelligence dashboard tracking pipeline, permits, and supplier matches across 8 markets",
      tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
      url: "https://construction-intel-ivory.vercel.app",
      relevance:
        "Multi-region real-time tracking — the same 'many locations, one dashboard' architecture your multi-community setup needs.",
    },
    {
      name: "Data Intelligence Platform",
      description:
        "Data analytics and intelligence dashboard with multi-source data aggregation, visualization, and insight generation.",
      outcome:
        "Unified analytics dashboard pulling data from multiple sources with interactive charts and filterable insights",
      tech: ["Next.js", "TypeScript", "Tailwind", "shadcn/ui", "Recharts"],
      url: "https://data-intelligence-platform-sandy.vercel.app",
      relevance:
        "Real-time data aggregation at scale — the same pattern your GPS polling and alert pipeline requires.",
    },
  ],

  approach: [
    {
      step: "01",
      title: "Map the Architecture",
      description:
        "Start by mapping the GPS-to-render pipeline, coordinate systems, community data structure, and alert routing before writing a line of code. One wrong assumption here cascades everywhere.",
      timeline: "Day 1–2",
    },
    {
      step: "02",
      title: "Build the Foundation",
      description:
        "Coordinate transformation layer and routing graph come first. The visual layer only works if the spatial math is right. No shortcuts at this stage.",
      timeline: "Day 3–7",
    },
    {
      step: "03",
      title: "Ship Incrementally",
      description:
        "One community working end-to-end before scaling to many. Prove the GPS polling → map render → alert pipeline on a single dataset, then generalize.",
      timeline: "Week 2",
    },
    {
      step: "04",
      title: "Harden & Scale",
      description:
        "GPS accuracy filtering, off-path detection tuning, performance optimization for real-world conditions — sub-second updates at the data volumes your deployments produce.",
      timeline: "Week 3–4",
    },
  ],

  skills: [
    {
      category: "Frontend",
      items: [
        "TypeScript",
        "React",
        "Next.js",
        "SVG Rendering",
        "Canvas API",
        "Tailwind CSS",
        "Recharts",
      ],
    },
    {
      category: "Spatial / Mapping",
      items: [
        "GeoJSON",
        "Coordinate Transformations",
        "Custom Map Rendering",
        "Graph-Based Routing",
      ],
    },
    {
      category: "Backend & Real-Time",
      items: [
        "Node.js",
        "WebSockets",
        "SSE",
        "REST APIs",
        "Rails Integration",
        "GPS Polling Optimization",
      ],
    },
    {
      category: "DevOps",
      items: ["Vercel", "GitHub Actions"],
    },
  ],

  cta: {
    headline: "Ready to turn your GPS coordinates into a routing engine your communities can trust.",
    body: "The demo in Tab 1 already shows the map render, patrol tracking, and alert layer. The production version starts from there — your data, your communities, your pipeline.",
    action: "Reply on Upwork to start",
    availability: "Currently available for new projects",
  },
};
