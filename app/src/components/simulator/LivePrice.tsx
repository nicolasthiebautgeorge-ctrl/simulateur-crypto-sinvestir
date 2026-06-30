"use client";

import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Radio } from "lucide-react";
import type { CryptoId } from "@/lib/simulation/types";
import type { LiveCoin } from "@/lib/market-data/liveMarket";
import { formatCurrency } from "@/lib/formatters";

interface LivePriceProps {
  cryptoId: CryptoId;
}

function pct(v: number | null): string {
  if (v == null) return "—";
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)} %`;
}

function toneClass(v: number | null): string {
  if (v == null) return "text-text-muted";
  return v >= 0 ? "text-success" : "text-error";
}

/** Cours en direct (CoinGecko) — masqué silencieusement si indisponible. */
export function LivePrice({ cryptoId }: LivePriceProps) {
  const [coin, setCoin] = useState<LiveCoin | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch(`/api/market?crypto=${cryptoId}`);
        if (!active || res.status !== 200) return;
        const data = (await res.json()) as LiveCoin;
        if (active) setCoin(data);
      } catch {
        // silencieux : le bloc reste masqué
      }
    }

    setCoin(null);
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [cryptoId]);

  if (!coin) return null;

  const up = (coin.change24h ?? 0) >= 0;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-white/10 bg-surface-soft/40 px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
          <Radio className="h-3.5 w-3.5 text-success" />
          Cours en direct
        </span>
        <span className="font-display text-lg font-semibold tabular-nums">
          {formatCurrency(coin.price, "EUR")}
        </span>
        <span
          className={`flex items-center gap-0.5 text-sm font-medium tabular-nums ${toneClass(
            coin.change24h,
          )}`}
        >
          {up ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {pct(coin.change24h)}
          <span className="ml-1 text-xs font-normal text-text-muted">24h</span>
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span>
          7j{" "}
          <span className={`tabular-nums ${toneClass(coin.change7d)}`}>
            {pct(coin.change7d)}
          </span>
        </span>
        <span>
          30j{" "}
          <span className={`tabular-nums ${toneClass(coin.change30d)}`}>
            {pct(coin.change30d)}
          </span>
        </span>
        {coin.athChangePct != null ? (
          <span className="hidden sm:inline">
            {Math.abs(coin.athChangePct).toFixed(0)} % sous l&apos;ATH
          </span>
        ) : null}
      </div>

      <span className="ml-auto text-[10px] uppercase tracking-wide text-text-muted/70">
        source CoinGecko
      </span>
    </div>
  );
}
