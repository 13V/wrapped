import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TryIt } from "@/components/TryIt";
import { Occasions } from "@/components/Occasions";
import { Safe } from "@/components/Safe";
import { Marquee } from "@/components/Marquee";
import { CrossingMarquee } from "@/components/CrossingMarquee";
import { ClaimOverlay } from "@/components/ClaimOverlay";
import { ScrollProgress } from "@/components/ScrollProgress";
import { Reveal } from "@/components/Reveal";
import { Magnetic } from "@/components/Magnetic";
import { FloatingBg } from "@/components/FloatingBg";

export default function Home() {
  return (
    <>
      <FloatingBg />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <TryIt />
        <Occasions />
        <CrossingMarquee
          a={["A gift they'll keep", "One-of-a-kind holo", "Any token", "No seed phrase"]}
          b={["Open in seconds", "Fees on us", "Non-custodial", "Made on Solana"]}
        />
        <Safe />

        {/* CTA band */}
        <section className="relative z-10 px-4 py-16">
          <div className="animated-grad mx-auto max-w-6xl overflow-hidden rounded-[32px]">
            <div className="border-b border-white/15 bg-lime/90 py-2">
              <Marquee items={["Give crypto as a gift", "No wallet needed", "Open in seconds"]} />
            </div>
            <Reveal className="p-10 text-center md:p-16">
              <h2 className="font-display text-4xl font-semibold tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.35)] md:text-6xl">
                Go make someone&apos;s day.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-white/90">
                The best surprise is a gift they never saw coming — and one they get to keep.
              </p>
              <Magnetic
                href="#try"
                className="mt-8 inline-block rounded-full bg-surface px-8 py-4 text-lg font-semibold text-ink shadow-[var(--shadow-hard)]"
              >
                Create a gift →
              </Magnetic>
            </Reveal>
          </div>
        </section>

        {/* footer */}
        <footer className="relative z-10 border-t border-line px-4 py-12">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-lime text-lg shadow-[var(--shadow-hard-sm)]">🎁</span>
              <span className="font-display text-xl font-semibold text-text">Wrapped</span>
            </a>
            <nav className="flex flex-wrap gap-5 font-medium text-muted">
              <a href="#how" className="hover:text-text">How it works</a>
              <a href="#try" className="hover:text-text">Create a gift</a>
              <a href="#occasions" className="hover:text-text">Occasions</a>
              <a href="#safe" className="hover:text-text">Security</a>
            </nav>
          </div>
          <p className="mx-auto mt-6 max-w-6xl font-mono text-xs text-muted">
            Wrapped · Give crypto as a gift · Non-custodial, built on Solana · A demo, not financial advice — just a warmer way to give.
          </p>
        </footer>
      </main>
      <ClaimOverlay />
    </>
  );
}
