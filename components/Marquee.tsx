export function Marquee({
  items,
  reverse = false,
  className = "",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const row = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {row.map((t, i) => (
          <span key={i} className="mx-5 inline-flex items-center gap-5 font-display text-lg font-extrabold uppercase tracking-tight text-ink">
            {t}
            <span aria-hidden className="text-ink">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
