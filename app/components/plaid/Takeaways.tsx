// Three key-takeaway cards shown under the intro. Server component — no state.

const icons = {
  // RL loop — circular arrows
  rlip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11a8 8 0 1 0-.9 4.6" />
      <polyline points="20 4 20 11 13.5 11" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  // hexagonal cell with a lattice point — symmetry
  symmetry: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.8 20 7.4v9.2L12 21.2 4 16.6V7.4z" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 12 12 2.8 M12 12 20 16.6 M12 12 4 16.6" strokeOpacity="0.45" strokeWidth="1.2" />
    </svg>
  ),
  // arrows radiating outward — generalization
  general: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12 5 5 M12 12l7-7M12 12v9" />
      <polyline points="5 9.5 5 5 9.5 5" />
      <polyline points="14.5 5 19 5 19 9.5" />
      <polyline points="8.5 18 12 21.5 15.5 18" />
    </svg>
  ),
};

const CARDS = [
  {
    icon: icons.rlip,
    label: "Framework",
    accent: "#8b5fd6",
    text: (
      <>
        We introduce <b>R</b>einforcement <b>L</b>earning from <b>I</b>nteratomic{" "}
        <b>P</b>otentials, a diversity-aware framework for materials discovery
      </>
    ),
  },
  {
    icon: icons.symmetry,
    label: "Representation",
    accent: "#3fc0ad",
    text: (
      <>
        Motivated by <b>mode collapse</b> on a naïve 3D representation, we develop a
        symmetry-informed encoding to scale reinforcement learning
      </>
    ),
  },
  {
    icon: icons.general,
    label: "Results",
    accent: "#7c6f9b",
    text: (
      <>
        We show <b>generalization</b> across multiple materials discovery objectives,
        and achieve SOTA results in all settings
      </>
    ),
  },
];

export default function Takeaways() {
  return (
    <div className="tk-grid">
      {CARDS.map((c) => (
        <div key={c.label} className="tk-card">
          <span className="tk-icon" style={{ color: c.accent }}>
            {c.icon}
          </span>
          <div>
            <span className="tk-label">{c.label}</span>
            <p>{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
