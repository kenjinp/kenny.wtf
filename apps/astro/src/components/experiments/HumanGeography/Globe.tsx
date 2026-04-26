import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

export default function Globe() {
  const ref = useRef<Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.1;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.6, 48, 48]} />
      <meshBasicMaterial color="#7dd3fc" wireframe />
    </mesh>
  );
}
