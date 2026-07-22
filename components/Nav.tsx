export function Nav() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center gap-4 rounded-2xl border border-line bg-surface/70 px-4 py-2.5 backdrop-blur-md">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl border-2 border-ink bg-lime text-lg shadow-[2px_2px_0_0_var(--color-pink)]">
            🎁
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-text">wrapped</span>
        </a>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {[
            ["how", "how it works"],
            ["try", "try it"],
            ["occasions", "occasions"],
            ["safe", "is it safe?"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-lg px-3 py-1.5 text-sm font-bold lowercase text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href="#try"
          className="ml-auto rounded-xl border-2 border-ink bg-pink px-4 py-2 text-sm font-extrabold lowercase text-white shadow-[3px_3px_0_0_var(--color-cyan)] transition-transform hover:-translate-y-0.5 md:ml-0"
        >
          send a gift
        </a>
      </div>
    </header>
  );
}
