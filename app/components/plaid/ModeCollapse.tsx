"use client";

import { useEffect, useRef, useState } from "react";

// Real data (paper table: "3D coordinate variant across RLIP iterations").
// Naive DPO on a coordinate representation: stability climbs while S.U.N.
// collapses — the model memorizes instead of generalizing.
// Iteration 0 is the 3D-coordinate SFT base model (pre-DPO).
const ITERS = [0, 1, 2, 3];
const SUN = [2.81, 2.93, 2.23, 1.69]; // left axis
const STABILITY = [7.2, 10.35, 13.47, 15.94]; // right axis

const W = 620;
const H = 280;
const M = { top: 18, right: 52, bottom: 40, left: 52 };

const SUN_MIN = 1.5;
const SUN_MAX = 3.2;
const ST_MIN = 6;
const ST_MAX = 17;

const px = (it: number) =>
  Math.round((M.left + (it / 3) * (W - M.left - M.right)) * 100) / 100;
const pySun = (v: number) =>
  Math.round(
    (H - M.bottom - ((v - SUN_MIN) / (SUN_MAX - SUN_MIN)) * (H - M.top - M.bottom)) * 100
  ) / 100;
const pySt = (v: number) =>
  Math.round(
    (H - M.bottom - ((v - ST_MIN) / (ST_MAX - ST_MIN)) * (H - M.top - M.bottom)) * 100
  ) / 100;

type Hover = { name: string; it: number; v: number; color: string; y: number } | null;

const SERIES = [
  {
    name: "Stability (%)",
    vals: STABILITY,
    py: pySt,
    color: "#a9a1bd",
    cls: "alt",
    r: 4,
  },
  {
    name: "S.U.N. (%)",
    vals: SUN,
    py: pySun,
    color: "#8b5fd6",
    cls: "main",
    r: 4.5,
  },
];

export default function ModeCollapse() {
  const [hover, setHover] = useState<Hover>(null);
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`tc${on ? " on" : ""}`}>
      <div className="fig-title">PLaID++ 3D Coordinate Variant</div>
      <div className="tc-legend">
        {[...SERIES].reverse().map((s) => (
          <span key={s.name} className="tc-key">
            <span className="tc-swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="tc-frame">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          {/* left axis ticks (S.U.N., purple) */}
          {[1.5, 2, 2.5, 3].map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={pySun(v)}
                y2={pySun(v)}
                stroke="rgba(54,44,78,0.07)"
              />
              <text
                x={M.left - 10}
                y={pySun(v) + 3.5}
                className="tc-tick"
                fill="#8b5fd6"
                textAnchor="end"
              >
                {v}%
              </text>
            </g>
          ))}
          {/* right axis ticks (stability, grey) */}
          {[6, 9, 12, 15].map((v) => (
            <text
              key={v}
              x={W - M.right + 10}
              y={pySt(v) + 3.5}
              className="tc-tick"
              fill="#a39cb3"
              textAnchor="start"
            >
              {v}%
            </text>
          ))}
          {/* x labels */}
          {ITERS.map((it) => (
            <text key={it} x={px(it)} y={H - M.bottom + 20} className="tc-tick" textAnchor="middle">
              {it}
            </text>
          ))}
          <text x={(M.left + W - M.right) / 2} y={H - 4} className="tc-axis" textAnchor="middle">
            RLIP iteration
          </text>

          {/* curves */}
          {SERIES.map((s) => (
            <path
              key={s.name}
              className={`tc-line ${s.cls}`}
              d={ITERS.map((it, i) => `${i === 0 ? "M" : "L"}${px(it)},${s.py(s.vals[i])}`).join(" ")}
              fill="none"
              stroke={s.color}
              strokeWidth={s.cls === "main" ? 2.5 : 2}
              pathLength={1}
            />
          ))}

          {/* points */}
          {SERIES.map((s) =>
            ITERS.map((it, i) => (
              <circle
                key={`${s.name}-${it}`}
                className="tc-dot"
                style={{ transitionDelay: `${0.15 + i * 0.09}s` }}
                cx={px(it)}
                cy={s.py(s.vals[i])}
                r={hover?.name === s.name && hover.it === it ? 7 : s.r}
                fill={s.color}
                stroke="#faf9f4"
                strokeWidth={1.5}
                onMouseEnter={() =>
                  setHover({ name: s.name, it, v: s.vals[i], color: s.color, y: s.py(s.vals[i]) })
                }
                onMouseLeave={() => setHover(null)}
              />
            ))
          )}
        </svg>

        {hover && (
          <div
            className="tc-tip"
            style={{
              left: `${(px(hover.it) / W) * 100}%`,
              top: `${(hover.y / H) * 100}%`,
              borderColor: hover.color,
            }}
          >
            <span className="tc-tip-name">{hover.name}</span>
            <span className="tc-tip-val">{hover.v.toFixed(2)}%</span>
            <span className="tc-tip-meta">
              {hover.it === 0 ? "3D-coord SFT baseline" : `iteration ${hover.it}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
