"use client";

import { useMemo, useState } from "react";

const W = 620;
const H = 300;
const N = 90;

// Four "modes" the model likes to collapse onto (in a 2D projection of
// chemical space). Fixed centers so the picture is deterministic.
const MODES = [
  { x: 0.28, y: 0.36 },
  { x: 0.68, y: 0.30 },
  { x: 0.44, y: 0.68 },
  { x: 0.78, y: 0.66 },
];

// A tiny deterministic PRNG so points are stable across renders / SSR.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Seed = { mode: number; ox: number; oy: number };

function useSeeds(): Seed[] {
  return useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: N }, () => {
      const mode = Math.floor(rand() * MODES.length);
      // random direction + magnitude offset from the mode center
      const ang = rand() * Math.PI * 2;
      const mag = Math.sqrt(rand()); // sqrt → uniform over disk
      return { mode, ox: Math.cos(ang) * mag, oy: Math.sin(ang) * mag };
    });
  }, []);
}

export default function TemperatureExplorer() {
  const seeds = useSeeds();
  const [tau, setTau] = useState(1.0);

  // spread s in [0,1]: low temperature → collapse onto modes, high → fill space.
  const s = Math.min(1, Math.max(0, (tau - 0.6) / (1.4 - 0.6)));
  const spread = 0.06 + s * 0.42; // fraction of canvas the offsets reach

  // "stable" region: a soft central ellipse. Points flung too far are unstable.
  const cx = 0.53;
  const cy = 0.5;
  const rx = 0.42;
  const ry = 0.4;

  const points = seeds.map((sd) => {
    const m = MODES[sd.mode];
    const x = m.x + sd.ox * spread;
    const y = m.y + sd.oy * spread;
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    const stable = d <= 1;
    return { x, y, stable };
  });

  // Diversity = fraction of a 6×6 grid covered by stable points (real coverage).
  const grid = new Set<number>();
  let stableCount = 0;
  for (const p of points) {
    if (!p.stable) continue;
    stableCount++;
    const gx = Math.min(5, Math.floor(p.x * 6));
    const gy = Math.min(5, Math.floor(p.y * 6));
    grid.add(gy * 6 + gx);
  }
  const diversity = Math.round((grid.size / 36) * 100);
  const stability = Math.round((stableCount / N) * 100);

  const sweetSpot = tau >= 0.92 && tau <= 1.12;

  return (
    <div>
      <div className="fig-title">Sampling Temperature vs. Exploration</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {/* stable-region guide — dashed reference line, like the chart refs */}
        <ellipse
          cx={cx * W}
          cy={cy * H}
          rx={rx * W}
          ry={ry * H}
          fill="none"
          stroke="#3fc0ad"
          strokeOpacity={0.55}
          strokeDasharray="3 5"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={Math.round(p.x * W * 100) / 100}
            cy={Math.round(p.y * H * 100) / 100}
            r={p.stable ? 4.5 : 4}
            fill={p.stable ? "#3fc0ad" : "#a9a1bd"}
            fillOpacity={p.stable ? 1 : 0.55}
            stroke="#faf9f4"
            strokeWidth={1.5}
            style={{ transition: "cx 0.35s ease, cy 0.35s ease, fill 0.35s ease" }}
          />
        ))}
        <text
          x={cx * W}
          y={H - 10}
          className="tc-ref"
          fill="#3fc0ad"
          textAnchor="middle"
        >
          stable / valid region
        </text>
      </svg>

      <div className="te-controls">
        <div className="te-slider-row">
          <span className="te-label">τ</span>
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.01}
            value={tau}
            onChange={(e) => setTau(parseFloat(e.target.value))}
            aria-label="sampling temperature"
          />
          <span className="te-tau">
            {tau.toFixed(2)}
            {sweetSpot && <em className="te-sweet"> · sweet spot</em>}
          </span>
        </div>
        <div className="te-readouts">
          <div className="te-stat">
            <span className="te-stat-val">{diversity}%</span>
            <span className="te-stat-key">diversity / coverage</span>
          </div>
          <div className="te-stat">
            <span className="te-stat-val">{stability}%</span>
            <span className="te-stat-key">stable candidates</span>
          </div>
        </div>
      </div>

      <p className="te-hint">
        {tau < 0.9
          ? "Low temperature → the model collapses onto a few familiar modes. Everything is stable, but there is almost nothing new."
          : tau > 1.15
          ? "High temperature → wide exploration, but the sampler pushes past the stable region and yield drops."
          : "Moderate temperature acts as an entropy regularizer — broad coverage while staying inside the stable region."}
      </p>
    </div>
  );
}
