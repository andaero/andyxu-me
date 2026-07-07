"use client";

import { useEffect, useRef, useState } from "react";

// S.U.N. % over DPO iterations (num_sun / 10,000 generations),
// from PLaID/results/sun_esen.csv — same data as the paper's fig:dpoIter.
type Pt = { it: number; v: number; t: number | null };

const PLAID: Pt[] = [
  { it: 0, v: 3.57, t: null }, // Wyckoff SFT baseline
  { it: 1, v: 4.82, t: 0.7 },
  { it: 2, v: 5.64, t: 0.7 },
  { it: 3, v: 6.0, t: 0.9 },
  { it: 4, v: 7.25, t: 0.9 },
  { it: 5, v: 7.57, t: 1.1 },
  { it: 6, v: 7.47, t: 1.1 },
  { it: 7, v: 7.74, t: 1.3 },
];

const UNCON_ONLY: Pt[] = [
  { it: 0, v: 3.57, t: null },
  { it: 1, v: 4.37, t: 0.7 },
  { it: 2, v: 5.37, t: 0.7 },
  { it: 3, v: 5.68, t: 0.9 },
  { it: 4, v: 6.13, t: 0.9 },
  { it: 5, v: 6.51, t: 1.1 },
  { it: 6, v: 7.15, t: 1.1 },
  { it: 7, v: 7.47, t: 1.3 },
];

// Fixed temperature shares the first iterations with the flagship run,
// then keeps τ = 0.7 and collapses.
const FIXED_TEMP: Pt[] = [
  { it: 0, v: 3.57, t: null },
  { it: 1, v: 4.82, t: 0.7 },
  { it: 2, v: 5.64, t: 0.7 },
  { it: 3, v: 6.22, t: 0.7 },
  { it: 4, v: 6.1, t: 0.7 },
];

const REFS = [
  { label: "ADiT", v: 5.3, color: "#3fc0ad" },
  { label: "FlowLLM", v: 4.7, color: "#a39cb3" },
];

const VARIANTS = {
  joint: {
    title: "PLaID++ Joint vs. Single-Task Training",
    main: { name: "PLaID++ (joint)", data: PLAID },
    alt: { name: "Unconditional only", data: UNCON_ONLY },
  },
  temperature: {
    title: "PLaID++ Dynamic vs. Fixed Temperature",
    main: { name: "PLaID++ (dynamic τ)", data: PLAID },
    alt: { name: "Fixed τ = 0.7", data: FIXED_TEMP },
  },
} as const;

const W = 620;
const H = 330;
const M = { top: 18, right: 20, bottom: 40, left: 46 };
const X_MAX = 7;
const Y_MIN = 3;
const Y_MAX = 8.2;

const px = (it: number) =>
  Math.round((M.left + (it / X_MAX) * (W - M.left - M.right)) * 100) / 100;
const py = (v: number) =>
  Math.round(
    (H - M.bottom - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (H - M.top - M.bottom)) * 100
  ) / 100;

const path = (data: Pt[]) =>
  data.map((p, i) => `${i === 0 ? "M" : "L"}${px(p.it)},${py(p.v)}`).join(" ");

type Hover = { name: string; p: Pt; color: string } | null;

export default function TrainingCurves({
  variant,
}: {
  variant: "joint" | "temperature";
}) {
  const { main, alt, title } = VARIANTS[variant];
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

  const series = [
    { ...alt, color: "#a9a1bd", cls: "alt" },
    { ...main, color: "#8b5fd6", cls: "main" },
  ];

  return (
    <div ref={ref} className={`tc${on ? " on" : ""}`}>
      <div className="fig-title">{title}</div>
      <div className="tc-legend">
        {[...series].reverse().map((s) => (
          <span key={s.name} className="tc-key">
            <span className="tc-swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="tc-frame">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          {/* y gridlines + labels */}
          {[3, 4, 5, 6, 7, 8].map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={py(v)}
                y2={py(v)}
                stroke="rgba(54,44,78,0.07)"
              />
              <text x={M.left - 10} y={py(v) + 3.5} className="tc-tick" textAnchor="end">
                {v}%
              </text>
            </g>
          ))}
          {/* x labels */}
          {Array.from({ length: X_MAX + 1 }, (_, it) => (
            <text key={it} x={px(it)} y={H - M.bottom + 20} className="tc-tick" textAnchor="middle">
              {it}
            </text>
          ))}
          <text x={(M.left + W - M.right) / 2} y={H - 4} className="tc-axis" textAnchor="middle">
            DPO iteration
          </text>

          {/* reference lines */}
          {REFS.map((r) => (
            <g key={r.label}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={py(r.v)}
                y2={py(r.v)}
                stroke={r.color}
                strokeOpacity={0.55}
                strokeDasharray="3 5"
              />
              <text x={W - M.right - 4} y={py(r.v) - 5} className="tc-ref" fill={r.color} textAnchor="end">
                {r.label} {r.v}%
              </text>
            </g>
          ))}

          {/* curves */}
          {series.map((s) => (
            <path
              key={s.name}
              className={`tc-line ${s.cls}`}
              d={path(s.data)}
              fill="none"
              stroke={s.color}
              strokeWidth={s.cls === "main" ? 2.5 : 2}
              pathLength={1}
            />
          ))}

          {/* points */}
          {series.map((s) =>
            s.data.map((p, i) => (
              <circle
                key={`${s.name}-${p.it}`}
                className="tc-dot"
                style={{ transitionDelay: `${0.15 + i * 0.09}s` }}
                cx={px(p.it)}
                cy={py(p.v)}
                r={hover?.name === s.name && hover.p.it === p.it ? 7 : s.cls === "main" ? 4.5 : 4}
                fill={s.color}
                stroke="#faf9f4"
                strokeWidth={1.5}
                onMouseEnter={() => setHover({ name: s.name, p, color: s.color })}
                onMouseLeave={() => setHover(null)}
              />
            ))
          )}
        </svg>

        {hover && (
          <div
            className="tc-tip"
            style={{
              left: `${(px(hover.p.it) / W) * 100}%`,
              top: `${(py(hover.p.v) / H) * 100}%`,
              borderColor: hover.color,
            }}
          >
            <span className="tc-tip-name">{hover.name}</span>
            <span className="tc-tip-val">{hover.p.v.toFixed(2)}% S.U.N.</span>
            <span className="tc-tip-meta">
              {hover.p.t === null ? "SFT baseline" : `iteration ${hover.p.it} · τ = ${hover.p.t}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
