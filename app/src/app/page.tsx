import Image from "next/image";
import { CryptoSimulator } from "@/components/simulator/CryptoSimulator";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[var(--container-page)] px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo-monogram.png"
            alt="S'investir"
            width={40}
            height={40}
            priority
            className="h-9 w-9 object-contain drop-shadow-[0_0_12px_rgba(228,192,49,0.25)]"
          />
          <span className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-gold-deep via-gold to-gold-hi bg-clip-text font-display text-lg font-bold tracking-tight text-transparent">
              S&apos;investir
            </span>
            <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.32em] text-text-muted">
              Simulateurs
            </span>
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
