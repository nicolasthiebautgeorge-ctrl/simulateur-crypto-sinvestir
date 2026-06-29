import Image from "next/image";
import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[var(--container-page)] px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between gap-4">
        <Image
          src="/logo-sinvestir-cropped.png"
          alt="S'investir — Simulateurs"
          width={552}
          height={201}
          priority
          className="h-12 w-auto drop-shadow-[0_2px_16px_rgba(228,192,49,0.18)] sm:h-14"
        />
        <a
          href="https://sinvestir.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-light text-text-muted transition-colors hover:text-text"
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
