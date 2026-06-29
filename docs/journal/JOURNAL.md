# 📓 Journal de bord — Simulateur Crypto S'investir

Ce journal trace **toutes les versions** du projet et **les choix** (techniques, design, périmètre) avec leur justification. Entrée la plus récente en haut.

> Convention : une entrée par session/décision importante.
> Format : `## [AAAA-MM-JJ] Titre` → Contexte · Décisions · Choix & justifications · Prochaines étapes.

---

## [2026-06-29] Mise en perspective : crypto vs ETF Monde vs Livret A

### Contexte
- Suite de la vision (feature #2). Les clones ne montrent que la crypto qui « moone » ; on remet le risque/rendement en **contexte** (ADN prudent S'investir).

### Décisions
- **Datasets benchmark locaux** (`benchmarkDataset.ts`) : ETF Monde (type MSCI World, EUR, base 100) + Livret A modélisé par ses **taux réglementaires successifs** (capitalisation par morceaux).
- **Fonction pure `calculateBenchmarks`** : rejoue le **même calendrier** de versements (mêmes dates, même montant, même période) sur ETF Monde et Livret A.
- **UI `BenchmarkComparison`** : section « Mise en perspective » (barres comparées crypto/ETF/Livret A, crypto en or).
- **Tests** : +5 (capitalisation Livret A, cohérence investi, ETF > Livret A, montant invalide). 14/14 verts.

### Choix & justifications
- Honnêteté assumée : la crypto peut surperformer **au prix d'une volatilité bien supérieure** (lien avec le max drawdown). Repères étiquetés « approximatifs / pédagogiques ».
- Tout passe par la même abstraction (séries de prix + facteur de capitalisation) → cohérent avec `MarketDataProvider`.

### Prochaines étapes
- Assistant langage naturel (NL → formulaire + leçon) = signal Dev IA.
- Pass design 2026 (motion/storytelling) avec les mockups.

---

## [2026-06-29] Différenciation : « Discipline vs Émotion » (EBI) + métriques de risque

### Contexte
- Constat : un autre candidat (damien K) a livré un **clone fidèle** (CoinGecko + one-shot/DCA). La fidélité ne suffit plus → besoin de se démarquer sur la **vision produit** et l'alignement avec l'ADN S'investir (Evidence-Based Investing) et le poste **Dev IA**.
- Vision figée dans `perso/vision-produit-2026.md` (thèse : calculateur → copilote de décision pédagogique).

### Décisions
- **Moteur étendu (fonction pure)** : ajout de
  - `risk` : max drawdown du cours (pic→creux), dates pic/creux, % de temps en moins-value ;
  - `panic` : scénario « vente au pire creux puis cash » → coût chiffré de la panique ;
  - `timeline[].panicValue` : trajectoire de l'investisseur paniqué (superposable au graphique).
- **Nouveau composant `BehaviorInsight`** : section « Discipline vs émotion » (discipliné vs paniqué, coût, multiple, stress-test). Courbe panique ajoutée au graphique (rouge pointillé).
- **Tests** : +3 cas (drawdown, coût de panique, présence de `panicValue`). 9/9 verts.

### Choix & justifications
- On retourne l'outil du « combien j'aurais gagné » vers « la discipline bat l'émotion » : c'est **on-brand EBI**, **honnête** (on montre la pire chute), et **impossible à cloner sans comprendre leur business**.
- **Garde-fous conformité** : 100 % rétrospectif/pédagogique, aucune projection ni conseil personnalisé.

### Prochaines étapes
- Benchmark crypto vs ETF Monde / Livret A (mise en contexte du risque).
- Assistant langage naturel (NL → formulaire + leçon) = signal Dev IA.
- Pass design 2026 (motion/storytelling) avec les mockups.

---

## [2026-06-29] Auto-deploy GitHub OK + vrai logo S'investir

### Contexte
- Repo GitHub connecté au projet Vercel `app` avec **Root Directory = `app`** (1er build avait échoué car root pointait sur la racine, sans `package.json`).

### Décisions / constats
- **Auto-deploy validé** : un push sur `master` (commit `c347370`) a déclenché automatiquement un déploiement prod sur le projet `app` (URL inchangée `https://app-ashy-one-53.vercel.app`). Le lien GitHub↔Vercel est propre.
- **Logo** : remplacement du placeholder "S²" par le **vrai logo S'investir** (`app/public/logo-sinvestir.png`, affiché via `next/image`, 40px) à côté de "SIMULATEURS".
- **Note** : le domaine `simulateur-crypto-sinvestir.vercel.app` appartient à un **autre compte** (tableau de bord S'investir réel "damien K") — d'où l'échec d'alias précédent. On garde donc `app-ashy-one-53.vercel.app` comme URL de démo.

### Prochaines étapes
- Captures d'écran de l'app (home, résultats, graphique, mobile, embed).
- (Optionnel) Désactiver Vercel Authentication si on veut une URL custom publique.

---

## [2026-06-18] Vérif prod + URL propre + diagnostic Deployment Protection

### Contexte
- Reprise après le polish UI (refonte cartes résultats + en-tête fidèle au design S'investir), déjà commité/poussé et déployé en prod.

### Décisions / constats
- **Vérification en ligne** de la prod : l'alias public `https://app-ashy-one-53.vercel.app` affiche bien la nouvelle UI (barre empilée bleu/or, indicateurs, synthèse FR, graphique). C'est le **lien de démo à utiliser**.
- **URL propre** créée via `vercel alias` : `https://simulateur-crypto-sinvestir-demo.vercel.app` (les noms plus courts étaient déjà pris globalement).
- **Diagnostic bloquant** : la **Deployment Protection (Vercel Authentication)** est activée sur le projet. Le domaine de prod par défaut (`app-ashy-one-53`) est exempté (public), mais **les URLs de déploiement par hash ET l'alias custom tombent sur le login Vercel**.
- **`vercel git connect` via CLI impossible** ici : `.git` est à la racine `d:\sinvestir` alors que le projet Vercel est lié au sous-dossier `app/` (setup "monorepo"). À faire au dashboard avec Root Directory = `app`.

### Prochaines étapes (actions utilisateur, dashboard)
1. **Settings → Deployment Protection → Vercel Authentication = Off** → rend l'URL propre et tous les liens publics.
2. **Import du repo GitHub** dans le projet (Root Directory = `app`) pour activer l'auto-deploy sur push `main`.
3. (Optionnel) Renommer le projet `app` → `simulateur-crypto-sinvestir` pour un domaine par défaut plus propre.

---

## [2026-06-18] Cadrage stratégique (synthèse reviewer technique)

### Contexte
- Analyse d'une réflexion externe (type reviewer technique) sur le brief, consolidée dans `strategie/STRATEGIE.md`.

### Décisions
- Création du dossier `strategie/` avec `STRATEGIE.md` (verdict, MVP, anti sur-ingénierie, archi, plan de commits, suggestions, script Loom).
- **Révision de la source de données** : passage de "CoinGecko-first" à **dataset local par défaut + abstraction `MarketDataProvider`** (CoinGecko branchable plus tard).
- Adoption de l'architecture `src/` (séparation stricte UI / `lib/simulation` / `lib/market-data`).
- Périmètre MVP figé : crypto (BTC/ETH/SOL), one-shot + DCA mensuel (bonus hebdo), résultats + graphique, responsive, disclaimer.

### Choix & justifications
- **Dataset local** → démo stable (zéro rate limit), tests déterministes, toujours manipulable ; couche remplaçable = compromis apprécié d'un reviewer. (CONTEXTE.md mis à jour en conséquence.)
- **Pas d'auth / DB / backend complexe** → le test est une demi-journée, on évite la sur-ingénierie.
- **Logique de calcul pure et isolée** → lisibilité et testabilité = critères d'évaluation directs.

### Prochaines étapes
- Capturer les screenshots de référence puis scaffolder Next.js (Phase 1).

---

## [2026-06-18] Initialisation du projet

### Contexte
- Réception du test technique S'investir (transposer le simulateur crypto au design de `simulateurs.sinvestir.fr`).
- Analyse des deux sites de référence effectuée (logique fonctionnelle + identité visuelle).

### Décisions
- Mise en place des fondations documentaires avant tout code :
  - `ROADMAP.md` (plan de livraison par phases).
  - `docs/CONTEXTE.md` (contexte client, logique fonctionnelle, stack, design tokens).
  - `docs/journal/JOURNAL.md` (ce journal).
  - `.cursor/rules/` (règles Cursor spécialisées : contexte, design, stack, logique, journal).
  - `.gitignore` (Next.js / Vercel / secrets).
  - `screenshots/` (captures de référence pour reproduire le design).

### Choix & justifications
- **Stack : Next.js + TypeScript + Tailwind + Vercel** → alignée à 100 % sur la stack interne S'investir (signal positif, intégrabilité maximale).
- **Données : CoinGecko API** → seule manière réaliste de couvrir un large catalogue crypto avec historique, gratuitement, sans backend lourd.
- **Documentation-first** → le test évalue la manière de travailler ; tracer le contexte et les choix dès le départ.

### Prochaines étapes
- Capturer les screenshots de référence (homepage + un simulateur type + simulateur crypto).
- Affiner les design tokens exacts depuis les captures.
- Scaffolder le projet Next.js (Phase 1).

---

## [2026-06-18] Bonnes pratiques 2026, arbitrage données & extraction du design réel

### Contexte
- Mise à jour des bonnes pratiques stack (juin 2026) avant de coder : Next.js 16 stable, Server Components par défaut, `params`/`searchParams` = Promises, validation Zod, Metadata API, tokens centralisés.
- Re-discussion de la source de données (CoinGecko vs dataset local) pour maximiser l'effet démo.
- Analyse en direct du design cible via le navigateur (CDP) plutôt que via des screenshots statiques.

### Décisions
- **Source de données confirmée : dataset local + abstraction `MarketDataProvider`** (hybride, CoinGecko branchable). Raison décisive : l'API **gratuite CoinGecko est limitée aux 365 derniers jours** → impossible de montrer un backtest multi-années (le vrai « whaou »). Le dataset local couvre une longue histoire, reste stable pendant la review, et est déterministe pour les tests.
- **Design extrait en direct** de `simulateurs.sinvestir.fr` (CSS calculé + variables Nuxt UI) → nouveau fichier **`docs/DESIGN-TOKENS.md`** comme **source de vérité du design**. Le code référencera ces tokens (pas de couleur en dur).
- Correction d'incohérence : la règle `stack-nextjs.mdc` mentionnait encore « CoinGecko API » comme source → alignée sur dataset local + abstraction.

### Choix & justifications
- **Tokens réels** (corrigent les approximations) : polices `Plus Jakarta Sans` + `Lexend` ; bleu CTA `#0049C6` (et non `#2563EB`) ; fond `#080C16` ; doré `#D6AA00→#FFEA8F` ; cartes radius 20px ; boutons pilule. `CONTEXTE.md` + règle design mis à jour.
- **Dataset local** assumé et expliqué dans le README = compromis « produit » apprécié d'un reviewer (démo qui ne casse jamais > dépendance API fragile).

### Prochaines étapes
- Scaffolder Next.js + TS + Tailwind et câbler les tokens de `DESIGN-TOKENS.md` dans `@theme` (Phase 1).

---

## [2026-06-18] Phase 1 — Scaffolding Next.js + câblage des tokens

### Contexte
- Démarrage de l'implémentation après cadrage et extraction du design.

### Décisions
- Projet créé dans le **sous-dossier `app/`** (`create-next-app` : Next.js **16.2.9**, React **19.2.4**, Tailwind **v4**, TypeScript, ESLint, `src/`, alias `@/*`).
- **Dépôt Git unifié à la racine** `d:\sinvestir` (suppression du `.git` imbriqué généré par create-next-app) pour versionner docs + app ensemble.
- **Design tokens câblés** dans `app/src/app/globals.css` via `@theme` (Tailwind v4), polices `Plus Jakarta Sans` (display) + `Lexend` (sans) chargées via `next/font/google` dans `layout.tsx`.
- Page d'accueil temporaire de **validation visuelle** : rendu confirmé fidèle au site cible (navy, doré, bleu CTA, carte ombrée).

### Choix & justifications
- **Tailwind v4 `@theme`** = source unique des tokens référencée par les utilitaires (`bg-surface`, `text-success`, `font-display`…) → aucune couleur en dur, conforme à l'exigence « fichier thème ».
- `lang="fr"`, metadata + disclaimer dès le layout (SEO + conformité).

### Prochaines étapes
- Construire le layout de base (header logo « S² », conteneur) puis le moteur de simulation (`lib/simulation`) et le dataset local (`lib/market-data`).

---

## [2026-06-18] Phase 2 (partie 1) — Moteur de simulation + données

### Contexte
- Implémentation des fondations métier avant l'UI (logique isolée et testable).

### Décisions
- **Couche données** (`lib/market-data`) : `cryptoDataset.ts` (prix mensuels historiques approximatifs EUR, BTC depuis 2017, ETH 2017, SOL 2020 → juin 2026) + interface `MarketDataProvider` et `LocalDatasetProvider` (interpolation linéaire entre points mensuels). CoinGecko branchable derrière la même interface.
- **Moteur** (`lib/simulation/calculateSimulation.ts`) : fonction **pure** (provider injecté en paramètre, défaut = local). Gère one-shot + DCA (daily/weekly/monthly), cumul des quantités, valorisation à la date de fin, série échantillonnée pour le graphique, et `warnings` (dates ajustées, montant invalide, période inversée, données absentes).
- **Utilitaires dates** en UTC (`dateUtils.ts`) : `buildSchedule` (calendrier d'achats) + `sampleDates` (≤ 80 points pour des courbes lisibles quelle que soit la durée).
- **Formatters** fr-FR (devise, %, quantité, libellés de dates).
- **Tests** : Vitest ajouté (devDep), alias `@/*` configuré (`vitest.config.ts`), 6 tests verts sur la logique (provider mocké déterministe, indépendant du dataset).

### Choix & justifications
- **Données mensuelles approximatives** = dataset léger et embarquable, déterministe, reproduit la *forme* réelle des cycles ; honnêteté assumée (à préciser dans le disclaimer/README). L'interpolation lisse les courbes pour les DCA fins.
- **Provider injecté** → testabilité maximale (on teste la logique sans dépendre des vraies données) et substitution CoinGecko sans toucher au moteur.

### Prochaines étapes
- UI du simulateur : formulaire + cartes de résultats + graphique Recharts, branchés sur `calculateSimulation`.

---

## [2026-06-18] Phase 2 (UI) terminée, déploiement Vercel, embed & responsive

### Contexte
- Finalisation de l'UI du simulateur, mise en ligne et bonus d'intégrabilité.

### Décisions
- **UI complète** branchée sur le moteur : `SimulatorForm`, `ResultsCards`, `PerformanceChart` (Recharts), `RiskDisclaimer`, orchestrés par `CryptoSimulator` (client, calculs 100 % client-side). Primitives UI (`Card`, `Button`, `Field`).
- **Déploiement** : repo GitHub `simulateur-crypto-sinvestir` poussé + déploiement **production Vercel** réussi (build OK, page statique).
- **Bonus intégrabilité** : route **`/embed`** légère (server component, lit les `searchParams` Next 16), configurable par URL (`crypto`/`frequency`/`amount`/`start`/`end`) + snippet `<iframe>` dans le README.
- **Responsive** : audit code (mobile-first, colonnes empilées < lg) ; valeurs de cartes en `text-xl sm:text-2xl` + `tabular-nums` pour éviter tout débordement sur petit écran. Vérif via navigateur sur `localhost` abandonnée (l'outil navigateur boucle sur localhost) → contrôle par audit de code + rendu prod.
- **Graphique** : rendu différé après montage (`useEffect`) pour éviter les warnings de dimensions Recharts au SSR.

### Choix & justifications
- **`/embed` = réponse directe au bonus du brief** (composant qui peut remplacer le simulateur actuel OU être intégré en aperçu dans un article) sans réaliser l'intégration réelle.
- **Calculs client-side** : zéro backend, démo stable, composant embarquable.

### Prochaines étapes
- Renommer/connecter le projet Vercel, puis Loom + dépôt Tally. Bonus possibles : partage par URL, CoinGecko réel, mini-assistant IA.

---

<!-- Nouvelle entrée à ajouter au-dessus de cette ligne -->
