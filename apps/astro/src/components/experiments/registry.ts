import { lazy } from "react";

export const experimentLazyComponents = {
  "human-geography": lazy(() => import("./HumanGeography")),
} as const;

export type ExperimentComponentKey = keyof typeof experimentLazyComponents;
