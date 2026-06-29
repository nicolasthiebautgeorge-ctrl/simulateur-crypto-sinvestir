import Image from "next/image";
import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[var(--container-page)] px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-sinvestir.png"
            alt="S'investir"
            width={44}
            height={44}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-sm font-light uppercase tracking-[0.2em] text-text-subtle">
            Simulateurs
          </span>
        </div>
        <a
          href="https://sinvestir.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-light text-text-muted transition-colors hover:text-text"
        >
          Découvrir S&apos;investir
        </a>
      </header>

      <section className="mt-12 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="hidden h-px w-10 bg-gradient-to-r from-transparent to-brand sm:block" />
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
            Simulateur Crypto
          </h1>
          <span className="hidden h-px w-10 bg-gradient-to-l from-transparent to-brand sm:block" />
        </div>
        <p className="mt-3 text-base font-medium text-brand-light">
          Et si vous aviez investi ? Mesurez le potentiel du DCA et de l&apos;achat unique.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
          Backtest sur données historiques (Bitcoin, Ethereum, Solana). Choisissez votre
          stratégie et visualisez l&apos;évolution de votre portefeuille.
        </p>
      </section>

      <section className="mt-8">
        <CryptoSimulator />
      </section>
    </main>
  );
}
