authority=false · claim=NO_CLAIM · non-sovereign
status: PROPOSED (offre) · NOM SCELLÉ : LE LIVRABLE GOUVERNÉ (seal: JM, 2026-08-02)

# TEMPLATE — Governed one-pager / proposal

Fill-in skeleton conforming to `SPEC.md` v0. Labels are bilingual: **French is
what the client reads**, English in *italic* is the mechanic and is deleted
before delivery. Every slot states its **expected posture**; if the real posture
comes out weaker than expected, keep the weaker one — the expectation is a
prompt, never a target.

Delete every line in `⟨angle brackets⟩` and every `— attendu :` note before
sending. Do **not** delete a block because it is empty: state that it is empty
and why (SPEC §5).

---
---

# L0 — LA COUCHE HÉROS · *hero layer*

> ⟨Render-led. No bullets. Image-first. No posture tags, no receipts, no
> footnote markers, no hedging adverbs. This layer must persuade with the annex
> removed. If it cannot, rewrite the claims — do not add citations here.⟩

## ⟨TITRE⟩

⟨One-line proposition. Present tense. No qualifier.⟩

**Le constat** — *the situation*
⟨2–3 sentences. Only what is sourced. — attendu : `constaté`⟩

**La bascule** — *the turn*
⟨1–2 sentences. Why now. — attendu : `déduit`⟩

**Ce que nous proposons** — *the recommendation*
⟨2–3 sentences. Ours, and said as ours. — attendu : `proposé`⟩

**Ce que cela produit** — *the outcome*
⟨Effects. Every figure here is either receipted in A2 or printed
« à chiffrer ». — attendu : `constaté` / `à établir`⟩

⟨Posture strip, discreet, bottom of page — glyphs only, no legend:⟩
`🔑 🍂 🌫️ 🌱 🧾`

---

### La garantie · *the guarantee* — verbatim, signed, cover or first page

> « Aucun chiffre de ce document n'a été produit sans source. Tout ce qui n'est
> pas sourcé est marqué "à chiffrer". Ce que nous avons écarté est en annexe,
> avec les raisons. »

⟨Maison⟩ · ⟨Auteur⟩ · ⟨Date⟩

---
---

# L1 — LE REGISTRE · *ledger annex*

Légende des postures · *posture legend* — printed once, here, never on L0.

| Posture | Sens | Reçu exigé |
|---|---|---|
| **constaté** *(OBSERVED)* | lu directement dans une source nommée | oui |
| **déduit** *(INFERRED)* | raisonné à partir de faits constatés | les jambes constatées |
| **proposé** *(PROPOSED)* | notre recommandation, notre hypothèse | non |
| **à établir** *(UNKNOWN)* | ouvert, nommé, non refermé | ce qui le refermerait |
| **déclaré par le client** *(USER_DECLARED)* | affirmé par le client, non vérifié | la déclaration |

Légende des glyphes · *glyph legend* —
🔑 admis · 🍂 composté · 🌫️ en suspens · 🌱 piste · 🧾 reçu

---

## A1 + A2 — REGISTRE DES POSTURES ET DES REÇUS · *posture register + receipts*

⟨One row per hero-layer claim, in hero-layer reading order. Receipt grammar:
`source · date de lecture · as_of`.⟩

| # | Affirmation · *claim* | Posture | Reçu · *receipt* |
|---|---|---|---|
| 1 | ⟨claim, one line⟩ | constaté | ⟨source⟩ · lu ⟨date⟩ · as_of ⟨période⟩ |
| 2 | ⟨claim⟩ | déduit | déduit de ⟨#1⟩ + ⟨#n⟩ — ⟨derivation in one line⟩ |
| 3 | ⟨claim⟩ | proposé | — *(recommandation ; aucun reçu externe)* |
| 4 | ⟨figure expected, none sourced⟩ | à établir | **à chiffrer** — ⟨what would produce it, at whose cost⟩ |
| 5 | ⟨client assertion⟩ | déclaré par le client | ⟨declaration, dated ; not a document⟩ |

⟨Rappel : aucun reçu ne contient de données personnelles. Une source
impossible à citer sans exposer ces données est nommée par catégorie et
l'affirmation est rétrogradée.⟩

---

## A3 — L'ANNEXE COMPOST · *what we refused, and why*

⟨Directions genuinely considered and denied. Not straw options. This is the
concentrated work and it is billable — the client is paying for what was
refused on their behalf.⟩

| Direction écartée | Raison du refus | Chiffre à l'appui |
|---|---|---|
| ⟨direction⟩ | ⟨reason, specific⟩ | ⟨figure + receipt⟩ / **à chiffrer** |
| ⟨direction⟩ | ⟨reason⟩ | — |

⟨If empty: « Aucune direction écartée à ce stade » + why that is credible.⟩

---

## A4 — L'ANNEXE BROUILLARD · *what we hold open*

⟨Named, not omitted. Four fields each, all required.⟩

**🌫️ ⟨Question ouverte 1⟩**
- Pourquoi c'est ouvert : ⟨reason⟩
- Ce qui le refermerait : ⟨the observation or document that would close it⟩
- Qui doit agir : ⟨us / client / third party⟩
- Posture : à établir

**🌫️ ⟨Question ouverte 2⟩**
- Pourquoi c'est ouvert : ⟨reason⟩
- Ce qui le refermerait : ⟨…⟩
- Qui doit agir : ⟨…⟩
- Posture : à établir

⟨A fog entry never disappears silently: it is resolved into A1 or moved to A3.⟩

---

## A5 — LA BOÎTE FALSIFIABLE · *the central bet*

⟨Exactly one bet. The claim on which the recommendation stands or falls.⟩

**Le pari** — ⟨one sentence. — attendu : `déduit` or `proposé`⟩

**Ce qui l'infirmerait** — ⟨a concrete observation that could actually occur.
If no realistic outcome could satisfy this line, the bet is not falsifiable:
downgrade it to `proposé`, move it out of A5, and say so here.⟩

**Le test a-t-il été mené ?**
- ☐ Oui — verdict : ⟨survived / refuted⟩ · reçu : ⟨source · date · as_of⟩
- ☐ Non — coût pour le mener : ⟨cost / **à chiffrer**⟩ · qui le mènerait : ⟨owner⟩

---

## Contrôle de conformité · *conformance check* — internal, delete before delivery

- [ ] L0 render-led, sans puces, sans postures ni reçus
- [ ] Registre en annexe, jamais entrelacé
- [ ] Chaque affirmation de L0 reprise en A1, une seule posture
- [ ] Chaque `constaté` / `déduit` porte un reçu `source · date · as_of`
- [ ] Chaque chiffre attendu et non sourcé porte « à chiffrer »
- [ ] A3, A4, A5 présents — remplis, ou déclarés vides avec la raison
- [ ] A5 énonce une infirmation réellement possible
- [ ] Garantie présente, mot pour mot, signée
- [ ] Bandeau de postures : les cinq glyphes maison, cohérents avec A1–A5
- [ ] Aucun reçu ne contient de donnée personnelle ou de matière sous embargo
