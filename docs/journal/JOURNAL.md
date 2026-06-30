# 📓 Journal de bord — Simulateur Crypto S'investir

Ce journal trace **toutes les versions** du projet et **les choix** (techniques, design, périmètre) avec leur justification. Entrée la plus récente en haut.

> Convention : une entrée par session/décision importante.
> Format : `## [AAAA-MM-JJ] Titre` → Contexte · Décisions · Choix & justifications · Prochaines étapes.

---

## [2026-06-30] Coach connecté au marché temps réel (CoinGecko)

### Contexte
- Suite logique de l'expert crypto : lui donner aussi le **contexte temps réel**, pas seulement l'historique du dataset.

### Décisions
- Nouveau module serveur `liveMarket.ts` : appel à l'**API publique gratuite CoinGecko** (`/coins/markets`, EUR) → prix, variations 24h/7j/30j, écart au plus-haut, market cap. **Cache mémoire 60 s** + **timeout 2,5 s** + repli cache/null (jamais bloquant).
- `AdvisorContext` : ajout de `cryptoId` (pour l'appel live) et `liveMarket?` (rempli côté serveur dans les routes `/api/advisor` et `/api/voice`).
- Prompts mis à jour : **`marketBrief` = repères HISTORIQUES illustratifs** (dynamique des cycles) ; **`liveMarket` = situation ACTUELLE réelle, qui fait foi pour « maintenant »**. Interdiction de citer un prix actuel non fourni.

### Choix & justifications
- Le dataset historique est **fictif/illustratif** (va à ~110 000 € en 2026) alors que le live est réel (~52 000 €). Séparer clairement historique (forme des cycles) et temps réel (prix actuel) évite toute contradiction et garde le coach crédible.
- CoinGecko gratuit + cache 60 s = pas de clé, sous les limites de l'API, latence maîtrisée.

### Prochaines étapes
- Vérifier en prod (live injecté). Loom + dépôt.

---

## [2026-06-30] Coach = expert crypto ancré sur des fluctuations réelles

### Contexte
- Demande : faire du coach un vrai expert crypto, connaissant les fluctuations, « plus intelligent qu'un humain » sur la méthode — sans bluffer ni sortir du cadre AMF.

### Décisions
- **Ancrage data** : nouveau module `marketKnowledge.ts` qui calcule, depuis le dataset local, des **repères de fluctuation réels** par crypto : volatilité annualisée, pire krach pic→creux (avec dates), écart au plus-haut, meilleure/pire performance sur 12 mois glissants, nb de corrections > 30 %.
- Ce `marketBrief` est ajouté à `AdvisorContext` (via `buildAdvisorContext`) → injecté dans les deux prompts (texte + vocal).
- **Expertise prompt** : cycles ~4 ans (halving), volatilité structurelle, facteurs macro/flux/régulation/levier, gestion du risque (taille de position, diversification, sécurité cold wallet, pas de levier débutant), DCA qui transforme la volatilité en alliée.
- **Angle « meilleur qu'un humain »** assumé de façon défendable : raisonne sur des chiffres, **sans biais émotionnel** (ni panique, ni euphorie) — pas de promesse de performance.

### Choix & justifications
- Ancrer l'expertise sur des chiffres calculés (non hallucinés) = crédibilité + honnêteté. Le modèle cite des ordres de grandeur réels, interdiction d'inventer des chiffres précis.
- Garde-fous AMF conservés (méthode oui, conseil personnalisé non, aucune garantie).

### Prochaines étapes
- Option future : brancher des données live (CoinGecko) via `MarketDataProvider` pour des repères temps réel. Loom + dépôt.

---

## [2026-06-30] Calibrage du ton du coach : affirmé & motivant, dans le cadre AMF

### Contexte
- Demande : un coach plus **confiant et conseiller**, sans sortir du cadre légal.

### Décisions
- Prompts **texte** (`/api/advisor`) et **vocal** (`/api/voice`) réécrits : posture de coach affirmé, qui prend position, encourage et oriente vers l'action.
- Recommandations de **méthode/comportement** assumées avec conviction (discipline, régularité, horizon long, DCA, diversification, gestion du risque).

### Garde-fous (AMF) conservés
- **Pas** de conseil en investissement personnalisé (« achète/vends tel actif pour ta situation »).
- **Aucune** promesse de rendement ; rappel « passé ≠ futur » uniquement quand c'est pertinent (moins robotique).

### Choix & justifications
- Distinguer *recommander une méthode* (autorisé, pédagogique) de *conseiller un acte d'investissement personnalisé* (réglementé) → on gagne en impact sans risque réglementaire.

---

## [2026-06-30] Mode vocal nouvelle génération (gpt-audio, voix marin/cedar)

### Contexte
- Objectif « waouh » : voix réaliste, plus humaine que `tts-1-hd`. Test API : `gpt-audio`/`gpt-realtime-2` accessibles sur la clé.

### Décisions
- **Mode vocal natif** via nouvelle route `/api/voice` : le modèle **`gpt-audio-mini`** génère la **réponse + la voix réaliste** (voix `marin`) en un seul appel (chat completions, `modalities:["text","audio"]`). On affiche la transcription dans la bulle → **texte et audio coïncident**.
- **`CoachPanel`** : mode vocal **par défaut** (voix active). Repli automatique sur le chemin texte (`/api/advisor` + `tts-1-hd`) si `/api/voice` indispo (204/erreur/rate-limit).
- **Réécoute exacte** : l'audio réaliste généré est conservé (URL d'objet) et rejoué tel quel par le bouton « réécouter » ; pour les messages texte, réécoute via `tts-1-hd` verbatim.
- Garde-fous : rate-limit `voice` 12/min (mode coûteux), URLs audio révoquées au démontage.
- Env : `OPENAI_AUDIO_MODEL=gpt-audio-mini`, `OPENAI_AUDIO_VOICE=marin`.

### Choix & justifications
- `gpt-audio` est **conversationnel** (ne lit pas verbatim) → on l'utilise comme *générateur de réponse vocale*, pas comme TTS. La bulle = sa transcription, donc cohérence parfaite voix/texte.
- Realtime (`gpt-realtime-2`) écarté pour l'instant : speech-to-speech temps réel = WebRTC + micro, trop lourd/risqué pour la démo. Piste future documentée.

### Prochaines étapes
- Vérifier en prod (`/api/voice` → reply + audio). Option future : conversation temps réel Realtime. Loom + dépôt Tally.

---

## [2026-06-30] Modèles OpenAI 2026 + voix audible (compresseur/gain) + audio au centre

### Contexte
- En prod, le coach retombait en `mock` malgré une clé valide. Diagnostic : variables d'env Vercel polluées par un `\r\n` (pipe PowerShell) **et** la gamme GPT-5 refuse `max_tokens`/`temperature` custom → erreur 400 → repli mock.
- Voix jugée trop faible. Demande : audio au centre de l'expérience (voix active par défaut) + bouton « réécouter » par message.

### Décisions
- **Modèles (catalogue OpenAI réel mi-2026, vérifiés sur la clé)** : conseil → `gpt-5.4-mini` (rapide, bon FR, peu cher ; réglable en `gpt-5.4`/`gpt-5.5`). Voix → `tts-1-hd` sur `/v1/audio/speech` (`gpt-4o-mini-tts` écarté).
- **Route conseil** : paramètres adaptés GPT-5 → `max_completion_tokens` (au lieu de `max_tokens`) et **pas de `temperature`** custom.
- **Variables Vercel** : ré-ajoutées proprement via redirection de fichier (sans saut de ligne) pour éliminer le `\r\n`.
- **Voix amplifiée** (`CoachPanel`) : flux `<audio>` routé dans le **Web Audio API** → `DynamicsCompressor` + `GainNode` (×2.4). Repli lecture brute si non supporté.
- **Audio central** : voix **active par défaut** ; **bouton « réécouter »** sur chaque réponse de l'assistant (relit / stoppe), avec suivi de l'état de lecture.

### Choix & justifications
- Un `<audio>` plafonne à `volume = 1.0` → seul le Web Audio permet d'amplifier au-delà de la source ; le compresseur homogénéise et évite la saturation.
- `tts-1-hd` = qualité sur l'endpoint simple, fiable et léger pour la démo (vraie voix « nouvelle génération » = Realtime `gpt-realtime-2` / `gpt-audio`, plus immersif mais intégration WebRTC plus lourde → piste bonus).

### Vérifs
- Prod : `/api/advisor` → `source: openai` (réponse `gpt-5.4-mini`) ; `/api/tts` → HTTP 200 (mp3 ~50 Ko). Build + alias OK.

### Prochaines étapes
- Optionnel : voix réaliste temps réel (Realtime/`gpt-audio`, voix `marin`/`cedar`). Loom + dépôt Tally.

---

## [2026-06-30] Coach IA : conseil OpenAI (GPT) + voix neuronale OpenAI TTS + garde-fous

### Contexte
- Choix d'upgrader le coach : meilleur modèle de conseil + voix réaliste. Rappel : abo ChatGPT Pro ≠ accès API (facturation API séparée).

### Décisions
- **Conseil** : route `/api/advisor` généralisée → priorité **OpenAI (GPT)** > Groq > mock (auto-détection selon la clé présente).
- **Voix** : nouvelle route `/api/tts` → **OpenAI TTS** (mp3), avec **repli Web Speech** (204 si pas de clé/erreur/quota). `CoachPanel` lit l'audio neuronal, sinon voix navigateur.
- **Garde-fous** (endpoint public + clé payante) : rate-limit in-memory par IP (advisor 20/min, tts 30/min), `max_tokens` court (320), input TTS tronqué (600 car.), **fallback mock systématique** → jamais d'erreur visible, coût maîtrisé.
- Variables d'env documentées (`.env.example`) : `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_TTS_MODEL`, `OPENAI_TTS_VOICE`.

### Choix & justifications
- OpenAI = conseil + voix avec **une seule clé**, meilleur français. Abstraction conservée → on change de provider sans toucher l'UI.
- Rate-limit in-memory = pragmatique pour une démo (note : store durable type Vercel KV/Upstash en prod).

### Prochaines étapes
- Ajouter `OPENAI_API_KEY` (+ un peu de crédit) dans Vercel pour activer GPT + voix neuronale. Loom + dépôt Tally.

---

## [2026-06-29] Coach S'investir IA (avatar + voix) + logo officiel + scénario par défaut

### Contexte
- Demande : avatar IA conseiller « façon Grok » + intégration du logo officiel + scénario par défaut réaliste.
- Recherche menée : les personnages Grok (Ani/Rudi) sont **propriétaires, mobile-only, payants, sans API** → non embarquables. Le TTS Groq est **payant et EN/AR seulement** (pas de français).

### Décisions
- **Logo officiel** S'investir (lockup doré) recadré automatiquement (552×201, fond transparent) et placé plus grand en haut à gauche.
- **Scénario par défaut** réaliste : 50 €/mois sur Bitcoin depuis juil. 2024 (au lieu de 100 €/mois depuis 2020 → somme démesurée).
- **Coach IA** = combo gratuit/fiable : abstraction `AdvisorProvider` (comme `MarketDataProvider`).
  - `MockAdvisor` déterministe (intents : risque, panique, DCA, comparaison, conseil→recadrage AMF, fallback) → **démo incassable, hors-ligne**.
  - Route `/api/advisor` : **Groq LLM** si `GROQ_API_KEY`, sinon fallback mock. Clé côté serveur (jamais exposée).
  - **Voix** fr-FR via **Web Speech API** (gratuit, navigateur), bouton on/off.
  - **Avatar** = orbe dorée animée (Framer Motion) avec états idle/thinking/speaking.
  - **Cadre AMF** : coach pédagogique, jamais de conseil personnalisé (system prompt + disclaimer).

### Choix & justifications
- Pas de Grok/avatar 3D (impossible/payant/fragile) → orbe on-brand + Web Speech = effet « waouh » crédible et fiable.
- Abstraction + fallback = signal Dev IA fort (archi propre) + démo qui ne casse jamais sans clé.

### Prochaines étapes
- (Option) brancher une clé Groq gratuite sur Vercel pour activer le vrai LLM. Loom + dépôt Tally.

---

## [2026-06-29] Direction artistique 2026 : nouveau logo + motion & effets

### Contexte
- Constat : la fidélité seule ne démarque pas (cf. clone damien K). Objectif : élever l'exécution visuelle sans trahir la marque. Mockups GPT analysés via une nouvelle règle d'expert.

### Décisions
- **2 règles `.mdc`** : `ui-ux-expert` (direction artistique/critique) + `ui-motion-effects` (intégration motion/effets, React web — pas React Native).
- **Logo** : monogramme « S » doré affiné (transparent) + wordmark « S'investir » en dégradé doré CSS + « Simulateurs » letterspacé, dans le header.
- **Motion** (Framer Motion `motion/react`) : `AnimatedNumber` (count-up sur la valeur héro) + `Reveal` (apparition en cascade des sections). Respect `prefers-reduced-motion`.
- **Effets** : boutons stratégie avec **icônes Lucide** + **glow** marque + `active:scale`, **slider** de montant (thumb doré), lueur bleue discrète sur la carte graphique.
- **Mockups** régénérés (logo-v2, mockup-v2-home avec assistant IA, mockup-v2-discipline) dans `assets/`.

### Choix & justifications
- React web + Framer Motion + Lucide (pas React Native : projet Next.js). Effets subtils (<280ms), démo stable (build/tests OK, 19/19).
- Logo en code (monogramme PNG transparent + texte dégradé) → net, theme-able, pas de fond baké.

### Prochaines étapes
- Itérer le pass design section par section selon retours ; éventuel restyle assistant + cartes glassy.

---

## [2026-06-29] Assistant langage naturel (signal Dev IA)

### Contexte
- Feature #3 de la vision : le pont vers le vrai besoin S'investir (agents IA). « Décris ton scénario » → pré-remplit le formulaire.

### Décisions
- **Parseur par règles 100 % local** (`parseScenario.ts`) : détecte crypto, montant (sans confondre avec l'année), fréquence (one-shot/DCA), et dates (« depuis 2020 », « en 2021 », « de janvier 2021 à 2024 »).
- **Interface `ScenarioParser`** isolée → branchable à un LLM (route API serveur) plus tard sans toucher l'UI. Choix assumé : démo **incassable**, aucune clé API, déterministe.
- **UI `ScenarioAssistant`** : champ + bouton « Pré-remplir » + exemples cliquables + chips « Compris : … », placé en haut, pleine largeur.
- **Tests** : +5 (phrases types, anti-confusion année/montant, non-reconnu). 19/19 verts.

### Choix & justifications
- Règles plutôt que LLM pour le jour J (stabilité), mais **archi agent-ready** pour montrer la pensée produit/IA. Aligné poste Dev IA + garde-fous conformité (aucun conseil).

### Prochaines étapes
- Pass design 2026 (motion/storytelling) avec les mockups GPT.

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
