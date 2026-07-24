import { Marquee } from "./Marquee";

/** Two marquee rows crossing at opposite angles + opposite directions. */
export function CrossingMarquee({
  a,
  b,
}: {
  a: string[];
  b: string[];
}) {
  return (
    <section className="relative z-10 my-8 h-44 overflow-hidden">
      <div className="absolute inset-x-[-8%] top-1/2 -translate-y-1/2 -rotate-2 border-y border-line bg-[#f0f1ff] py-2.5">
        <Marquee items={a} baseVelocity={5} />
      </div>
      <div className="absolute inset-x-[-8%] top-1/2 -translate-y-1/2 rotate-2 border-y border-line bg-white py-2.5">
        <Marquee items={b} baseVelocity={-6} />
      </div>
    </section>
  );
}
