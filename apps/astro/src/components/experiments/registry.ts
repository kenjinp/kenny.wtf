import { lazy } from "react";

export const experimentLazyComponents = {
  "human-geography": lazy(() => import("./HumanGeography")),
  "ccnyc-poster-may-26": lazy(() => import("./CcnycPosterMay26")),
} as const;

export type ExperimentComponentKey = keyof typeof experimentLazyComponents;
