"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { COVALENT_RADII, ELEMENT_COLORS, type Atom, type Crystal } from "./crystals";

type V3 = [number, number, number];

// Atoms sitting on a cell face/edge/corner get periodic images so the cell
// looks fully decorated (the way Crystal Toolkit / VESTA draw it).
function expandEdges(atoms: Atom[]): Atom[] {
  const out: Atom[] = [];
  const seen = new Set<string>();
  const eps = 0.02;
  for (const a of atoms) {
    const alts = a.f.map((v) => {
      const opts = [v];
      if (v < eps) opts.push(v + 1);
      if (v > 1 - eps) opts.push(v - 1);
      return opts;
    });
    for (const x of alts[0])
      for (const y of alts[1])
        for (const z of alts[2]) {
          const key = `${a.el}:${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ el: a.el, f: [x, y, z] });
        }
  }
  return out;
}

// Conventional cartesian lattice vectors: a along x, b in the xy-plane.
function latticeVectors(c: Crystal): [V3, V3, V3] {
  const d = Math.PI / 180;
  const { a, b, c: cl, al, be, ga } = c.lattice;
  const av: V3 = [a, 0, 0];
  const bv: V3 = [b * Math.cos(ga * d), b * Math.sin(ga * d), 0];
  const cx = cl * Math.cos(be * d);
  const cy = (cl * (Math.cos(al * d) - Math.cos(be * d) * Math.cos(ga * d))) / Math.sin(ga * d);
  const cz = Math.sqrt(Math.max(0, cl * cl - cx * cx - cy * cy));
  return [av, bv, [cx, cy, cz]];
}

const cart = (f: [number, number, number], v: [V3, V3, V3]): V3 => [
  f[0] * v[0][0] + f[1] * v[1][0] + f[2] * v[2][0],
  f[0] * v[0][1] + f[1] * v[1][1] + f[2] * v[2][1],
  f[0] * v[0][2] + f[1] * v[1][2] + f[2] * v[2][2],
];

const dist = (p: V3, q: V3) =>
  Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2);
const midpt = (p: V3, q: V3): V3 => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];

type SceneData = {
  atoms: { el: string; p: V3; r: number }[];
  // bond halves, each colored by its own atom's element
  bonds: { el: string; from: V3; to: V3 }[];
  cellEdges: Float32Array;
  vecs: [V3, V3, V3];
  center: V3;
  camDist: number;
};

// Nearest-neighbor-shell bonding (a cheap stand-in for CrystalNN): each atom
// bonds to neighbors within 15% of its closest contact, capped by covalent radii.
function buildScene(c: Crystal): SceneData {
  const vecs = latticeVectors(c);
  const expanded = expandEdges(c.atoms);
  const pos = expanded.map((a) => cart(a.f, vecs));
  const atoms = expanded.map((a, i) => ({
    el: a.el,
    p: pos[i],
    r: 0.32 * (COVALENT_RADII[a.el] ?? 1.5),
  }));

  const n = atoms.length;
  const dmin = new Array<number>(n).fill(Infinity);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = dist(pos[i], pos[j]);
      if (d > 0.4 && d < dmin[i]) dmin[i] = d;
    }
  const bonds: SceneData["bonds"] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const d = dist(pos[i], pos[j]);
      if (d < 0.4) continue;
      const rSum = (COVALENT_RADII[atoms[i].el] ?? 1.5) + (COVALENT_RADII[atoms[j].el] ?? 1.5);
      if (d > 1.15 * Math.min(dmin[i], dmin[j]) || d > 1.2 * rSum) continue;
      const m = midpt(pos[i], pos[j]);
      bonds.push({ el: atoms[i].el, from: pos[i], to: m });
      bonds.push({ el: atoms[j].el, from: m, to: pos[j] });
    }

  // 12 cell edges
  const zero: V3 = [0, 0, 0];
  const add = (p: V3, q: V3): V3 => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
  const pts: number[] = [];
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    const k = (i + 2) % 3;
    for (const s of [0, 1])
      for (const t of [0, 1]) {
        const base = add(s ? vecs[j] : zero, t ? vecs[k] : zero);
        pts.push(...base, ...add(base, vecs[i]));
      }
  }

  const corner = add(add(vecs[0], vecs[1]), vecs[2]);
  const center: V3 = [corner[0] / 2, corner[1] / 2, corner[2] / 2];
  const camDist = Math.max(dist(zero, corner), 8) * 2.3;

  return { atoms, bonds, cellEdges: new Float32Array(pts), vecs, center, camDist };
}

function Bond({ b, dim }: { b: SceneData["bonds"][number]; dim: boolean }) {
  const { position, quaternion, length } = useMemo(() => {
    const from = new THREE.Vector3(...b.from);
    const to = new THREE.Vector3(...b.to);
    const dir = new THREE.Vector3().subVectors(to, from);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return {
      position: from.clone().add(to).multiplyScalar(0.5),
      quaternion: q,
      length: dir.length(),
    };
  }, [b]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.11, 0.11, length, 12]} />
      <meshStandardMaterial
        color={ELEMENT_COLORS[b.el] ?? "#b8a9d9"}
        roughness={0.35}
        metalness={0}
        transparent
        opacity={dim ? 0.08 : 1}
      />
    </mesh>
  );
}

function AxisLabel({ text, position }: { text: string; position: V3 }) {
  const texture = useMemo(() => {
    const cnv = document.createElement("canvas");
    cnv.width = cnv.height = 64;
    const ctx = cnv.getContext("2d")!;
    ctx.font = "italic bold 42px Georgia, serif";
    ctx.fillStyle = "#444444";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 32, 34);
    const t = new THREE.CanvasTexture(cnv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text]);
  return (
    <sprite position={position} scale={[0.85, 0.85, 0.85]}>
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
  );
}

function Axes({ vecs }: { vecs: [V3, V3, V3] }) {
  const arrows = useMemo(
    () =>
      vecs.map((v) => {
        const dir = new THREE.Vector3(...v).normalize();
        return new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1.7, 0x555555, 0.45, 0.22);
      }),
    [vecs]
  );
  const names = ["a", "b", "c"];
  return (
    <group>
      {arrows.map((a, i) => (
        <primitive key={names[i]} object={a} />
      ))}
      {vecs.map((v, i) => {
        const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        const s = 2.25 / len;
        return <AxisLabel key={names[i]} text={names[i]} position={[v[0] * s, v[1] * s, v[2] * s]} />;
      })}
    </group>
  );
}

function Scene({ crystal, highlight }: { crystal: Crystal; highlight: string | null }) {
  const data = useMemo(() => buildScene(crystal), [crystal]);
  const edgeGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.cellEdges, 3));
    return g;
  }, [data]);

  return (
    <group position={[-data.center[0], -data.center[1], -data.center[2]]}>
      {data.atoms.map((a, i) => {
        const focus = highlight === a.el;
        const dim = highlight !== null && !focus;
        return (
          <mesh key={i} position={a.p} scale={focus ? 1.15 : 1}>
            <sphereGeometry args={[a.r, 28, 28]} />
            <meshStandardMaterial
              color={ELEMENT_COLORS[a.el] ?? "#b8a9d9"}
              roughness={0.3}
              metalness={0}
              emissive={focus ? ELEMENT_COLORS[a.el] : "#000000"}
              emissiveIntensity={focus ? 0.25 : 0}
              transparent
              opacity={dim ? 0.12 : 1}
            />
          </mesh>
        );
      })}
      {data.bonds.map((b, i) => (
        <Bond key={i} b={b} dim={highlight !== null && highlight !== b.el} />
      ))}
      <lineSegments geometry={edgeGeom}>
        <lineBasicMaterial color="#333333" transparent opacity={0.75} />
      </lineSegments>
      <Axes vecs={data.vecs} />
    </group>
  );
}

export default function CrystalViewer({
  crystal,
  highlight,
}: {
  crystal: Crystal;
  highlight: string | null;
}) {
  const camDist = useMemo(() => buildScene(crystal).camDist, [crystal]);
  return (
    <div className="ce-canvas">
      <Canvas
        key={crystal.formula} // reset camera per crystal
        flat // no tone mapping → exact, bright element colors like Crystal Toolkit
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [camDist * 0.62, camDist * 0.45, camDist * 0.62], fov: 35 }}
      >
        {/* Crystal Toolkit-style lighting: hemisphere-heavy, soft shadows */}
        <ambientLight intensity={1.1} />
        <hemisphereLight args={["#ffffff", "#8a8a8a", 1.2]} />
        <directionalLight position={[4, 8, 5]} intensity={0.9} />
        <Scene crystal={crystal} highlight={highlight} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}
