"use client";

import type { ReactNode } from "react";
import { ChallengeCard } from "./challenge-card";
import type { Challenge } from "@/lib/types";

interface ChallengeListProps {
  challenges: Challenge[];
  visualizations?: Record<string, ReactNode>;
}

export function ChallengeList({
  challenges,
  visualizations = {},
}: ChallengeListProps) {
  return (
    <div className="flex flex-col gap-5">
      {challenges.map((challenge, index) => (
        <ChallengeCard
          key={challenge.id}
          id={challenge.id}
          title={challenge.title}
          description={challenge.description}
          outcome={challenge.outcome}
          index={index}
          visualization={visualizations[challenge.id]}
        />
      ))}
    </div>
  );
}
