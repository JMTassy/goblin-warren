authority=false · claim=NO_CLAIM · non-sovereign
status: PROPOSED (offre) · NOM SCELLÉ : LE LIVRABLE GOUVERNÉ (seal: JM, 2026-08-02)

# SPEC — The Governed Deliverable, v0

Normative specification. Mechanics are in English; every string a client reads
is in French, and both are given where a term crosses the boundary.

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY**
are used in their ordinary normative sense. A document that violates a MUST is
not a governed deliverable and **MUST NOT** carry the guarantee sentence (§4)
or the posture strip (§6).

---

## 1. Scope

This spec governs the *form* of a client-facing deliverable — proposal,
strategy document, creative recommendation, campaign bilan, audit verdict. It
governs neither the craft of the hero layer nor the substance of the
recommendation. It is an epistemic container, not a house style.

A governed deliverable has exactly two layers, defined in §2. Any document
claiming conformance **MUST** carry both.

---

## 2. The layering rule (non-negotiable)

**L0 — LA COUCHE HÉROS (hero layer).**
The hero layer **MUST** remain render-led, no-bullets, image-first, exactly as
house deck grammar already requires. The ledger **MUST NOT** leak into it.
Specifically, the hero layer **MUST NOT** contain posture tags, receipt lines,
source URLs, footnote markers, hedging qualifiers, or confidence percentages.

The hero layer **MUST** be readable, and persuasive, with the annex removed.
If removing the annex makes the hero layer feel unsupported, the fault is in
the hero layer's claims, not in the annex — and the claims **MUST** be
rewritten, not propped up with citations.

**L1 — LE REGISTRE (ledger annex).**
The ledger **MUST** be an annex: after the hero layer, in the same file or
deck, never interleaved. It carries the five blocks of §5.

**The one permitted bridge** between the layers is the posture strip (§6): a
small glyph row that lets a reader see the epistemic state of a page at a
glance without breaking the render-led surface. Nothing else crosses.

Rationale: the two layers fail differently. A hero layer polluted with caveats
sells nothing. A ledger softened for beauty proves nothing. Keeping them apart
is what lets both be maximal.

---

## 3. Posture vocabulary

Every claim in the ledger **MUST** carry exactly one posture. The vocabulary is
closed — a document **MUST NOT** introduce a sixth posture, and **MUST NOT**
use adjacent words ("likely", "estimated", "circa") as substitutes for a
posture.

| Posture (EN, mechanics) | Client-facing (FR) | Means | Requires a receipt? |
|---|---|---|---|
| `OBSERVED` | **constaté** | Read directly in a named source. The strongest posture available. | **MUST** |
| `INFERRED` | **déduit** | Derived by reasoning from stated observed facts. The derivation **MUST** be stated in one line. | **MUST** cite the observed legs |
| `PROPOSED` | **proposé** | Our recommendation or hypothesis. Ours, not the world's. | **MUST NOT** carry a receipt implying external support |
| `UNKNOWN` | **à établir** | Named as open. Not omitted, not softened. | **MUST** state what would close it |
| `USER_DECLARED` | **déclaré par le client** | Asserted by the client and carried unverified. Not the same as observed. | **MUST** name the declaration, not a document |

**`constaté` is not a hedge; it is a flex.** Copy **SHOULD** be tuned so that a
sourced claim reads as strength and an unsourced one as candour. Postures
**SHOULD** be typeset as small caps or a distinct weight, never as a warning
colour. A posture is a credential, not an alarm.

### 3.1 The « à chiffrer » rule

Where a figure is expected and no source supports it, the document **MUST**
print **« à chiffrer »** in place of the figure. It **MUST NOT**:

- invent a number,
- carry a number from a comparable case as if it were this case's,
- replace the number with an adjective ("significant", "strong", "important"),
- or delete the line so the absence becomes invisible.

**« à chiffrer » is a commitment, not an apology.** It **SHOULD** be followed by
what would produce the number and at whose cost. A governed deliverable that
contains zero occurrences of « à chiffrer » **SHOULD** be re-audited: total
sourcing is more often a symptom of missing questions than of complete work.

### 3.2 Receipt grammar

A receipt **MUST** carry three fields, in this order:

```
source · date · as_of
```

- **source** — the named artifact, not a category. *"Bilan partenariat X 2023"*,
  not *"internal data"*.
- **date** — when we read it. Reading date, not publication date.
- **as_of** — the period the claim is true of.

`as_of` is the field that does the work: **a 2019 forecast is not a 2026
truth.** Where `as_of` precedes the deliverable's own date by more than one
business cycle, the document **SHOULD** say so in the receipt line and
downgrade any claim of present-tense validity from `constaté` to `déduit`.

Receipts **MUST NOT** contain personal data, private contact details, or any
material fenced by the corpus protocol. A receipt that cannot be printed
without exposing such material **MUST** be rendered as a category with the
exclusion noted — *"correspondance interne, non citée"* — and the claim it
supports **MUST** be downgraded to `déclaré par le client` or `à établir`.

---

## 4. The guarantee sentence

Every governed deliverable **MUST** carry this sentence, unaltered, signed, on
the cover or the first page:

> « Aucun chiffre de ce document n'a été produit sans source. Tout ce qui n'est
> pas sourcé est marqué "à chiffrer". Ce que nous avons écarté est en annexe,
> avec les raisons. »

Rules:

- The sentence **MUST NOT** be paraphrased, shortened, or softened. Its value
  is that it is identical everywhere and therefore checkable everywhere.
- It **MUST** be signed — house and named author. An unsigned guarantee is
  decoration.
- It **MUST NOT** appear on a document that fails any MUST in this spec. The
  sentence is cheap to print and ruinous to fake; printing it falsely once is
  worse than never having offered it.
- Any recipient **MAY** audit it. The house **SHOULD** state that it welcomes
  the audit, since the guarantee's whole worth is that the audit would pass.

---

## 5. The five annex blocks

The ledger annex **MUST** contain these five blocks, in this order. A block
with nothing in it **MUST** still appear, stating that it is empty and why —
an absent compost annex is indistinguishable from a hidden one.

### A1 — REGISTRE DES POSTURES · *posture register*

Every claim the hero layer makes, restated in one line, each with exactly one
posture from §3. Claims **MUST** be listed in hero-layer reading order so a
reader can walk the two layers in parallel.

### A2 — REGISTRE DES REÇUS · *receipts*

One receipt per claim, in the `source · date · as_of` grammar of §3.2.

A1 and A2 **MAY** be rendered as a single table with `claim | posture | receipt`
columns, and **SHOULD** be, for documents under roughly thirty claims. They are
specified as two blocks because they fail independently: a posture without a
receipt is an opinion, a receipt without a posture is a footnote.

### A3 — L'ANNEXE COMPOST · *what was refused, and why*

Directions considered and **denied**, each with its reason. This block
**MUST NOT** be omitted for brevity and **MUST NOT** be reduced to a list of
straw options that were never live.

Each entry **MUST** carry: the direction, the reason for refusal, and — where a
refusal was driven by a figure — that figure with its receipt, or « à chiffrer ».

**This block is billable.** Denials are the concentrated work; the client is
paying for what was refused on their behalf, and this is the only artifact that
shows it. A deliverable without a compost annex has sold the client only the
surviving option and charged them for the whole search.

### A4 — L'ANNEXE BROUILLARD · *what is held open*

What is genuinely undecided, **named rather than omitted**. Each entry
**MUST** state: what is open, why it is open, what would close it, and who
would have to act. Entries **MUST NOT** be silently dropped in a later version;
a fog entry that disappears **MUST** be shown resolved in A1 or restated in A3.

Fog is not weakness. It is the difference between a document that has looked
and one that has not.

### A5 — LA BOÎTE FALSIFIABLE · *the central bet*

Exactly one central bet per deliverable — **the** claim on which the
recommendation stands or falls. The block **MUST** carry:

1. **Le pari** — the bet, in one sentence.
2. **Ce qui l'infirmerait** — the concrete observation that would disprove it.
   This **MUST** be an observation that could actually occur, and **MUST NOT**
   be phrased so that no realistic outcome could satisfy it.
3. **Le test a-t-il été mené ?** — run / not run, with the verdict if run and
   the cost and owner of running it if not.

A bet whose disproof condition cannot be stated **MUST** be downgraded to
`proposé` and moved out of A5, leaving A5 stating that no falsifiable central
bet was identified. That statement is itself informative and **MUST** be
printed rather than the block quietly omitted.

---

## 6. The posture strip

The posture strip is a small original glyph row, placed discreetly on hero-layer
pages, letting a reader see epistemic state without reading the annex.

| Glyph | EN | FR (client-facing) | Meaning |
|---|---|---|---|
| 🔑 | admitted | **admis** | Sourced and carried into the recommendation. |
| 🍂 | composted | **composté** | Considered, refused, reason recorded in A3. |
| 🌫️ | held | **en suspens** | Open, named in A4, not decided. |
| 🌱 | seed | **piste** | Early, promising, not yet tested. |
| 🧾 | receipt | **reçu** | A receipt exists for this page's figures. |

Rules:

- The strip **MUST** use only these five glyphs and **MUST NOT** be extended
  per-project. Its value is that it means the same thing across every
  deliverable the house signs.
- The glyph grammar is original to the house and **MUST** stay IP-safe: no
  third-party icon sets, no borrowed pictograms, no game or brand marks.
- The strip **SHOULD** be small enough to read as a typographic ornament and
  **MUST NOT** acquire a legend on the hero layer — the legend lives in the
  annex, once.
- Glyphs **MUST** be consistent with A1–A5. A page carrying 🧾 whose figures are
  absent from A2 is a non-conformance.

---

## 7. Conformance checklist

A document conforms when all of the following are true:

- [ ] Hero layer render-led, no bullets, zero posture or receipt marks (§2).
- [ ] Ledger present as an annex, not interleaved (§2).
- [ ] Every hero-layer claim restated in A1 with exactly one closed-vocabulary
      posture (§3, §5).
- [ ] Every `constaté` and `déduit` claim carries a `source · date · as_of`
      receipt in A2 (§3.2).
- [ ] Every expected-but-unsourced figure prints « à chiffrer » (§3.1).
- [ ] A3, A4, A5 all present, populated or explicitly stated empty with reason (§5).
- [ ] A5 states a disproof condition that could actually occur (§5).
- [ ] Guarantee sentence present, unaltered, signed (§4).
- [ ] Posture strip uses only the five house glyphs and matches A1–A5 (§6).
- [ ] No personal data, no fenced material, in any receipt (§3.2).

---

## 8. Non-conformance — what voids the guarantee

Any one of the following voids the guarantee sentence and **MUST** cause it to
be removed from the document before delivery:

1. A number in the hero layer with no receipt in A2 and no « à chiffrer ».
2. A figure carried from a comparable case as if it belonged to this one.
3. A compost annex that omits a direction that was genuinely considered and
   refused.
4. A fog entry deleted between versions without resolution.
5. A falsifier written so that nothing could disprove it.
6. The guarantee printed on a document whose author has not read the sources
   cited in A2.

Non-conformance is recorded, not concealed. The correct response to a discovered
violation is a corrected version **plus** a line in the ledger saying what was
wrong — which is the same discipline the house already practises when it prints
its own `AXES D'AMÉLIORATION` to a client's face.

---

## 9. Status

**PROPOSED.** This spec is a proposal for the operator's seal. It is not house
law until JM Tassy admits it explicitly. Version, naming, and pricing of any
product built on it remain the operator's to grave.
