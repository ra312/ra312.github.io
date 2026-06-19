#!/usr/bin/env bash
# tex2blog.sh — Convert a LaTeX file to a blog-ready Markdown file.
#
# Usage:
#   ./scripts/tex2blog.sh <input.tex> <slug>
#
# Output:
#   blog/posts/<slug>.md
#
# Requirements: pandoc (brew install pandoc)

set -euo pipefail

INPUT="${1:-}"
SLUG="${2:-}"

if [[ -z "$INPUT" || -z "$SLUG" ]]; then
  echo "Usage: $0 <input.tex> <slug>" >&2
  exit 1
fi

if ! command -v pandoc &>/dev/null; then
  echo "Error: pandoc is not installed. Run: brew install pandoc" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT="$REPO_ROOT/blog/posts/${SLUG}.md"

# Extract \title{...} for the H1 header
TITLE=$(grep -m1 '\\title{' "$INPUT" | sed 's/.*\\title{//;s/}.*//;s/\\textbf{//g;s/}//g' || true)

# Run pandoc: latex → markdown, keep display math as $$..$$
pandoc "$INPUT" \
  --from=latex \
  --to=markdown \
  --wrap=none \
  -o "$OUTPUT"

# Prepend H1 title if found
if [[ -n "$TITLE" ]]; then
  TMP=$(mktemp)
  printf "# %s\n\n" "$TITLE" | cat - "$OUTPUT" > "$TMP"
  mv "$TMP" "$OUTPUT"
fi

# Clean up bibliography fenced div
node - "$OUTPUT" <<'NODE'
const fs = require('fs');
const path = process.argv[1];
let md = fs.readFileSync(path, 'utf8');
md = md.replace(/::: thebibliography\n\d+\n\n/, '## References\n\n');
md = md.replace(/\n:::\s*$/, '\n');
fs.writeFileSync(path, md);
NODE

echo "Written: $OUTPUT"
