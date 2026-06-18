# 🎯 Stratégie de réalisation — Simulateur Crypto S'investir

> Synthèse du meilleur de la réflexion (analyse type "reviewer technique"). Document de cadrage **avant le code**.
> Objectif : réussir proprement le test en demi-journée, sans sur-ingénierie.

---

## 1. Verdict stratégique

**Ce n'est pas vraiment un test "IA".** C'est un test de **capacité produit + intégration front + qualité de livraison**.

Ils veulent voir si on sait :
- comprendre un simulateur existant ;
- reproduire sa logique fonctionnelle ;
- l'adapter à une identité visuelle cible ;
- livrer vite une démo utilisable ;
- structurer un repo propre ;
- expliquer ses choix ;
- proposer des améliorations pertinentes.

**Le piège** : vouloir faire trop compliqué (API crypto complète, 7 000 cryptos, backtesting ultra précis, backend, Supabase, auth…). Le brief dit explicitement : demi-journée, "pas un produit fini", mais **code propre et démo qui marche**.

**La bonne réponse** : Next.js + TypeScript + composant simulateur autonome + calculs client-side + UI fidèle + README sérieux + déploiement Vercel.

---

## 2. Décision clé — Source de données

> ⚠️ Arbitrage central, qui révise la première intuition (CoinGecko-first).

| Option | Avantages | Inconvénients |
|---|---|---|
| **A — Dataset local mocké** (recommandé) | Pas de rate limit · démo stable · tests faciles · toujours manipulable | Moins réaliste |
| B — CoinGecko via route API Next | Plus réaliste · montre l'intégration API | Rate limits · données manquantes · plus long à sécuriser |

**Choix retenu : dataset local par défaut + architecture prête pour brancher CoinGecko** (abstraction `MarketDataProvider`).
À expliquer dans le README : démo stable privilégiée dans le cadre demi-journée, couche `market-data` remplaçable sans toucher au moteur de calcul. **C'est exactement le type de compromis qu'un recruteur sérieux apprécie.**

---

## 3. MVP recommandé

**À livrer (version qui gagne le test) :**
- **Sélecteur crypto** : Bitcoin, Ethereum, Solana (+ éventuellement BNB / XRP).
- **Mode d'investissement** : investissement unique ; DCA mensuel ; bonus hebdomadaire.
- **Paramètres** : montant, date de début, date de fin, crypto, fréquence.
- **Résultats** : montant total investi, valeur finale estimée, plus/moins-value, rendement %, nombre d'achats simulés.
- **Graphique** : courbe "montant investi" + courbe "valeur du portefeuille".
- **Responsive** : formulaire en haut/à gauche, résultats visibles vite, mobile propre.
- **Avertissement** : simulation pédagogique, performances passées non garanties, pas un conseil.

**À NE PAS faire (anti sur-ingénierie) :**
authentification · base de données · dashboard admin · comparaison de 50 cryptos · scraping fragile · design trop personnel · backend complexe · agents IA.

---

## 4. Stack retenue

Next.js 15/14 · TypeScript · Tailwind CSS · Recharts · Vercel · (optionnel) CoinGecko ou dataset local.

**Pourquoi c'est fort** : Next.js + Vercel colle à leur stack interne (Next.js, Supabase, Vercel, n8n, Claude Code). Le brief demande de justifier tout choix différent → on prend leur stack cible.

---

## 5. Architecture cible

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── simulator/
│   │   ├── CryptoSimulator.tsx
│   │   ├── SimulatorForm.tsx
│   │   ├── ResultsCards.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── RiskDisclaimer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── lib/
│   ├── simulation/
│   │   ├── calculateSimulation.ts
│   │   ├── types.ts
│   │   └── dateUtils.ts
│   ├── market-data/
│   │   ├── cryptoDataset.ts
│   │   └── marketDataProvider.ts
│   └── formatters.ts
├── tests/
│   └── calculateSimulation.test.ts
└── docs/
    ├── decisions.md
    └── improvements.md
```

**Point clé** : la logique de calcul est **séparée de l'UI**. Le reviewer doit voir vite :
- `components/simulator` = interface ;
- `lib/simulation` = logique métier (pure, testable, indépendante de React) ;
- `lib/market-data` = source de données remplaçable ;
- `docs/decisions.md` = arbitrages · `docs/improvements.md` = regard de partenaire.

---

## 6. Plan de réalisation par commits

1. `chore: initialize Next.js project with TypeScript and Tailwind` → Next.js, Tailwind, structure de dossiers, page d'accueil simple.
2. `feat: add crypto investment simulation engine` → types, `calculateSimulation`, dataset local, one-shot + DCA mensuel, tests unitaires.
3. `feat: build responsive crypto simulator UI` → formulaire, cards résultats, état initial, validation simple.
4. `feat: add performance chart and S'investir-inspired styling` → graphique, UI fidèle, responsive mobile.
5. `docs: add README, technical decisions and improvement notes` → README, `.env.example` si besoin, notes d'amélioration, disclaimer, nettoyage final.

---

## 7. Suggestions d'amélioration (regard de partenaire — pour le formulaire Tally)

Répondre **comme quelqu'un qui comprend leur business**, pas comme quelqu'un qui empile des features.

1. **Standardiser les simulateurs autour d'un design system léger** — composants communs (formulaires, cartes de résultats, graphiques, disclaimers, CTA) → cohérence visuelle + maintenance simplifiée.
2. **Créer un format d'embedding propre** — chaque simulateur exposé en page complète ET en mode embed (config par props ou paramètres d'URL) → intégration facile dans les articles `sinvestir.fr`.
3. **Ajouter une couche de tracking produit** — mesurer les simulateurs les plus utilisés, points de friction, abandons, scénarios testés → prioriser les futurs outils internes et contenus.

**Variante ambitieuse** : une *toolbox S'investir unifiée* (simulateurs, comparateurs, génération de scénarios, export PDF, recommandations pédagogiques non personnalisées), partageant une même base de composants, une logique d'intégration HubSpot/n8n et un suivi des conversions.

---

## 8. Script Loom (5 min)

- **0:00 — Présentation** : démo fonctionnelle, architecture simple, intégration réaliste dans leur stack.
- **0:30 — Compréhension du brief** : transposer la logique du simulateur crypto dans l'esprit de leurs simulateurs, sans produit final complet.
- **1:00 — Démo** : choix crypto, montant, période, mode one-shot/DCA, résultats + graphique.
- **2:15 — Architecture** : logique de calcul isolée de l'UI, composant autonome, source de données séparée.
- **3:15 — Choix techniques** : Next.js/TS/Tailwind/Vercel pour rester proche de leur stack ; dataset local pour une démo stable.
- **4:00 — Limites & améliorations** : dataset réduit, pas de frais/fiscalité ; pistes : API crypto, embed, export, design system, tracking.
- **4:45 — Conclusion** : capacité à travailler en partenaire technique (comprendre, livrer vite, documenter, proposer).

---

## 9. Structure README cible

`Overview · Démo (lien Vercel) · Objectif · Fonctionnalités · Stack · Installation · Dev local · Tests · Architecture · Partis pris techniques · Limites · Améliorations possibles.`

Points à mettre en avant : isolation de la logique dans `lib/simulation`, couche `market-data` remplaçable, composant autonome réutilisable/intégrable, dataset local assumé pour la stabilité de la démo.
