import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Steps } from "@/components/Steps";
import { TryIt } from "@/components/TryIt";
import { Occasions } from "@/components/Occasions";
import { Safe } from "@/components/Safe";
import { Marquee } from "@/components/Marquee";
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
        <Steps />
        <TryIt />
        <Occasions />
        <Safe />

        {/* CTA band */}
        <section className="relative z-10 px-4 py-16">
          <div className="animated-grad mx-auto max-w-6xl rotate-[-0.6deg] overflow-hidden rounded-[32px] border-2 border-ink">
            <div className="border-b-2 border-ink bg-lime py-2">
              <Marquee items={["send one to the group chat", "gift crypto that slaps", "no seed phrase"]} />
            </div>
            <Reveal className="p-10 text-center md:p-16">
              <h2 className="font-display text-4xl font-black lowercase tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.35)] md:text-6xl">
                go make someone&apos;s day.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg font-semibold text-white/90">
                the best surprise in someone&apos;s dms is a gift they didn&apos;t see coming.
              </p>
              <Magnetic
                href="#try"
                className="mt-8 inline-block rounded-2xl border-2 border-ink bg-ink px-8 py-4 font-display text-xl font-black lowercase text-lime shadow-[6px_6px_0_0_rgba(0,0,0,0.35)]"
              >
                wrap a gift →
              </Magnetic>
            </Reveal>
          </div>
        </section>

        {/* footer */}
        <footer className="relative z-10 border-t border-line px-4 py-12">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-lime text-lg shadow-[2px_2px_0_0_var(--color-pink)]">🎁</span>
              <span className="font-display text-xl font-extrabold text-text">wrapped</span>
            </a>
            <nav className="flex flex-wrap gap-5 font-bold lowercase text-muted">
              <a href="#how" className="hover:text-text">how it works</a>
              <a href="#try" className="hover:text-text">try it</a>
              <a href="#occasions" className="hover:text-text">occasions</a>
              <a href="#safe" className="hover:text-text">is it safe?</a>
            </nav>
          </div>
          <p className="mx-auto mt-6 max-w-6xl font-mono text-xs text-muted">
            wrapped · gift crypto in seconds · non-custodial, built on solana · a demo, not financial advice — just a nicer way to give.
          </p>
        </footer>
      </main>
      <ClaimOverlay />
    </>
  );
}
