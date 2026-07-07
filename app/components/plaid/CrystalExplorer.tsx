"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CRYSTALS, colorFor, textColorFor } from "./crystals";

const CrystalViewer = dynamic(() => import("./CrystalViewer"), {
  ssr: false,
  loading: () => <div className="ce-loading">loading structure…</div>,
});

// "Gd2Ag2Sn2" → Gd₂Ag₂Sn₂ for the tab labels
function fmtFormula(f: string) {
  return f
    .split(/(\d+)/)
    .filter(Boolean)
    .map((part, i) =>
      /^\d+$/.test(part) ? <sub key={i}>{part}</sub> : <span key={i}>{part}</span>
    );
}

export default function CrystalExplorer() {
  const [idx, setIdx] = useState(3); // Ce4In4Rh8 — cubic, 3 sites → 16 atoms
  const [mode, setMode] = useState<"wyckoff" | "coords">("wyckoff");
  const [hover, setHover] = useState<string | null>(null);
  const c = CRYSTALS[idx];

  return (
    <div>
      <div className="ce-tabs">
        {CRYSTALS.map((cr, i) => (
          <button
            key={cr.formula}
            className={i === idx ? "active" : ""}
            onClick={() => {
              setIdx(i);
              setHover(null);
            }}
          >
            <span>{fmtFormula(cr.formula)}</span>
            <em>{cr.sg}</em>
          </button>
        ))}
      </div>

      <div className="ce-grid">
        <div className="ce-crystal">
          <CrystalViewer crystal={c} highlight={hover} />
          <span className="ce-sg">
            G ≃ <em>{c.sg}</em>
          </span>
          <div className="ce-legend">
            {c.elements.map((el) => (
              <span
                key={el}
                className={`ce-leg${hover && hover !== el ? " dim" : ""}`}
                onMouseEnter={() => setHover(el)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="ce-dot" style={{ background: colorFor(c, el) }} />
                {el}
              </span>
            ))}
          </div>
          <div className="ce-meta">
            <span className="ce-chip">
              E<sub>hull</sub> {c.ehull.toFixed(3)} eV/atom
            </span>
          </div>
        </div>

        <div className="ce-string" onMouseLeave={() => setHover(null)}>
          <div className="ce-boxwrap">
            <div className={`ce-box ${mode === "wyckoff" ? "wyck" : "coords"}`}>
              <div className="ce-line formula">{c.formula}</div>
              {mode === "wyckoff" && (
                <div className="ce-line meta">
                  <span className="ce-k">Spacegroup:</span> {c.sg}
                </div>
              )}
              <div className="ce-line meta">
                <span className="ce-k">abc:</span> {c.abc}
              </div>
              <div className="ce-line meta">
                <span className="ce-k">angles:</span> {c.angles}
              </div>
              <div className="ce-line meta sec">
                <span className="ce-k">Sites</span> ({c.natoms})
              </div>
              {mode === "wyckoff"
                ? c.sites.map((s, i) => (
                    <div
                      key={i}
                      className={`ce-site${hover && hover !== s.el ? " dim" : ""}`}
                      style={{ color: textColorFor(c, s.el) }}
                      onMouseEnter={() => setHover(s.el)}
                    >
                      <span className="ce-swatch" style={{ background: colorFor(c, s.el) }} />
                      {s.el} {s.coord} <span className="ce-wlabel">{s.label}</span>
                    </div>
                  ))
                : c.atoms.map((a, i) => (
                    <div
                      key={i}
                      className={`ce-site${hover && hover !== a.el ? " dim" : ""}`}
                      style={{ color: textColorFor(c, a.el) }}
                      onMouseEnter={() => setHover(a.el)}
                    >
                      <span className="ce-swatch" style={{ background: colorFor(c, a.el) }} />
                      {a.el} {a.f.map((v) => v.toFixed(3)).join(" ")}
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ce-modebar">
        <div className="ce-mode">
          <button
            className={mode === "coords" ? "active" : ""}
            onClick={() => setMode("coords")}
          >
            3D coords
          </button>
          <button
            className={mode === "wyckoff" ? "active" : ""}
            onClick={() => setMode("wyckoff")}
          >
            Wyckoff
          </button>
        </div>
      </div>
    </div>
  );
}
