// Real stable, unique & novel (S.U.N.) PLaID++ generations, taken directly from
// the released results CSV (relaxed structures, e_above_hull ≤ 0). Coordinates
// are the relaxed CIF's fractional positions; sites are the model's Wyckoff
// generation string.
export type Site = { el: string; coord: string; label: string };
export type Atom = { el: string; f: [number, number, number] };
export type Crystal = {
  formula: string;
  sg: string;
  ehull: number;
  natoms: number;
  abc: string;
  angles: string;
  lattice: { a: number; b: number; c: number; al: number; be: number; ga: number };
  elements: string[];
  sites: Site[];
  atoms: Atom[];
};

// Standard Jmol element colors — the scheme Materials Project's Crystal
// Toolkit uses, so structures here look like they do on materialsproject.org.
export const ELEMENT_COLORS: Record<string, string> = {
  Gd: "#45ffc7",
  Ag: "#c0c0c0",
  Sn: "#668080",
  Nd: "#c7ffc7",
  Cu: "#c88033",
  Dy: "#1fffc7",
  Al: "#bfa6a6",
  Ni: "#50d050",
  Ce: "#ffffc7",
  In: "#a67573",
  Rh: "#0a7d8c",
};

// darkened variants so the same hue stays legible as text on light backgrounds
export const ELEMENT_TEXT_COLORS: Record<string, string> = {
  Gd: "#0e8f68",
  Ag: "#6e6e6e",
  Sn: "#47595c",
  Nd: "#2f7d2f",
  Cu: "#8f5716",
  Dy: "#0b8a66",
  Al: "#7d6262",
  Ni: "#2e7d2e",
  Ce: "#8a8a1f",
  In: "#7a4f4d",
  Rh: "#0a616d",
};

// Cordero covalent radii (Å) for bond detection
export const COVALENT_RADII: Record<string, number> = {
  Gd: 1.96,
  Ag: 1.45,
  Sn: 1.39,
  Nd: 2.01,
  Cu: 1.32,
  Dy: 1.92,
  Al: 1.21,
  Ni: 1.24,
  Ce: 2.04,
  In: 1.42,
  Rh: 1.42,
};

export function colorFor(_c: Crystal, el: string): string {
  return ELEMENT_COLORS[el] ?? "#b8a9d9";
}

export function textColorFor(_c: Crystal, el: string): string {
  return ELEMENT_TEXT_COLORS[el] ?? "#362c4e";
}

export const CRYSTALS: Crystal[] = [
  {
    formula: "Gd2Ag2Sn2",
    sg: "P63mc",
    ehull: -0.154,
    natoms: 6,
    abc: "4.78 4.78 7.47",
    angles: "90.00 90.00 120.00",
    lattice: { a: 4.7754, b: 4.7754, c: 7.4692, al: 90, be: 90, ga: 120 },
    elements: ["Gd", "Ag", "Sn"],
    sites: [
      { el: "Gd", coord: "0.000 0.000 0.018", label: "2a" },
      { el: "Ag", coord: "0.333 0.667 0.792", label: "2b" },
      { el: "Sn", coord: "0.333 0.667 0.238", label: "2b" },
    ],
    atoms: [
      { el: "Gd", f: [1.0, 0.0, 0.007] },
      { el: "Gd", f: [0.0, 1.0, 0.507] },
      { el: "Ag", f: [0.333, 0.667, 0.815] },
      { el: "Ag", f: [0.667, 0.333, 0.315] },
      { el: "Sn", f: [0.333, 0.667, 0.227] },
      { el: "Sn", f: [0.667, 0.333, 0.727] },
    ],
  },
  {
    formula: "Nd2Cu4Sn4",
    sg: "P4/nmm",
    ehull: -0.019,
    natoms: 10,
    abc: "4.48 4.48 10.63",
    angles: "90.00 90.00 90.00",
    lattice: { a: 4.4806, b: 4.4806, c: 10.6301, al: 90, be: 90, ga: 90 },
    elements: ["Nd", "Cu", "Sn"],
    sites: [
      { el: "Nd", coord: "0.250 0.250 0.244", label: "2c" },
      { el: "Cu", coord: "0.750 0.250 0.000", label: "2a" },
      { el: "Cu", coord: "0.250 0.250 0.633", label: "2c" },
      { el: "Sn", coord: "0.750 0.250 0.500", label: "2b" },
      { el: "Sn", coord: "0.250 0.250 0.872", label: "2c" },
    ],
    atoms: [
      { el: "Nd", f: [0.25, 0.25, 0.238] },
      { el: "Nd", f: [0.75, 0.75, 0.762] },
      { el: "Cu", f: [0.75, 0.25, 0.0] },
      { el: "Cu", f: [0.25, 0.75, 0.0] },
      { el: "Cu", f: [0.25, 0.25, 0.637] },
      { el: "Cu", f: [0.75, 0.75, 0.363] },
      { el: "Sn", f: [0.75, 0.25, 0.5] },
      { el: "Sn", f: [0.25, 0.75, 0.5] },
      { el: "Sn", f: [0.25, 0.25, 0.874] },
      { el: "Sn", f: [0.75, 0.75, 0.126] },
    ],
  },
  {
    formula: "Dy4Al4Ni4",
    sg: "Pnma",
    ehull: -0.005,
    natoms: 12,
    abc: "6.70 4.23 7.67",
    angles: "90.00 90.00 90.00",
    lattice: { a: 6.6977, b: 4.2339, c: 7.6672, al: 90, be: 90, ga: 90 },
    elements: ["Dy", "Al", "Ni"],
    sites: [
      { el: "Dy", coord: "0.014 0.250 0.188", label: "4c" },
      { el: "Al", coord: "0.174 0.250 0.581", label: "4c" },
      { el: "Ni", coord: "0.793 0.250 0.588", label: "4c" },
    ],
    atoms: [
      { el: "Dy", f: [0.037, 0.25, 0.177] },
      { el: "Dy", f: [0.463, 0.75, 0.677] },
      { el: "Dy", f: [0.963, 0.75, 0.823] },
      { el: "Dy", f: [0.537, 0.25, 0.323] },
      { el: "Al", f: [0.138, 0.25, 0.56] },
      { el: "Al", f: [0.362, 0.75, 0.06] },
      { el: "Al", f: [0.862, 0.75, 0.44] },
      { el: "Al", f: [0.638, 0.25, 0.94] },
      { el: "Ni", f: [0.772, 0.25, 0.622] },
      { el: "Ni", f: [0.728, 0.75, 0.122] },
      { el: "Ni", f: [0.228, 0.75, 0.378] },
      { el: "Ni", f: [0.272, 0.25, 0.878] },
    ],
  },
  {
    formula: "Ce4In4Rh8",
    sg: "Fm-3m",
    ehull: -0.001,
    natoms: 16,
    abc: "6.76 6.76 6.76",
    angles: "90.00 90.00 90.00",
    lattice: { a: 6.7575, b: 6.7575, c: 6.7575, al: 90, be: 90, ga: 90 },
    elements: ["Ce", "In", "Rh"],
    sites: [
      { el: "Ce", coord: "0.500 0.500 0.500", label: "4b" },
      { el: "In", coord: "0.000 0.000 0.000", label: "4a" },
      { el: "Rh", coord: "0.250 0.250 0.250", label: "8c" },
    ],
    atoms: [
      { el: "Ce", f: [0.5, 0.5, 0.5] },
      { el: "Ce", f: [0.5, 1.0, 1.0] },
      { el: "Ce", f: [1.0, 0.5, 1.0] },
      { el: "Ce", f: [1.0, 1.0, 0.5] },
      { el: "In", f: [1.0, 0.0, 0.0] },
      { el: "In", f: [1.0, 0.5, 0.5] },
      { el: "In", f: [0.5, 1.0, 0.5] },
      { el: "In", f: [0.5, 0.5, 1.0] },
      { el: "Rh", f: [0.25, 0.25, 0.25] },
      { el: "Rh", f: [0.25, 0.25, 0.75] },
      { el: "Rh", f: [0.25, 0.75, 0.75] },
      { el: "Rh", f: [0.25, 0.75, 0.25] },
      { el: "Rh", f: [0.75, 0.25, 0.75] },
      { el: "Rh", f: [0.75, 0.25, 0.25] },
      { el: "Rh", f: [0.75, 0.75, 0.25] },
      { el: "Rh", f: [0.75, 0.75, 0.75] },
    ],
  },
];
