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

## 4. L'assistant en langage naturel + le coach

- **Pré-remplir en une phrase** : tapez par exemple *« 200 € par mois sur Bitcoin depuis 2020 »* → le formulaire se remplit tout seul.
- **Coach S'investir IA** : posez une question (« quel est le risque ? », « pourquoi le DCA ? ») → il répond **à partir de vos chiffres réels**, en restant **pédagogique** (jamais de conseil personnalisé, secteur régulé oblige). Une voix peut lire la réponse.

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
- **Aucune dépendance externe qui casse** : dataset historique local par défaut, derrière une **abstraction de source de données** remplaçable (on peut brancher une API marché sans toucher à l'interface).
- **Couche IA optionnelle** : si une clé est absente ou en erreur, l'assistant **bascule automatiquement** sur une version locale fiable → la démo ne tombe jamais.

---

## 6. Limites assumées & suite

- Données historiques **approximatives** à but pédagogique (pas un flux temps réel).
- Pas de conseil personnalisé (volontaire : conformité).

**Prochaines étapes** : conseil IA branché sur un vrai modèle (déjà câblé, prêt à activer), partage d'un résultat en image, et à terme un copilote qui combine données publiques (marché) et privées (objectifs de l'utilisateur, avec consentement).

> En résumé : ce n'est pas une démo qui « fait joli ». C'est un outil **utilisable aujourd'hui**, **fiable**, **embarquable**, et pensé pour devenir le copilote crypto de S'investir.
