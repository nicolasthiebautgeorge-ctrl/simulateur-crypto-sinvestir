# Simulateur Crypto — S'investir

Simulateur d'investissement en cryptomonnaie (backtest historique **achat unique** ou **DCA**),
transposant la logique du [simulateur crypto S'investir](https://sinvestir.fr/simulateur-crypto-monnaie/)
à l'identité visuelle de la suite [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/).

> Test technique de recrutement — Développeur IA. MVP propre et démo fonctionnelle (~ une demi-journée).

## 🔗 Démo

- **Démo en ligne (Vercel)** : _à compléter après déploiement_
- Le code applicatif vit dans le dossier [`app/`](./app).

## ✨ Fonctionnalités

- Choix de l'actif (Bitcoin, Ethereum, Solana).
- Stratégie : **achat unique** ou **DCA** (quotidien / hebdomadaire / mensuel).
- Paramètres : montant, date de début, date de fin.
- Résultats : montant total investi, valeur finale, plus/moins-value (€ et %), nombre de versements, quantité accumulée.
- Graphique d'évolution : **montant investi** vs **valeur du portefeuille**.
- Gestion des cas limites (dates hors plage ajustées, montant invalide, période inversée).
- Responsive desktop / mobile + disclaimer réglementaire.

## 🧱 Stack & justification

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **TypeScript** | Aligné sur la stack interne S'investir → intégrabilité maximale |
| Styling | **Tailwind CSS v4** (`@theme`) | Reproduction fidèle et rapide du design ; tokens centralisés |
| Graphique | **Recharts** | Léger, peu de dépendances (critère d'embarquabilité) |
| Données | **Dataset local** + abstraction `MarketDataProvider` | Démo stable sans rate limit, déterministe et testable ; source remplaçable (CoinGecko) sans toucher au moteur |
| Déploiement | **Vercel** | Utilisé en interne ; preview + prod simples |
| Tests | **Vitest** | Valider la logique métier pure |

**Choix de données détaillé** : l'API gratuite CoinGecko limite l'historique aux **365 derniers jours**,
ce qui empêche les scénarios multi-années (le vrai intérêt d'un backtest). Un dataset local versionné
couvre une longue période, garantit une démo qui ne casse jamais, et reste **déterministe** pour les tests.
L'architecture (`MarketDataProvider`) permet de brancher une source temps réel sans modifier le moteur de calcul.

## 🚀 Lancer le projet

```bash
cd app
npm install
npm run dev      # http://localhost:3000
```

Autres scripts :

```bash
npm run build    # build de production
npm run test     # tests unitaires (Vitest)
npm run lint     # ESLint
```

## 🗂️ Architecture

```
app/src/
├── app/                      # Next.js App Router (layout, page, globals.css = design tokens @theme)
├── components/
│   ├── simulator/            # UI du simulateur
│   │   ├── CryptoSimulator.tsx   # composant autonome / embarquable (orchestrateur)
│   │   ├── SimulatorForm.tsx
│   │   ├── ResultsCards.tsx
│   │   ├── PerformanceChart.tsx
│   │   └── RiskDisclaimer.tsx
│   └── ui/                   # primitives (Card, Button, Field)
└── lib/
    ├── simulation/           # logique métier PURE (testable, sans React)
    │   ├── calculateSimulation.ts
    │   ├── dateUtils.ts
    │   └── types.ts
    ├── market-data/          # source de prix remplaçable
    │   ├── cryptoDataset.ts
    │   └── marketDataProvider.ts
    └── formatters.ts
```

**Principe clé** : la logique de calcul (`lib/simulation`) est **isolée de l'UI** et de la source de
données. Le composant `<CryptoSimulator />` est autonome (calculs 100 % client-side) et conçu pour être
réutilisé / embarqué proprement, avec peu de dépendances.

## 🎨 Fidélité au design

Les tokens (couleurs, polices, rayons) ont été **extraits en direct** du CSS rendu de
`simulateurs.sinvestir.fr` puis centralisés dans `app/src/app/globals.css` (`@theme`).
Détail et provenance : [`docs/DESIGN-TOKENS.md`](./docs/DESIGN-TOKENS.md).
Polices : **Plus Jakarta Sans** (titres) + **Lexend** (UI).

## 🧩 Intégrabilité

`<CryptoSimulator />` est autonome, fonctionne sans backend et accepte des valeurs initiales via
`initialInput`. Une **route `/embed` iframe-friendly** est fournie, **configurable par paramètres
d'URL** (`crypto`, `frequency`, `amount`, `start`, `end`) :

```html
<iframe
  src="https://<votre-demo>.vercel.app/embed?crypto=ethereum&frequency=monthly&amount=50&start=2021-01-01&end=2026-06-01"
  width="100%" height="900" style="border:0" loading="lazy"
  title="Simulateur crypto S'investir"></iframe>
```

Cela montre que le composant peut **prendre la place du simulateur actuel** sur
`simulateurs.sinvestir.fr` **ou** être **affiché en aperçu intégré** depuis un article `sinvestir.fr`.

## ⚠️ Limites & avertissement

- **Données historiques approximatives** (mensuelles, à but pédagogique) — pas des cotations officielles.
- Pas de frais de transaction ni de fiscalité.
- **Les performances passées ne préjugent pas des performances futures.** Investir en cryptomonnaies
  comporte un risque de perte en capital. Ceci n'est pas un conseil en investissement.

## 💡 Pistes d'amélioration

- Source de prix réelle via `MarketDataProvider` (CoinGecko / cache serveur).
- Partage d'une simulation via URL encodée + mode `/embed`.
- Design system partagé entre tous les simulateurs S'investir.
- Frais/fiscalité, comparaison multi-actifs, export PDF.

## 📚 Documentation projet

- [`ROADMAP.md`](./ROADMAP.md) · [`docs/CONTEXTE.md`](./docs/CONTEXTE.md) ·
  [`strategie/STRATEGIE.md`](./strategie/STRATEGIE.md) · [`docs/journal/JOURNAL.md`](./docs/journal/JOURNAL.md)
