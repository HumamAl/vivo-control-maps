"use client";

import type { ReactNode } from "react";
import { ChallengeList } from "./challenge-list";
import { VizCoordinateTransform } from "./viz-coordinate-transform";
import { VizRoutingEngine } from "./viz-routing-engine";
import { VizGpsTradeoff } from "./viz-gps-tradeoff";
import { VizMapArchitecture } from "./viz-map-architecture";
import type { Challenge } from "@/lib/types";

interface ChallengePageContentProps {
  challenges: Challenge[];
}

export function ChallengePageContent({ challenges }: ChallengePageContentProps) {
  const visualizations: Record<string, ReactNode> = {
    "challenge-1": <VizCoordinateTransform />,
    "challenge-2": <VizRoutingEngine />,
    "challenge-3": <VizGpsTradeoff />,
    "challenge-4": <VizMapArchitecture />,
  };

  return <ChallengeList challenges={challenges} visualizations={visualizations} />;
}
