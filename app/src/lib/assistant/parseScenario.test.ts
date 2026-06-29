import { describe, expect, it } from "vitest";
import { parseScenario } from "@/lib/assistant/parseScenario";

describe("parseScenario", () => {
  it("comprend « 100 € par mois sur Bitcoin depuis 2020 »", () => {
    const { patch } = parseScenario("100 € par mois sur Bitcoin depuis 2020");
    expect(patch.amount).toBe(100);
    expect(patch.frequency).toBe("monthly");
    expect(patch.crypto).toBe("bitcoin");
    expect(patch.startDate).toBe("2020-01-01");
  });

  it("comprend un achat unique sur Ethereum", () => {
    const { patch } = parseScenario("1000 euros d'un coup sur Ethereum en 2021");
    expect(patch.amount).toBe(1000);
    expect(patch.frequency).toBe("one-shot");
    expect(patch.crypto).toBe("ethereum");
    expect(patch.startDate).toBe("2021-01-01");
    expect(patch.endDate).toBe("2021-12-01");
  });

  it("gère une plage d'années et un mois de départ", () => {
    const { patch } = parseScenario(
      "50€ par semaine sur Solana de janvier 2021 à 2024",
    );
    expect(patch.frequency).toBe("weekly");
    expect(patch.crypto).toBe("solana");
    expect(patch.startDate).toBe("2021-01-01");
    expect(patch.endDate).toBe("2024-12-01");
  });

  it("ne confond pas l'année avec le montant", () => {
    const { patch } = parseScenario("200 sur btc depuis 2019");
    expect(patch.amount).toBe(200);
    expect(patch.startDate).toBe("2019-01-01");
  });

  it("renvoie un patch vide si rien n'est reconnu", () => {
    const { patch, understood } = parseScenario("bonjour");
    expect(Object.keys(patch)).toHaveLength(0);
    expect(understood).toHaveLength(0);
  });
});
