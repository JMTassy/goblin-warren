# Item & Relic Icons — generated batch (medium scope)

<!-- authority=false · claim=NO_CLAIM · reference art, not shipped assets -->
<!-- Generated via Higgsfield MCP (recraft_v4_1, standard, 2k), 2026-07-12.
     Hosted remotely on Higgsfield's CloudFront bucket — not downloaded into
     this repo (this session's egress policy denies fetching that host
     directly; same reason `style.css`'s world-scene layer references its
     art by URL rather than a bundled file). If these get wired into the
     game later, follow that same pattern: remote URL, `#120e22` (or flat
     color) fallback, "play never depends on it." -->

Locked palette used across the set (matches the design sheet — NEON cyan /
warm ORANGE / LEAF green / deep purple): `#4DEEEA` `#FF8C42` `#7CFC8A`
`#5B2A86`, flat background `#120e22` (same hex as `#world`'s CSS fallback
color).

Picked from the CHIDDUSH "more items for the map" list at **medium** scope —
6 of the ~15 proposed items, non-boss only. The four boss relics
(Unmasking Mask, Silent Bell, Bone Offering, Witness Stone) are **not**
generated here — they're parked with the Temple Bosses themselves pending
the operator's punishment-law ruling (`PARKED_CHIDDUSHIM.md` #10); no sense
minting relic art for characters that don't have bodies or a ruling yet.

| Item | Category | Hosted URL |
|---|---|---|
| Serpent Coil | Environmental | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_190954_190a0753-be81-485e-a3bc-219c611b33da.png |
| Memory Lantern | Environmental | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_190955_df4aae82-85f2-4679-8e86-5ad6ac5cb0d8.png |
| Verdict Circle | Environmental | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_190957_cd8db180-4569-4e91-aaad-47cc4ddf561c.png |
| Solfeggio Shard | Relic icon | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_190958_2851913e-f8e5-451a-aeff-a4f2b94e3bde.png |
| Mycelial Knot | Relic icon | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_190959_e8def8d4-5f3b-4c8d-9520-48bdff7c358d.png |
| Verdict Seal | Relic icon | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_191001_de98c45f-44c4-4752-8ab6-bdea2cf4a52b.png |

**Cost:** 1.25 credits each (recraft_v4_1, 2k) — 6 × 1.25 = 7.5 credits total.

## Status: CANDIDATE art, not wired

None of these are referenced by `index.html`/`game.js`/`style.css` yet — no
inventory or item-icon rendering system exists in the reducer or UI zone.
Wiring any of these in is a *new bounded mechanic* (item pickups, an
inventory panel, or environmental decoration layers) and needs its own
slice + selftest gate per the `/warren` scaling law, not a silent CSS drop.

## Where they'd land (if the order reaches them)
- Serpent Coil, Memory Lantern, Verdict Circle → environmental decoration
  layer for `#world` (art direction note already flagged for STEP 4, the
  Aquarium, in `PARKED_CHIDDUSHIM.md`).
- Solfeggio Shard, Mycelial Knot, Verdict Seal → candidate relic icons for
  a future claimable-receipt tray (`/warren` slice 7).

*Six items, no rulers added.* 🍄

## Temple Boss masks (original design, not sourced from reference photos)

<!-- Generated 2026-07-12, same session, same hosting/status caveats as
     above. Answers PARKED_CHIDDUSHIM.md #12: the operator sent five
     photographs of real museum-held African ceremonial artifacts (a
     Kongo-style nail/power figure, what appears to be a Benin bronze
     figure, and several reliquary-guardian mask heads, shot through
     display glass) as a generation brief. Declined to use those
     specific objects as templates — see #12 for the reasoning (living
     sacred ritual objects, one plausibly implicated in the Benin
     Bronzes repatriation dispute; not folklore in the public domain).
     What's generated here instead carries over the *technique* the
     reference research named (exaggerated symbolic eyes, transformation-
     through-wearing, weight/stillness as presence) as **original**
     goblin-warren forms — no copied silhouette, headdress shape, or
     iconography from any of the five reference photos. -->

One mask per boss, "neutral" mood variant only (no mood-state sheet yet).
Palette is per-boss (matches each boss's described aura), not the shared
item palette above — the design notes ask for these to read "less cute,
more mythic" than regular Warren art.

| Boss | Aura | Hosted URL |
|---|---|---|
| Rââm the Unmasker | cracked red/black, horned | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_200459_ee77a9e0-cdb5-45aa-8bd0-58d13c36ee2f.png |
| Seren the Silent | smooth silver-blue, closed-eyed | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_200501_037b7c5f-b8dc-4298-b79c-8cf4451dc77a.png |
| Mâa the Bone-Bearer | earthy red/brown/bone, warm orange glow | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_200502_d698c68d-9ff1-4e47-b02b-a2506318c77e.png |
| Orr the Witness | pale stone, wide eyes, near-colorless | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_200503_f4b67acb-3704-4e2e-b2d7-2f24ad0a6292.png |

**Cost:** 1.25 credits each — 4 × 1.25 = 5 credits.

**Status: CANDIDATE art, still gated behind #10.** These are single
neutral-mood reference images, not full character sheets (idle
animation, manifestation effect, per-mood variants). More importantly:
Seren, Mâa, and Orr still don't have game bodies, and the punishment-law
conflict in their specs (#10) is unruled. This art doesn't unblock that —
it's ready *for when* the ruling lands, same as everything else at #10.
