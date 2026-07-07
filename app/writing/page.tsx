import Link from "next/link";

const posts = [
  {
    slug: "plaid",
    title: "PLaID++: teaching a language model to invent stable crystals",
    desc: "Post-training an LLM for diverse, stable, novel crystal generation — via a symmetry-informed Wyckoff representation and temperature as an entropy regularizer.",
    date: "2026",
  },
];

export default function Writing() {
  return (
    <div className="writing-list">
      <h1>writing</h1>
      {posts.map((p) => (
        <Link key={p.slug} href={`/writing/${p.slug}`} className="writing-entry">
          <div className="we-title">{p.title}</div>
          <div className="we-desc">{p.desc}</div>
          <div className="we-date">{p.date}</div>
        </Link>
      ))}
    </div>
  );
}
