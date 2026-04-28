import { relation } from "koota";

/** Source node has a directed wire to the target neighbor. */
export const WireTo = relation();

/** Undirected road link along the Voronoi neighbor graph (both ends add). */
export const Road = relation();

/** Directed: source → target is downstream along the river spine. */
export const RiverDownstream = relation();
