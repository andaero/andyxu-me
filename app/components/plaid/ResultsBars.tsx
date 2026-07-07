// S.U.N. rate on unconditional MP-20 generation (Table 1, eSEN evaluation).
// Leaderboard order, best first — PLaID++ 7.74% vs best prior (ADiT) 5.3%.
const DATA = [
  { label: "PLaID++", value: 7.74, highlight: true },
  { label: "ADiT", value: 5.3, highlight: false },
  { label: "FlowLLM", value: 4.7, highlight: false },
  { label: "DiffCSP", value: 3.3, highlight: false },
  { label: "FlowMM", value: 2.8, highlight: false },
];

const MAX = 10;
const TICKS = [0, 2, 4, 6, 8, 10];

export default function ResultsBars() {
  return (
    <div className="rb">
      <div className="fig-title">Unconditional Crystal Generation S.U.N. Rate</div>
      <div className="rb-rows">
        {DATA.map((d, i) => (
          <div key={d.label} className={`rb-row${d.highlight ? " hl" : ""}`}>
            <span className="rb-rank">{i + 1}</span>
            <span className="rb-label">{d.label}</span>
            <div className="rb-track">
              <div className="rb-bar" style={{ width: `${(d.value / MAX) * 100}%` }} />
              <span className="rb-val">{d.value}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="rb-row rb-axis-row" aria-hidden="true">
        <span />
        <span />
        <div className="rb-axis">
          {TICKS.map((t) => (
            <span key={t} className="rb-tick" style={{ left: `${(t / MAX) * 100}%` }}>
              {t === 10 ? "10%" : t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
