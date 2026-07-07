"use client";

import { useEffect, useRef, useState } from "react";

// S.S.U.N. % per space group, from the paper's fig:two_side_by_side_histogram.
// "joint": four model variants on the seven RLIP-trained space groups.
// "heldout": Wyckoff base vs. flagship on eight space groups excluded from the
// RLIP reward (values as printed on the paper figure).

type Group = { sg: string; n: number };
type Series = { name: string; color: string; vals: number[] };

const JOINT_GROUPS: Group[] = [
  { sg: "P1", n: 612 },
  { sg: "C2/c", n: 521 },
  { sg: "Amm2", n: 383 },
  { sg: "I4m2", n: 118 },
  { sg: "P3", n: 7 },
  { sg: "P6₃/mmc", n: 1121 },
  { sg: "F-43m", n: 534 },
];

const JOINT_SERIES: Series[] = [
  { name: "3D coordinate base", color: "#c5bfd3", vals: [2.6, 0.1, 0.6, 0, 0, 8.4, 2.4] },
  { name: "Wyckoff base", color: "#3fc0ad", vals: [7.9, 5.5, 2.4, 0.8, 0, 12.8, 5.8] },
  { name: "Spacegroup only", color: "#b99ce6", vals: [8.9, 6.8, 2.8, 0.9, 0.1, 15.9, 9.0] },
  { name: "PLaID++ (joint)", color: "#8b5fd6", vals: [10.1, 8.5, 0.8, 0.7, 0, 36.4, 13.7] },
];

const HELDOUT_GROUPS: Group[] = [
  { sg: "C2/m", n: 366 },
  { sg: "P2/c", n: 60 },
  { sg: "I4/mcm", n: 256 },
  { sg: "P3m1", n: 542 },
  { sg: "R3m", n: 1035 },
  { sg: "P62m", n: 467 },
  { sg: "P2₁3", n: 67 },
  { sg: "Fm3m", n: 3943 },
];

const HELDOUT_SERIES: Series[] = [
  { name: "Wyckoff base", color: "#3fc0ad", vals: [2.2, 1.8, 5.0, 6.4, 5.5, 12.6, 8.1, 12.4] },
  { name: "PLaID++", color: "#8b5fd6", vals: [2.1, 1.2, 5.5, 10.2, 7.0, 16.7, 10.6, 17.6] },
];

const VARIANTS = {
  joint: {
    title: "Conditional S.S.U.N. by Space Group",
    groups: JOINT_GROUPS,
    series: JOINT_SERIES,
    yMax: 38,
    ticks: [0, 10, 20, 30],
  },
  heldout: {
    title: "S.S.U.N. on Held-Out Space Groups",
    groups: HELDOUT_GROUPS,
    series: HELDOUT_SERIES,
    yMax: 19,
    ticks: [0, 5, 10, 15],
  },
} as const;

const W = 620;
const H = 330;
const M = { top: 18, right: 14, bottom: 50, left: 40 };

type Hover = { name: string; sg: string; v: number; color: string; x: number; y: number } | null;

export default function SpaceGroupBars({
  variant,
}: {
  variant: "joint" | "heldout";
}) {
  const { title, groups, series, yMax, ticks } = VARIANTS[variant];
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

  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const groupW = plotW / groups.length;
  const barW = Math.min(15, (groupW * 0.72) / series.length);
  const py = (v: number) => Math.round((H - M.bottom - (v / yMax) * plotH) * 100) / 100;

  return (
    <div ref={ref} className={`tc${on ? " on" : ""}`}>
      <div className="fig-title">{title}</div>
      <div className="tc-legend">
        {series.map((s) => (
          <span key={s.name} className="tc-key">
            <span className="tc-swatch" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="tc-frame">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={py(v)}
                y2={py(v)}
                stroke="rgba(54,44,78,0.07)"
              />
              <text x={M.left - 8} y={py(v) + 3.5} className="tc-tick" textAnchor="end">
                {v}%
              </text>
            </g>
          ))}

          {groups.map((g, gi) => {
            const cx = M.left + groupW * (gi + 0.5);
            const totalW = barW * series.length;
            return (
              <g key={g.sg}>
                {series.map((s, si) => {
                  const v = s.vals[gi];
                  const x = Math.round((cx - totalW / 2 + si * barW) * 100) / 100;
                  const y = py(v);
                  const h = Math.max(v > 0 ? 1.5 : 0, H - M.bottom - y);
                  return (
                    <rect
                      key={s.name}
                      className="sg-bar"
                      style={{ transitionDelay: `${0.08 + gi * 0.05}s` }}
                      x={x}
                      y={y}
                      width={Math.round(barW * 100) / 100 - 1.5}
                      height={Math.round(h * 100) / 100}
                      rx={1.5}
                      fill={s.color}
                      opacity={hover && !(hover.name === s.name && hover.sg === g.sg) ? 0.55 : 1}
                      onMouseEnter={() =>
                        setHover({ name: s.name, sg: g.sg, v, color: s.color, x: x + barW / 2, y })
                      }
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
                <text x={cx} y={H - M.bottom + 18} className="tc-tick" textAnchor="middle">
                  {g.sg}
                </text>
                <text x={cx} y={H - M.bottom + 32} className="tc-tick" opacity={0.65} textAnchor="middle">
                  ({g.n})
                </text>
              </g>
            );
          })}
          <text x={(M.left + W - M.right) / 2} y={H - 4} className="tc-axis" textAnchor="middle">
            space group (training-set count)
          </text>
        </svg>

        {hover && (
          <div
            className="tc-tip"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: `${(hover.y / H) * 100}%`,
              borderColor: hover.color,
            }}
          >
            <span className="tc-tip-name">{hover.name}</span>
            <span className="tc-tip-val">{hover.v.toFixed(1)}% S.S.U.N.</span>
            <span className="tc-tip-meta">{hover.sg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
