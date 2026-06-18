# 🎨 Design Tokens — Source de vérité UI/UX

> **Provenance** : tokens **extraits en direct** du CSS rendu de `https://simulateurs.sinvestir.fr/`
> (analyse navigateur + CDP, le 2026-06-18). Ce ne sont **pas** des approximations.
>
> Ce fichier est la **source de vérité du design**. Le code (Tailwind `@theme` / variables CSS)
> doit **référencer** ces tokens — jamais de couleur/typo en dur dispersée.
>
> Stack détectée côté S'investir : **Nuxt UI** (tokens sémantiques `--ui-*` + `--color-*`).
> On reproduit le **rendu**, pas la techno (nous : Next.js + Tailwind).

---

## 1. Typographie

| Rôle | Police | Usage |
|---|---|---|
| **Display / Titres** | `Plus Jakarta Sans` | `h1`, `h2`, sous-titres hero, valeurs de cartes |
| **Corps / UI** | `Lexend` | texte courant, boutons, labels, badges |

- Les deux sont sur **Google Fonts** (charger via `next/font/google`).
- **Hero `h1`** : `Plus Jakarta Sans`, poids `400`, `letter-spacing: -1.8px` (très serré), `line-height ≈ 1.2`. Taille ~46px (mobile) → plus grand en desktop.
- **Sous-titre** : 16px, `letter-spacing: -0.48px`, couleur `white/82%`.
- **Boutons** : `Lexend`, poids `300` (léger), `letter-spacing ≈ -0.28px`.

Échelle de tailles (rem) : `xs .75 / sm .875 / base 1 / lg 1.125 / xl 1.25 / 2xl 1.5 / 3xl 1.875 / 4xl 2.25 / 5xl 3 / 6xl 3.75 / 7xl 4.5`.

Poids : `light 300 · normal 400 · medium 500 · semibold 600 · bold 700`.

Tracking : `tight -.025em · normal 0 · wide .025em`.

---

## 2. Couleurs

### Fonds (surfaces sombres — navy)
| Token | Hex | RGB | Usage |
|---|---|---|---|
| `surface` | `#080C16` | `8 12 22` | fond principal de page |
| `surface-elevated` | `#00173F` | `0 23 63` | zones surélevées (bleu profond) |
| `surface-soft` | `#0F172A` | `15 23 42` | panneaux secondaires (slate-900) |
| `card` | `#030C24` @ 95% | `3 12 36` | fond des cartes |

### Marque & accents
| Token | Hex | Usage |
|---|---|---|
| **`brand-blue`** (CTA / action primaire) | `#0049C6` | boutons « Démarrer », « Créer un compte », accents |
| `brand-blue-deep` (décoratif) | `#2945A8` | formes/dégradés décoratifs |
| **`focus-ring`** | `#1098F7` | anneau de focus (accessibilité) |
| **`gold`** (logo « S² », valeurs mises en avant) | dégradé `#D6AA00 → #E4C031 → #FFEA8F → #E2BD2A` | aplat conseillé : `#E4C031` (base `#D6AB02`, highlight `#FFEA8F`) |

### Texte
| Token | Valeur | Usage |
|---|---|---|
| `text` | `#FFFFFF` | titres, texte principal |
| `text-subtle` | `rgba(255,255,255,0.82)` | sous-titres |
| `text-muted` | `#9CA3AF` (`156 163 175`) | libellés discrets, légendes |
| `text-badge` | `rgba(255,255,255,0.92)` | badges |

### Sémantique (résultats financiers)
| Token | Approx. hex | oklch (réel) | Usage |
|---|---|---|---|
| `success` (gains / plus-value) | `≈ #00C16A` | `oklch(72.3% .219 149.579)` | valeurs positives, +value |
| `error` (pertes / moins-value) | `≈ #EF4444` | `oklch(63.7% .237 25.331)` | valeurs négatives |
| `warning` | `≈ #F5B301` | `oklch(79.5% .184 86.047)` | alertes / disclaimers |
| `info` | `≈ #2563EB` | `oklch(62.3% .214 259.815)` | infos neutres |

> ⚠️ Le site original encode beaucoup de couleurs en **oklch** (via Nuxt UI). On peut reproduire
> fidèlement en hex/RGB ci-dessus ; conserver oklch est optionnel (large support en 2026).

---

## 3. Formes & élévation

| Élément | Valeur |
|---|---|
| Rayon de base (`--ui-radius`) | `0.25rem` (4px) |
| **Cartes** | `border-radius: 20px` |
| **Boutons / badges** | pilule (`rounded-full`) |
| Bordure carte | `1px solid rgba(255,255,255,0.10)` |
| Ombre carte | `inset 0 1px 0 rgba(255,255,255,0.04)`, `0 32px 80px rgba(0,0,0,0.30)` |
| Padding bouton (lg) | `18px 24px` |
| Padding bouton (sm/nav) | `12px 16px` |

---

## 4. Layout

- **Conteneur max** : `80rem` (1280px), centré.
- **Hauteur header** : `4rem` (64px).
- **Espacement de base** : `0.25rem` (échelle Tailwind standard).
- **Pattern simulateur** (observé dans l'aperçu produit) :
  - barre latérale sombre à gauche (navigation : Tableau de bord / Les simulateurs / Mes simulations) ;
  - **formulaire à gauche** (champ = libellé + valeur + unité `EUR`) ;
  - **cartes de résultats à droite** : grande valeur chiffrée + libellé discret + picto info ;
  - gains affichés en **vert**, montants secondaires en gris atténué.

---

## 5. Mapping cible → Tailwind (à câbler au scaffolding)

Centraliser dans `src/app/globals.css` (Tailwind v4 `@theme`) ou `tailwind.config` :

```
--color-surface:           #080C16;
--color-surface-elevated:  #00173F;
--color-surface-soft:      #0F172A;
--color-card:              #030C24;
--color-brand:             #0049C6;   /* CTA / primaire */
--color-brand-deep:        #2945A8;
--color-focus:             #1098F7;
--color-gold:              #E4C031;
--color-gold-hi:           #FFEA8F;
--color-text:              #FFFFFF;
--color-text-muted:        #9CA3AF;
--color-success:           #00C16A;
--color-error:             #EF4444;
--color-warning:           #F5B301;
--font-display:            "Plus Jakarta Sans";
--font-sans:               "Lexend";
--radius-card:             20px;
```

> Règle : **aucune** couleur hex en dur dans les composants — toujours via ces tokens
> (`bg-surface`, `text-muted`, `text-success`, `font-display`…).
