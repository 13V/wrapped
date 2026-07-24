import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { TryIt } from "@/components/TryIt";
import { Occasions } from "@/components/Occasions";
import { Safe } from "@/components/Safe";
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
        <Safe />

        {/* CTA band */}
        <section className="relative z-10 px-4 py-16">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink shadow-[0_30px_60px_-24px_rgba(10,37,64,0.55)]">
            {/* subtle indigo glow — restrained, fintech */}
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(80% 130% at 15% 0%, rgba(99,91,255,0.30), transparent 55%)" }} />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(70% 120% at 100% 100%, rgba(75,141,248,0.20), transparent 55%)" }} />
            <Reveal className="relative p-10 text-center md:p-16">
              <h2 className="font-display text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Go make someone&apos;s day.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-white/75">
                The best surprise is a gift they never saw coming — and one they get to keep.
              </p>
              <Magnetic
                href="#try"
                className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-ink shadow-[var(--shadow-hard-lg)]"
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
