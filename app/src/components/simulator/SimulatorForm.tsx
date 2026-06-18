import { CRYPTOS } from "@/lib/market-data/cryptoDataset";
import type {
  CryptoId,
  DateRange,
  Frequency,
  SimulationInput,
} from "@/lib/simulation/types";
import { Field, Select, TextInput } from "@/components/ui/Field";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "one-shot", label: "Achat unique" },
  { value: "monthly", label: "DCA mensuel" },
  { value: "weekly", label: "DCA hebdo" },
  { value: "daily", label: "DCA quotidien" },
];

interface SimulatorFormProps {
  value: SimulationInput;
  onChange: (patch: Partial<SimulationInput>) => void;
  currency: string;
  range: DateRange | null;
}

export function SimulatorForm({
  value,
  onChange,
  currency,
  range,
}: SimulatorFormProps) {
  const amountLabel =
    value.frequency === "one-shot" ? "Montant investi" : "Montant par versement";

  return (
    <div className="flex flex-col gap-5">
      <Field label="Cryptomonnaie" htmlFor="crypto">
        <Select
          id="crypto"
          value={value.crypto}
          onChange={(e) => onChange({ crypto: e.target.value as CryptoId })}
        >
          {Object.values(CRYPTOS).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.symbol})
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Stratégie d'investissement">
        <div className="grid grid-cols-2 gap-2">
          {FREQUENCIES.map((f) => {
            const active = value.frequency === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ frequency: f.value })}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-brand bg-brand/15 text-text"
                    : "border-white/10 bg-surface-soft/40 text-text-muted hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={amountLabel} htmlFor="amount">
        <div className="relative">
          <TextInput
            id="amount"
            type="number"
            min={1}
            step={10}
            value={Number.isFinite(value.amount) ? value.amount : ""}
            onChange={(e) => onChange({ amount: Number(e.target.value) })}
            className="pr-14"
          />
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">
            {currency}
          </span>
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date de début" htmlFor="start">
          <TextInput
            id="start"
            type="date"
            min={range?.start}
            max={range?.end}
            value={value.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
        </Field>
        <Field label="Date de fin" htmlFor="end">
          <TextInput
            id="end"
            type="date"
            min={range?.start}
            max={range?.end}
            value={value.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </Field>
      </div>

      {range ? (
        <p className="text-xs text-text-muted">
          Données disponibles : {range.start} → {range.end}.
        </p>
      ) : null}
    </div>
  );
}
