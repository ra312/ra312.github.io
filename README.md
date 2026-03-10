# ra312.github.io

Personal academic site of Dr Rauan Akylzhanov.

Built from CV via `build_site.sh`. Pure static HTML — no build step, no framework.

## Deploy

```bash
# First time
git init
git remote add origin git@github.com:ra312/ra312.github.io.git
git checkout -b main

# Every update
git add -A
git commit -m "update site"
git push -u origin main
```

GitHub Pages will serve `index.html` from the `main` branch root automatically.
