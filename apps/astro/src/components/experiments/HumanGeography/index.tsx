import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe";

export default function HumanGeography() {
  return (
    <div className="h-full w-full bg-neutral-950">
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <Globe />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
