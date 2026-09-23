#!/usr/bin/env bash
# scripts/deploy.sh
#
# Runs the tests, builds, and prepares dist/ for GitHub Pages. Does NOT
# push anything -- publishing is the operator's step (MAYOR_RULING_V2.md
# Amendment 4: "chat approval does not lift the gate").
#
# What this script does:
#   1. npm ci (or npm install if no lockfile) -- reproducible deps
#   2. npm test -- vitest + playwright, must be green
#   3. npm run build -- vite build -> dist/
#   4. dist/.nojekyll -- so GitHub Pages serves files/dirs starting with "_"
#      and doesn't try to run Jekyll on the built output
#
# It prints what the operator does next; it never runs `git push`.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "== goblin-warren deploy: install =="
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "== goblin-warren deploy: test (vitest + playwright) =="
npm test

echo "== goblin-warren deploy: build =="
npm run build

echo "== goblin-warren deploy: prepare dist/ for Pages =="
touch dist/.nojekyll

echo
echo "dist/ is built and tested. This script did not push anything."
echo
echo "Operator, next steps:"
echo "  1. One-time: repo Settings -> Pages -> Source: 'gh-pages' branch, folder '/' (root)."
echo "     (Or switch Source to 'GitHub Actions' and add a workflow that runs this script"
echo "     and publishes dist/ -- either way, Pages is enabled by a human, not this script.)"
echo "  2. Publish dist/ to the gh-pages branch, e.g.:"
echo "       npx --yes gh-pages -d dist --dotfiles"
echo "     or push dist/ to gh-pages by hand -- your call, this script does not do it."
echo "  3. Confirm in Safari on an iPhone that https://<user>.github.io/goblin-warren/ shows"
echo "     the ground. A deploy only counts once that page is seen (VISION_V2.md §8/ Amendment 4),"
echo "     not when a push command returns 0."
