import { getGPUTier, TierResult } from 'detect-gpu';
import React from 'react';

export function useDetectGPU() {
  const [gpuStats, setGPUStats] = React.useState<TierResult | null>(null);
  React.useEffect(() => {
    const getGPUStats = async () => {
      setGPUStats(await getGPUTier());
    };
    getGPUStats();
  }, []);

  return gpuStats;
}
