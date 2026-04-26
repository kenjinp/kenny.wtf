import { Suspense } from "react";
import {
  experimentLazyComponents,
  type ExperimentComponentKey,
} from "./registry";

function isKey(name: string): name is ExperimentComponentKey {
  return name in experimentLazyComponents;
}

export interface Props {
  name: string;
}

export default function ExperimentRoot({ name }: Props) {
  if (!isKey(name)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-900 p-4 text-white">
        Unknown experiment: {name}
      </div>
    );
  }

  const Cmp = experimentLazyComponents[name];

  return (
    <div className="h-full w-full">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-slate-400">
            Loading…
          </div>
        }
      >
        <Cmp />
      </Suspense>
    </div>
  );
}
