# Profile in Lean 4

This profile is generated from a Lean 4 program that encodes the CV as typed data and renders it to HTML.

## Architecture

- **`site/Profile/Data.lean`**: CV data types (Pub, Job, Degree, Talk, Grant, Teaching) and CV structure
- **`site/Profile/CV.lean`**: Complete CV instance with 14 publications, all sections (research, experience, education, talks, funding, teaching)
- **`site/Profile/Html.lean`**: HTML DSL with proper escaping, void tag handling, and render function
- **`site/Profile/Render.lean`**: Rendering logic: CV → HTML for each section, with dynamic year grouping
- **`site/Profile/Verified.lean`**: Theorems about the CV (contiguous pub numbers, non-empty links, etc.) — currently contains `sorry`, to be filled with real proofs
- **`site/Main.lean`**: Executable that writes `dist/index.html` and copies CSS

## Building

```bash
./scripts/build.sh
```

Generates:
- `dist/index.html` (20 KB, minified)
- `dist/assets/site.css` (copied from `site/assets/site.css`)

All content matches the original index.html: structure, nav, all publications (14), sections, metadata.

## Status

- ✅ `lake build` succeeds
- ✅ All CV data in Lean structures
- ✅ HTML rendering complete (all sections, all links)
- ✅ CSS and assets copied
- ✅ Build script for CI/CD
- ⏳ Verified.lean proofs (blocked by current `sorry`)
- ⏳ LeanInk + Alectryon integration (next phase)
- ⏳ GitHub Actions workflow update

## Next Steps

1. **Replace `sorry` in Verified.lean** with real proofs using `decide`/`simp` over the concrete CV data.
2. **Integrate LeanInk** to render Verified.lean with type information and proofs.
3. **Update `.github/workflows/static.yml`** to:
   - Install elan (Lean version manager)
   - Run `./scripts/build.sh`
   - Upload `dist/` instead of repo root
4. **Optional cleanup**: Remove stale `public/`, duplicate blog posts, empty `.hugo_build.lock`.

## Toolchain

- Lean 4.34.1 (pinned in `site/lean-toolchain`)
- Lake 5.0.0 (Lean package manager)
- Node.js (for blog API, unchanged)

## Blog Integration

Blog remains client-side (marked + KaTeX). Publishing via `api/publish.js` commits posts and updates `blog/manifest.json`, which triggers the Pages workflow to rebuild the profile.
