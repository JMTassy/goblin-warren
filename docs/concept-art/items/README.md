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
| Mycelial Knot | Relic icon | https://d8j0ntlcm91z4.cloudfront.net/user_2wU5kU3oaVS8fuAOpu5gO44KSqx/hf_20260712_191001_de98c45f-44c4-4752-8ab6-bdea2cf4a52b.png |
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
