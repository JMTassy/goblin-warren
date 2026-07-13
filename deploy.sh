#!/bin/bash
# deploy.sh — one command, the three recurring deploy frictions baked in as defaults.
#   (1) never reuse a bundle URL (deploy engine caches source_game by URL string)
#   (2) logic.js platform shim always present (engine rejects zips without it)
#   (3) wait for raw-CDN propagation before handing the URL to deploy_game
# Usage:
#   ./deploy.sh          # auto-bump to next minor version
#   ./deploy.sh 1.12     # explicit version
# Non-sovereign tooling: builds + pushes a bundle and prints the deploy call.
# It never deploys by itself — the deploy_game call stays an operator/agent act.
set -euo pipefail
cd "$(dirname "$0")"

# --- version: explicit arg, or auto-bump past the highest existing bundle ---
if [ -n "${1:-}" ]; then
  V="$1"
else
  LAST=$(ls deploy/goblin-warren-v*.zip 2>/dev/null \
    | sed -E 's/.*-v([0-9]+)\.([0-9]+)?\.?zip/\1.\2/; s/\.$/\.0/' \
    | sort -t. -k1,1n -k2,2n | tail -1)
  MAJOR="${LAST%%.*}"; MINOR="${LAST##*.}"
  V="${MAJOR}.$((MINOR + 1))"
fi
ZIP="deploy/goblin-warren-v${V}.zip"
[ -f "$ZIP" ] && { echo "FATAL: $ZIP already exists — a used URL must never be reused"; exit 1; }

# --- build ---
# Bundle exactly the assets index.html + style.css reference, so the live
# site matches the working tree. The teaser video loads from the Higgsfield
# CDN at runtime (graceful fallback if blocked), so it needs no local file.
FILES=(index.html style.css game.js logic.js manifest.json bg.svg docs/concept-art/vision-05-root-hollow.jpeg bg/level2-glade.jpeg)
for f in "${FILES[@]}"; do [ -f "$f" ] || { echo "FATAL: missing $f"; exit 1; }; done
zip -q "$ZIP" "${FILES[@]}"
unzip -l "$ZIP" | grep -q ' logic.js' || { echo "FATAL: logic.js missing from bundle"; exit 1; }
LOCAL=$(stat -c%s "$ZIP")
echo "built $ZIP (${LOCAL} bytes)"

# --- commit + push ---
BRANCH=$(git branch --show-current)
git add "$ZIP"
git commit -q -m "deploy bundle v${V}"
git push -u origin "$BRANCH" >/dev/null 2>&1 || git push -u origin "$BRANCH"
echo "pushed to ${BRANCH}"

# --- wait for raw-CDN propagation ---
RAW="https://raw.githubusercontent.com/JMTassy/goblin-warren/${BRANCH}/${ZIP}"
echo "waiting for CDN propagation…"
for i in $(seq 1 45); do
  SZ=$(curl -sS -o /dev/null -w '%{size_download}' -L "$RAW" || echo 0)
  if [ "$SZ" = "$LOCAL" ]; then
    echo "READY after ~$((i*8))s"
    echo
    echo "source_game: $RAW"
    echo "game_id:     d95bb0da-52b9-4f6f-ace5-6f2645b98eae"
    exit 0
  fi
  sleep 8
done
echo "TIMEOUT: CDN still stale after ~360s — rerun with a new version"; exit 1
