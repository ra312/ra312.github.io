#!/bin/bash
# Build script for Lean 4 CV generator
# Generates the static site from Lean code using lake build

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="$REPO_ROOT/site"
DIST_DIR="$REPO_ROOT/dist"

echo "Building CV from Lean 4..."
cd "$SITE_DIR"

# Build the Lean project
echo "  Running lake build..."
lake build

# Run the build_site executable to generate HTML
echo "  Generating HTML..."
"$SITE_DIR/.lake/build/bin/build_site"

# Optional: Run verification
# echo "  Running verification..."
# "$SITE_DIR/.lake/build/bin/verify"

echo ""
echo "Build complete:"
echo "  Output: $DIST_DIR/index.html"
echo "  Assets: $DIST_DIR/assets/"
echo ""
