// App configuration — single source of truth for all identity/attribution text.
// Layout Builder populates these values from the Job Analyst brief.

// Aesthetic profiles correspond to [data-theme] blocks in globals.css.
// The Job Analyst selects the aesthetic based on industry + client tone.
// See references/design-diversity.md for the full industry-to-aesthetic routing map.
export type AestheticProfile =
  | "linear"               // Snappy, border-first, dev-tool feel (DEFAULT)
  | "bold-editorial"       // Type-as-design, dramatic whitespace, sharp edges
  | "warm-organic"         // Rounded, earth tones, soft shadows, breathing room
  | "corporate-enterprise" // Dense, structured, authoritative, max information
  | "dark-premium"         // Dark canvas, controlled accent glow, exclusive
  | "swiss-typographic"    // Grid-precise, zero ornament, type-driven
  | "glassmorphism"        // Frosted panels floating over colorful backgrounds
  | "neobrutalism"         // Thick borders, offset hard shadows, raw energy
  | "nature-wellness"      // Green, calm, generous space, anti-anxiety pacing
  | "data-dense"           // Compact, monospace metrics, max information
  | "saas-modern"          // Friendly gradients, approachable, conversion-focused
  | "e-commerce"           // Product-first, conversion-optimized
  | "brand-forward"        // Personality-driven, expressive, soft neo-brutalism
  | "retrofuturism";       // Chrome, neon, dark canvas, high-energy iridescent

// Demo format determines the Tab 1 layout architecture.
// The Job Analyst selects the format based on job type signals.
// See references/demo-format-patterns.md for the full routing table.
export type DemoFormat =
  | "dashboard-app"              // Sidebar + dashboard + feature pages (DEFAULT)
  | "mobile-app-preview"         // Phone frame with screen navigation
  | "landing-page"               // Full-width scrollable sections
  | "multi-screen-walkthrough"   // Browser frame with screen tabs
  | "split-panel-demo"           // Side-by-side panels
  | "admin-console"              // Dense full-width, minimal chrome
  ;

// Device model for frame rendering (only used with mobile-app-preview, multi-screen-walkthrough)
export type DeviceModel =
  | "iphone-15-pro"
  | "pixel-8"
  | "ipad-pro"
  | "generic-phone"
  | "chrome-browser"
  | "safari-browser"
  ;

export const APP_CONFIG = {
  appName: "Vivo Control",
  projectName: "Vivo Control Maps",
  clientName: null as string | null,
  domain: "spatial-mapping",
  aesthetic: "dark-premium" as AestheticProfile,
  demoFormat: "dashboard-app" as DemoFormat,
  deviceModel: undefined as DeviceModel | undefined,
  screenCount: undefined as number | undefined,
} as const;
