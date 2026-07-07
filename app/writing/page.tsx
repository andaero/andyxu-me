import Link from "next/link";

const posts = [
  {
    slug: "plaid",
    title: "PLaID++: A Preference-Aligned Language Model for Targeted Inorganic Materials Design",
    desc: "How do we design post-training methods that scale for discovering novel crystals?",
    date: "07-07-2026",
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
