import { useQuery } from "koota/react";
import { Capital, Position } from "./traits";

/** Simple marker at the central city site. */
export default function CityMarker() {
  const cities = useQuery(Capital, Position);
  const e = cities[0];
  if (!e?.isAlive()) return null;
  const p = e.get(Position)!;

  return (
    <group position={[p.x, 0, p.y]}>
      <mesh position={[0, 18, 0]} castShadow={false}>
        <cylinderGeometry args={[14, 18, 36, 20]} />
        <meshStandardMaterial
          color="#c9a227"
          metalness={0.15}
          roughness={0.65}
        />
      </mesh>
    </group>
  );
}
