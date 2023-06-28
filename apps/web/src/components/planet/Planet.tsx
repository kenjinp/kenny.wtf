import { Planet as HelloPlanet } from '@hello-worlds/react';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { Mesh, Vector3 } from 'three';
import PlanetWorker from './Planet.worker?worker';
const worker = () => new PlanetWorker();

export const Planet: React.FC<{ radius: number; position: Vector3 }> = ({ radius, position }) => {
  const camera = useThree((store) => store.camera);
  const initialData = useMemo(
    () => ({
      seed: 'hello world'
    }),
    []
  );
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (!ref.current) {
      return;
    }
    ref.current.rotateY(0.002);
  });

  const concurrency = navigator.hardwareConcurrency;

  return (
    <mesh ref={ref}>
      <HelloPlanet
        position={position}
        radius={radius}
        minCellSize={(32 * concurrency) / 2}
        minCellResolution={32 * Math.floor(concurrency * 0.75)}
        lodOrigin={camera.position}
        worker={worker}
        data={initialData}
      >
        <meshPhysicalMaterial vertexColors metalness={0} reflectivity={0.01} />
      </HelloPlanet>
    </mesh>
  );
};
