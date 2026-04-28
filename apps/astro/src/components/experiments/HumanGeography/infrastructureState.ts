/** Populated during Voronoi spawn for visualization (React reads synchronously after layout). */
export let lastRoadSpine: number[] = [];
export let lastRiverSpine: number[] = [];

export function setInfrastructureSpines(road: number[], river: number[]): void {
  lastRoadSpine = road;
  lastRiverSpine = river;
}
