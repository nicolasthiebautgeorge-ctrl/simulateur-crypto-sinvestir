import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[var(--container-page)] px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex items-center gap-2">
        <span className="font-display text-2xl font-bold text-gold">S&sup2;</span>
        <span className="text-sm font-light uppercase tracking-[0.2em] text-text-subtle">
          Simulateurs
        </span>
      </header>

      <section className="mt-10 max-w-2xl">
        <span className="inline-flex items-center rounded-full border border-white/10 px-4 py-1.5 text-sm font-light tracking-tight text-text-subtle">
          Simulateur crypto
        </span>
        <h1 className="mt-5 font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
          Combien aurait rapporté votre{" "}
          <span className="text-gold">investissement crypto</span> ?
        </h1>
        <p className="mt-4 max-w-xl text-base text-text-subtle">
          Testez un achat unique ou un investissement programmé (DCA) sur des
          données historiques, et visualisez l&apos;évolution de votre
          portefeuille.
        </p>
      </section>

      <section className="mt-10">
        <CryptoSimulator />
      </section>
    </main>
  );
}
