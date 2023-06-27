import {
  ChunkGenerator3Initializer,
  ColorGeneratorInitializer,
  createThreadedPlanetWorker,
  Lerp,
  LinearSpline,
  Noise,
  NOISE_TYPES,
  remap
} from '@hello-worlds/planets';
import { Color } from 'three';
export type ThreadParams = {
  seed: string;
  seaLevel?: number;
};

export const heightGenerator: ChunkGenerator3Initializer<ThreadParams, number> = ({
  data: { seed, type },
  radius
}) => {
  const noise = new Noise({
    seed: 'blip',
    height: 200,
    scale: radius / 10,
    noiseType: NOISE_TYPES.FBM
  });

  return ({ input }) => {
    return noise.getFromVector(input);
  };
};

const oceanColor = new Color(0x33495d);

const colorLerp: Lerp<THREE.Color> = (t: number, p0: THREE.Color, p1: THREE.Color) => {
  const c = p0.clone();
  return c.lerp(p1, t);
};

const colorSpline = new LinearSpline<THREE.Color>(colorLerp);
const white = new Color(0xffffff);

// Temp / Aridity
colorSpline.addPoint(0.0, new Color(0x5fcde4));
colorSpline.addPoint(0.1, new Color(0x99e550));
colorSpline.addPoint(0.05, new Color(0x6abe30));
colorSpline.addPoint(0.4, new Color(0x37946e));
colorSpline.addPoint(0.9, new Color(0x4b692f));
colorSpline.addPoint(1.0, new Color(0xbab3a2));
export const colorGenerator: ColorGeneratorInitializer<ThreadParams> = ({
  radius,
  data: { seaLevel, isMap }
}) => {
  const warp = new Noise({
    octaves: 8,
    seed: 'apple', // <-important
    height: 200.0,
    scale: 1000
  });

  return ({ height, input }) => {
    const warpedHeight = height + warp.getFromVector(input);
    return warpedHeight > 0 ? colorSpline.get(remap(warpedHeight, 0, 200, 0, 1)) : oceanColor;
  };
};

createThreadedPlanetWorker<ThreadParams>({
  heightGenerator,
  colorGenerator
});
