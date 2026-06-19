require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');
const express = require('express');
const { convertTexToMarkdown } = require('./lib/tex-convert');
const { loadPostFromLocal } = require('./lib/post-load');

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

app.post('/api/convert-tex', (req, res) => {
  const { content } = req.body || {};
  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'No content provided' });
  }
  try {
    const markdown = convertTexToMarkdown(content);
    res.json({ markdown });
  } catch (err) {
    if (err.code === 'PANDOC_UNAVAILABLE') {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Conversion failed' });
  }
});

app.get('/api/post/:slug', (req, res) => {
  try {
    const post = loadPostFromLocal(req.params.slug, __dirname);
    res.json(post);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Load failed' });
  }
});

app.all('/api/auth-password', require('./api/auth-password'));
app.all('/api/publish', require('./api/publish'));
app.all('/api/login', require('./api/login'));
app.all('/api/callback', require('./api/callback'));

app.listen(3000, () => console.log('API running on http://localhost:3000'));
