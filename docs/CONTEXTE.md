# 📚 Contexte & Stack — Simulateur Crypto S'investir

Ce document est la **source de vérité** sur le projet : qui, quoi, pourquoi, et avec quels outils.

---

## 1. Le contexte client

**S'investir** est une entreprise d'éducation/conseil en investissement. Elle dispose :
- d'un site vitrine/blog : `https://sinvestir.fr` (contient notamment le **simulateur crypto** à transposer) ;
- d'une suite d'outils : `https://simulateurs.sinvestir.fr` (= **le design cible**, l'identité visuelle à reproduire).

Ce projet est un **test technique de recrutement** (poste : Développeur IA, full remote, collaboration longue durée).
- Les missions réelles porteront sur des **outils internes, agents IA, automatisations** (facturation interne, analyse de patrimoine, dashboards, intégrations HubSpot/WooCommerce/Sheets). Pas sur des simulateurs.
- Le simulateur est un **exercice court** pour juger le niveau technique et la manière de travailler.

### Ce qui est attendu
1. Démo en ligne fonctionnelle (de préférence **Vercel**).
2. Fidélité au design de `simulateurs.sinvestir.fr`.
3. Composant **autonome et intégrable** (réutilisable, embarquable, peu de dépendances).
4. **Responsive** desktop + mobile.
5. Code **propre et lisible** + README minimal (lancement, partis pris).

---

## 2. La logique fonctionnelle à reprendre (simulateur crypto)

Paramètres d'entrée :
| Paramètre | Détail |
|---|---|
| Crypto | Sélection d'un actif (BTC, ETH, …) |
| Montant | Montant investi (base de calcul) |
| Fréquence | One-shot **ou** DCA : quotidien / hebdomadaire / mensuel |
| Période | Date de début + date de fin |

Sorties attendues :
- Montant total investi sur la période
- Valeur finale du portefeuille
- Plus-value / moins-value (en € **et** en %)
- Graphique d'évolution de la valeur dans le temps

> ⚠️ C'est un **backtest historique** : aucune prédiction. Toujours afficher un **disclaimer** (risque de perte, volatilité crypto, données passées ≠ futures).

---

## 3. La stack technique

### Stack interne S'investir (référence)
**Next.js · Supabase · Vercel · n8n · Claude Code**
Côté outils : HubSpot, WooCommerce, Google Sheets.

### Stack retenue pour ce projet (alignée → signal positif)
| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js (App Router)** + **TypeScript** | Identique à leur stack, zéro friction d'intégration |
| Styling | **Tailwind CSS** | Reproduction rapide et fidèle du design system |
| Graphique | **Recharts** | Léger, peu de dépendances (critère embarquable) |
| Données prix | **Dataset local** par défaut + abstraction `MarketDataProvider` (CoinGecko branchable) | Démo stable (pas de rate limit), testable ; couche remplaçable sans toucher au moteur. Voir `strategie/STRATEGIE.md` §2 |
| Déploiement | **Vercel** | Utilisé en interne, preview + prod faciles |
| Persistance | **Supabase** *(optionnel / non requis MVP)* | Le simulateur est stateless ; extension possible ("Mes simulations") |

> Tout écart de stack doit être **justifié dans le README**.

---

## 4. Design cible (extrait en direct de `simulateurs.sinvestir.fr`)

> Tokens **réels** (analyse navigateur + CDP, 2026-06-18). Détail complet : **`docs/DESIGN-TOKENS.md`**.
> Le site original tourne sous **Nuxt UI** ; on reproduit le rendu avec Next.js + Tailwind.

- **Polices** : `Plus Jakarta Sans` (titres) + `Lexend` (corps/UI) — Google Fonts.
- **Fond** : navy très sombre `#080C16` (surface), zones élevées `#00173F`, cartes `#030C24`/95%.
- **Couleur primaire / CTA** : bleu marque `#0049C6` ; anneau de focus `#1098F7`.
- **Accent doré** : logo "S²" + valeurs clés → dégradé `#D6AA00 → #E4C031 → #FFEA8F`.
- **Texte** : blanc `#FFFFFF` ; sous-titres `white/82%` ; gris atténué `#9CA3AF`.
- **Sémantique** : gains en vert `#00C16A`, pertes en rouge `#EF4444`.
- **Composants** : cartes `border-radius 20px`, bordure `white/10`, ombre profonde + highlight interne ; boutons en pilule (`rounded-full`).
- **Layout** : sidebar de navigation sombre + inputs à gauche / cartes de résultats à droite.
- **Pattern résultat** : grandes valeurs chiffrées en cartes avec libellé discret + picto info.

---

## 5. Liens utiles

- Simulateur crypto (modèle fonctionnel) : https://sinvestir.fr/simulateur-crypto-monnaie/
- Design & standards cibles : https://simulateurs.sinvestir.fr/
- Formulaire de rendu (Tally) : https://tally.so/r/81E2lA
