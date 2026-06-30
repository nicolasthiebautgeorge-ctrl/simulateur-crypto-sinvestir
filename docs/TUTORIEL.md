# Tutoriel — Simulateur Crypto S'investir

> Démo en ligne : https://simulateur-crypto-sinvestir-demo.vercel.app
> Aucune installation, aucun compte. Ça marche tout de suite, sur mobile comme sur ordinateur.

---

## En 30 secondes

Vous choisissez **une crypto**, **une stratégie** (achat unique ou versements réguliers), **un montant** et **une période** → l'outil rejoue l'histoire sur des données réelles et vous montre **ce que ça aurait donné**, mais surtout **ce que ça vous apprend** : la discipline bat l'émotion.

C'est déjà un outil **complet et manipulable**, pas une maquette.

---

## 1. Les 4 leviers que vous pilotez

| Levier | Options | À quoi ça sert |
|---|---|---|
| **Cryptomonnaie** | Bitcoin, Ethereum, Solana | L'actif simulé |
| **Stratégie** | Achat unique · DCA mensuel · hebdo · quotidien | Tout placer d'un coup, ou lisser dans le temps |
| **Montant** | champ libre + curseur | Par versement (DCA) ou montant unique |
| **Période** | date de début → date de fin | La fenêtre rejouée (données dispo 2017 → 2026) |

Chaque changement **recalcule instantanément** les résultats et le graphique.

---

## 2. Lire les résultats

- **Cours en direct** — en tête des résultats, le **prix réel du jour** (variations 24h / 7j / 30j, écart au plus-haut), mis à jour automatiquement via une source publique (CoinGecko).
- **Valeur finale du portefeuille** — ce que vaudrait votre investissement aujourd'hui.
- **Montant investi / nombre de versements** — ce que vous avez réellement mis.
- **Plus / moins-value** (€ et %) — le gain ou la perte.
- **Graphique d'évolution** — 3 courbes superposées : ce que vous avez investi, la valeur réelle, et **« si vous aviez paniqué »**.
- **Discipline vs émotion** — le **coût de la panique** chiffré, la **pire chute traversée** (max drawdown) et le **temps passé en moins-value**.
- **Mise en perspective** — la même somme placée en **ETF Monde** ou sur un **Livret A**, pour comparer honnêtement risque et rendement.

---

## 3. Trois scénarios à tester (pas à pas)

### A. La force du DCA — « 100 €/mois sur Bitcoin depuis 2020 »
1. Cliquez sur l'exemple **« 100 € par mois sur Bitcoin depuis 2020 »** (ou réglez-le à la main).
2. Observez : malgré des chutes violentes traversées, les versements réguliers lissent le prix d'achat.
> **Ce que ça démontre :** on n'a pas besoin de « bien tomber » ; rester investi paie.

### B. Le piège du timing — « 1 000 € d'un coup sur Ethereum en 2021 »
1. Cliquez sur l'exemple **« 1 000 € d'un coup sur Ethereum en 2021 »**.
2. Regardez la **pire chute** et la courbe « si vous aviez paniqué ».
> **Ce que ça démontre :** tout placer au sommet + paniquer = le pire combo. Le timing est un piège.

### C. La volatilité réelle — « 50 €/semaine sur Solana depuis janvier 2022 »
1. Cliquez sur l'exemple **« 50 € par semaine sur Solana depuis janvier 2022 »**.
2. Comparez le rendement crypto au repère **ETF Monde / Livret A**.
> **Ce que ça démontre :** la crypto peut surperformer… au prix d'une volatilité que les autres placements n'ont pas.

---

## 4. L'assistant en langage naturel + le coach IA

- **Pré-remplir en une phrase** : tapez par exemple *« 200 € par mois sur Bitcoin depuis 2020 »* → le formulaire se remplit tout seul.
- **Coach S'investir IA — un vrai expert crypto** : posez une question (« quel est le risque ? », « le Bitcoin est-il trop volatil ? », « le marché est comment en ce moment ? »). Il répond en s'appuyant sur **trois sources** :
  1. **vos chiffres réels** (la simulation en cours),
  2. les **fluctuations historiques** de la crypto (volatilité, ampleur des krachs, cycles),
  3. le **marché en temps réel** (prix et tendances du jour).
- **Ton de coach assumé** : il prend position avec assurance sur la **méthode** (discipline, régularité, horizon long, gestion du risque) — **sans jamais donner de conseil d'investissement personnalisé** (secteur régulé), ni promettre de rendement.
- **La voix au centre** : par défaut, le coach **parle** avec une voix réaliste. Chaque réponse peut être **réécoutée** d'un clic.

---

## 5. Pourquoi c'est déjà viable

**Côté utilisateur**
- En ligne, gratuit, instantané, responsive (mobile + desktop), en français.
- Des scénarios d'exemple en 1 clic : on comprend la valeur sans réfléchir.

**Côté produit / S'investir**
- **Embarquable** dans vos articles : une page `/embed` fournit un widget en iframe, configurable par URL.
- **100 % aligné Evidence-Based Investing** : l'outil enseigne au lieu de faire miroiter.
- **Conforme** : pédagogique, hypothèses étiquetées, disclaimer permanent.

**Côté technique (fiabilité)**
- **Logique métier pure et testée** (suite de tests unitaires) → les calculs sont vérifiés.
- **Aucune dépendance externe qui casse** : dataset historique local par défaut, derrière une **abstraction de source de données** remplaçable. Le **prix temps réel** passe par un proxy serveur **mis en cache** ; s'il est indisponible, le bloc se masque sans rien casser.
- **Couche IA robuste** : conseil et voix gérés **côté serveur**, avec **repli automatique** en cascade (modèle texte, puis voix de secours, puis version locale déterministe) → la démo ne tombe jamais.

---

## 6. Limites assumées & suite

- Le **backtest** s'appuie sur un historique **approximatif** à but pédagogique (la *forme* des cycles, pas des cotations officielles). En revanche, le **cours affiché et le coach utilisent un prix temps réel** via une source publique.
- Pas de conseil personnalisé (volontaire : conformité).

**Prochaines étapes** : passer du coach au **copilote** en combinant données publiques (marché, déjà branché) et privées (objectifs, horizon, tolérance au risque de l'utilisateur — avec son consentement) ; partage d'un résultat en image ; backtest sur cotations officielles via la source de données déjà abstraite.

> En résumé : ce n'est pas une démo qui « fait joli ». C'est un outil **utilisable aujourd'hui**, **fiable**, **embarquable**, et pensé pour devenir le copilote crypto de S'investir.
