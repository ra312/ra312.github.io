# ra312.github.io

Personal academic site of Dr Rauan Akylzhanov.

Built from CV via `build_site.sh`. The site is mostly **pure static HTML** (no framework). The **blog** adds a small optional **Vercel** deployment for GitHub OAuth and publishing (see below).

## Deploy (GitHub Pages)

The [GitHub Actions workflow](.github/workflows/static.yml) deploys the site to GitHub Pages from the **`academic`** branch.

```bash
git checkout academic
git add -A
git commit -m "update site"
git push origin academic
```

If you use another default branch locally, create or merge into `academic` before pushing. Pages serves the site root (`index.html`, `blog/`, etc.).

## Blog

### Layout

| Path | Purpose |
|------|---------|
| [`blog/manifest.json`](blog/manifest.json) | Index of posts (`slug`, `title`, `date`, `visibility`, `contentPath`) |
| [`blog/posts/`](blog/posts/) | **Public** posts as Markdown (`.md`) |
| [`blog/private/`](blog/private/) | **Private** posts as encrypted JSON (ciphertext only; never plaintext) |
| [`blog/index.html`](blog/index.html) | Blog listing |
| [`blog/post.html`](blog/post.html) | Single post (public Markdown or decrypt private JSON) |
| [`blog/admin.html`](blog/admin.html) | Publish UI (GitHub sign-in + API) |
| [`blog/crypto.js`](blog/crypto.js) | Web Crypto helpers (AES-GCM + PBKDF2) for private posts |

### Public posts

1. **Git:** Add `blog/posts/<slug>.md`, add an entry to `blog/manifest.json` with `"visibility": "public"`, commit, and push to **`academic`**.
2. **Web:** After configuring the API (below), open [`blog/admin.html`](blog/admin.html), sign in with GitHub, choose **Public**, and publish.

### Private posts (author-only)

Private bodies are encrypted **in the browser** with a **single master password** before upload. The server and git history only see ciphertext.

1. **Web:** In [`blog/admin.html`](blog/admin.html), set `window.BLOG_API_BASE` to your Vercel URL (see below), sign in with GitHub, choose **Private**, enter the **master password** and Markdown body, then publish.
2. **Reading:** Open [`blog/index.html`](blog/index.html) or a private post URL. Enter the same master password when prompted (stored only for the **browser session** in `sessionStorage`).

**Security note:** This is appropriate for “only me” casual privacy on a static site. It is not banking-grade isolation (anyone with the encrypted file could try offline guesses).

### Publishing API (Vercel)

GitHub Pages cannot commit to your repo by itself. The repo includes serverless handlers under [`api/`](api/) (Node.js) for **GitHub OAuth** and **`POST /api/publish`**.

1. **Create a GitHub OAuth App** (Settings → Developer settings):  
   - **Authorization callback URL:** `https://<your-vercel-app>.vercel.app/api/callback`  
   - **Homepage URL:** your Pages site or repo URL.

2. **Deploy this repository to [Vercel](https://vercel.com)** (import the repo; no build command required for the API). Set environment variables:

   | Variable | Description |
   |----------|-------------|
   | `GITHUB_CLIENT_ID` | OAuth App client ID |
   | `GITHUB_CLIENT_SECRET` | OAuth App client secret |
   | `JWT_SECRET` | Long random string for signing session cookies |
   | `OAUTH_REDIRECT_URL` | Must match the OAuth app exactly, e.g. `https://<project>.vercel.app/api/callback` |
   | `REPO_OWNER` | GitHub username or org |
   | `REPO_NAME` | Repository name (e.g. `ra312.github.io`) |
   | `TARGET_BRANCH` | `academic` (must match Pages deploy branch) |
   | `ALLOWED_GITHUB_USER` | *(Optional)* Your GitHub login; if set, only this user can publish |

3. **Configure the static site:** In [`blog/admin.html`](blog/admin.html), set:

   ```html
   <script>
     window.BLOG_API_BASE = 'https://<your-vercel-app>.vercel.app';
   </script>
   ```

   Commit and push to **`academic`**. Open `…/blog/admin.html` on GitHub Pages, click **Sign in with GitHub**, then publish.

**CORS / cookies:** The publish API sets an **HttpOnly** session cookie on the Vercel origin. Your browser must send `credentials: 'include'` to `POST /api/publish` (the admin page does this). Use **HTTPS** on both Pages and Vercel.

### Password authentication

The new [`blog/editor.html`](blog/editor.html) interface supports **password-based authentication** as an alternative to GitHub OAuth. This is simpler for local development and writing without needing GitHub configuration.

#### Manage password

1. **Generate a new password hash:**
   ```bash
   node scripts/generate-password-hash.js "your-desired-password"
   ```
   This outputs `BLOG_PASSWORD_HASH` and `BLOG_PASSWORD_SALT` (never share these values).

2. **Locally:** Update `.env.local` with the output values and restart the dev server.

3. **Production (Vercel or another server):** Add environment variables in your deployment settings:
   - `BLOG_PASSWORD_HASH` (base64-encoded)
   - `BLOG_PASSWORD_SALT` (base64-encoded)
   - `JWT_SECRET` (random string for session tokens)
   - `REPO_OWNER` (GitHub username or org)
   - `REPO_NAME` (repository name)
   - `TARGET_BRANCH` (`academic`)
   - `GITHUB_TOKEN` (personal access token with repo write permissions)

> Password auth now publishes to the repo using `GITHUB_TOKEN` so posts are actually saved and then served by GitHub Pages.

#### Features

- **Live preview:** Markdown + LaTeX math rendering (`$...$` for inline, `$$...$$` for display)
- **References:** Built-in citation management
- **Public/Private:** Choose visibility; private posts encrypt client-side before upload
- **Session-based:** Password is only stored in the browser session, cleared on logout
- **Delete support:** Test posts can be deleted from the editor using the delete button

#### Using the editor

1. Open `…/blog/editor.html`
2. Click "Sign In with Password" and enter your password
3. Write in Markdown with LaTeX support
4. Add references as needed
5. Choose visibility (public/private)
6. Publish

**Security note:** For local testing, see `.env.local.example`. The password hash uses PBKDF2 with 100,000 iterations. Store environment variables securely in Vercel.

### Owner-only publishing

Only the GitHub account that completes OAuth with **`repo`** scope can publish. If `ALLOWED_GITHUB_USER` is set, the API rejects other GitHub logins. This is separate from the **master password**, which only protects private **content** in the repo.

## Legacy note

Older README text referred to branch `main` and `build_site.sh` only. The live workflow uses **`academic`**; adjust if your fork differs.
