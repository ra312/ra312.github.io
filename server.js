require('dotenv').config({ path: '.env.local' });
const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Auto-inject GitHub token from `gh` CLI when not set in .env.local
if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
  try {
    const token = execSync('gh auth token', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    if (token) {
      process.env.GITHUB_TOKEN = token;
      console.log('Using GitHub token from gh CLI');
    }
  } catch (_) {
    console.warn('No GITHUB_TOKEN set and gh CLI not available — publish will fail');
  }
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Convert LaTeX → Markdown via pandoc (local dev only)
app.post('/api/convert-tex', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'No content provided' });

  const tmp = path.join(require('os').tmpdir(), `tex2blog_${Date.now()}.tex`);
  const out = tmp.replace('.tex', '.md');
  try {
    fs.writeFileSync(tmp, content, 'utf8');
    execFileSync('pandoc', [tmp, '--from=latex', '--to=markdown', '--wrap=none', '-o', out]);
    let md = fs.readFileSync(out, 'utf8');

    // Clean bibliography fenced div
    md = md.replace(/::: thebibliography\n\d+\n\n/, '## References\n\n');
    md = md.replace(/\n:::\s*$/, '\n');

    res.json({ markdown: md });
  } catch (err) {
    res.status(500).json({ error: 'pandoc conversion failed: ' + err.message });
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
    try { fs.unlinkSync(out); } catch (_) {}
  }
});

// Load an existing post's markdown content for editing
app.get('/api/post/:slug', (req, res) => {
  const slug = req.params.slug;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  const manifestPath = path.join(__dirname, 'blog', 'manifest.json');
  let manifest = { posts: [] };
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (_) {}

  const entry = manifest.posts.find(p => p.slug === slug);
  if (!entry) return res.status(404).json({ error: 'Post not found in manifest' });

  if (entry.visibility === 'private') {
    return res.status(403).json({ error: 'Private posts cannot be loaded for editing here' });
  }

  const mdPath = path.join(__dirname, entry.contentPath);
  try {
    const body = fs.readFileSync(mdPath, 'utf8');
    res.json({ slug: entry.slug, title: entry.title, date: entry.date, visibility: entry.visibility, body });
  } catch (_) {
    res.status(404).json({ error: 'Post file not found locally — run git pull first' });
  }
});

app.all('/api/auth-password', require('./api/auth-password'));
app.all('/api/publish', require('./api/publish'));
app.all('/api/login', require('./api/login'));
app.all('/api/callback', require('./api/callback'));

app.listen(3000, () => console.log('API running on http://localhost:3000'));
