# 🗺️ Roadmap — Simulateur Crypto S'investir

> **Mission** : transposer la logique fonctionnelle du [simulateur crypto](https://sinvestir.fr/simulateur-crypto-monnaie/) de S'investir, habillée à l'identité visuelle de [simulateurs.sinvestir.fr](https://simulateurs.sinvestir.fr/), et livrer une **démo en ligne fonctionnelle** (Vercel).
>
> **Deadline : mercredi 1er juillet 2026, 23h59.** · Charge estimée : ~ une demi-journée.

---

## 🎯 Critères d'évaluation (rappel)

1. **Démo fonctionnelle** — résultat concret et manipulable.
2. **Fidélité au design** S'investir.
3. **Qualité & intégrabilité du code** (compatible stack interne, ou choix justifié).
4. **Pertinence des suggestions** d'amélioration.

---

## ✅ Phases de livraison

### Phase 0 — Fondations *(en cours)*
- [x] Analyse de la demande et des 2 sites de référence
- [x] ROADMAP, journal de bord, documentation contexte/stack
- [x] Cadrage stratégique (`strategie/STRATEGIE.md`)
- [x] Règles Cursor spécialisées (`.cursor/rules`)
- [x] `.gitignore` + dossier `screenshots/`
- [x] Analyse live du design cible + extraction des vrais tokens (`docs/DESIGN-TOKENS.md`)
- [x] Init du dépôt Git (repo GitHub poussé : `simulateur-crypto-sinvestir`)

### Phase 1 — Scaffolding technique
- [x] Créer le projet Next.js (App Router) + TypeScript + Tailwind (`app/`, Next 16.2.9, React 19, Tailwind v4)
- [x] Câbler les **design tokens** de `docs/DESIGN-TOKENS.md` dans `@theme` (Plus Jakarta Sans + Lexend, couleurs, radius) — zéro couleur en dur
- [x] Dépôt Git unifié à la racine + page d'accueil de validation (rendu fidèle vérifié)
- [x] Layout de base (header logo "S²", conteneur, hero)
- [x] Déploiement Vercel (prod en ligne)

### Phase 2 — Cœur fonctionnel (MVP) ✅
- [x] Formulaire : crypto, montant, fréquence (one-shot / DCA), dates début+fin
- [x] Source de données : dataset local (BTC/ETH/SOL) + abstraction `MarketDataProvider` (CoinGecko branchable) — cf. `strategie/STRATEGIE.md` §2
- [x] Moteur de calcul backtest : **lump sum** + **DCA** (quotidien/hebdo/mensuel) — fonction pure + 6 tests Vitest ✓
- [x] Cartes de résultats : montant investi, valeur finale, +/- value (€ et %)
- [x] Graphique d'évolution de la valeur dans le temps (Recharts)
- [x] États : erreur / données indisponibles (warnings du moteur affichés)

### Phase 3 — Design & responsive
- [x] Fidélité au design `simulateurs.sinvestir.fr` (tokens réels, fonts, cartes)
- [x] **Responsive desktop + mobile** (mobile-first : colonnes empilées, valeurs adaptatives + `tabular-nums`)
- [x] Disclaimer réglementaire (risque crypto)
- [~] Accessibilité de base (labels + focus ring OK ; à compléter : navigation clavier, contrastes Lighthouse)

### Phase 4 — Intégrabilité (bonus)
- [x] Composant `<CryptoSimulator />` autonome et réutilisable (props `initialInput`)
- [x] Route `/embed` légère (iframe-friendly, config par paramètres d'URL) + snippet dans le README
- [x] Minimiser les dépendances (seul Recharts ajouté)

### Phase 5 — Livraison
- [x] README (lancement, partis pris, justification de stack)
- [x] Déploiement production Vercel + lien fonctionnel
- [ ] Renommer le projet Vercel + alias propre + connecter le repo (auto-deploy)
- [ ] Suggestions d'amélioration (regard de partenaire) — rédigées, à mettre dans Tally
- [ ] (Bonus) Vidéo Loom 5 min
- [ ] Dépôt via le formulaire Tally

---

## 📦 Checklist du rendu Tally

- [ ] Lien démo en ligne (Vercel) — cliquable et fonctionnel
- [ ] Lien repo Git (public ou lecture)
- [ ] Partis pris techniques + suggestions d'amélioration
- [ ] (Bonus) Loom 5 min

---

## 💡 Suggestions d'amélioration (à affiner — regard de partenaire)

- Sauvegarde/partage d'une simulation via URL encodée (sans compte).
- Librairie interne unifiée `@sinvestir/simulators` (cohérence + maintenance).
- Couche data centralisée (cache marché via Supabase Edge Functions ou n8n) pour éviter les rate limits.
- Automatisation n8n : export des simulations / leads vers HubSpot.
- A11y & SEO renforcés (server components, données structurées).
