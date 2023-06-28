import { ParticleField } from '@components/vfx/particle-field/ParticleField';
import { useDarkMode } from '@hooks/useDarkMode';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Noise } from '@react-three/postprocessing';
import { PropsWithChildren } from 'react';
import { Vector3 } from 'three';

const AU = 100_000;

export const LightRig: React.FC = () => {
  return (
    <>
      <mesh position={new Vector3(-1, 0.75, 1).multiplyScalar(AU / 20)}>
        <directionalLight color={0xffffff} intensity={0.8} castShadow />
        <meshStandardMaterial color={0xfdfbd3} emissive={0xfdfbd3} emissiveIntensity={40.0} />
      </mesh>
    </>
  );
};

const small = new Vector3(0, 10_000, 10_000);

export const Scene: React.FC<
  PropsWithChildren<{
    effects?: React.ReactElement[];
  }>
> = ({ children, effects = [] }) => {
  const prefersDarkMode = useDarkMode();
  return (
    <Canvas
      id="game-canvas"
      gl={{ logarithmicDepthBuffer: true }}
      camera={{
        near: 0.01,
        far: Number.MAX_SAFE_INTEGER,
        position: small
      }}
      shadows
      style={{ position: 'fixed', pointerEvents: 'none', top: 0, left: 0, zIndex: 1 }}
    >
      <mesh scale={new Vector3(1, 1, 1).multiplyScalar(1000)}></mesh>
      <LightRig />
      <OrbitControls />
      <ParticleField />
      {children}
      <color attach="background" args={prefersDarkMode ? ['#222034'] : ['#cbdbfc']} />
      <EffectComposer>{effects.concat(<Noise key="Noise" opacity={0.01} />)}</EffectComposer>
    </Canvas>
  );
};
