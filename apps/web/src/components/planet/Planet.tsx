import { Planet as HelloPlanet } from '@hello-worlds/react';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import { Vector3 } from 'three';
import PlanetWorker from './Planet.worker?worker';
const worker = () => new PlanetWorker();

const radius = 5_000;
const position = new Vector3(0, 0, 0);

export const Planet = () => {
  const camera = useThree((store) => store.camera);
  const initialData = useMemo(
    () => ({
      seed: 'hello world'
    }),
    []
  );

  return (
    <HelloPlanet
      position={position}
      radius={radius}
      minCellSize={32 * 8}
      minCellResolution={32 * 2}
      lodOrigin={camera.position}
      worker={worker}
      data={initialData}
    >
      <meshPhysicalMaterial vertexColors metalness={0} reflectivity={0.01} />
    </HelloPlanet>
  );
};
