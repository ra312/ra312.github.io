/**
 * GET /api/post/:slug — Load an existing public post for editing.
 */
const { loadPostFromGitHub } = require('../lib/post-load');

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

module.exports = async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slug = req.query.slug;
  if (!slug) {
    return res.status(400).json({ error: 'Missing slug' });
  }

  try {
    const post = await loadPostFromGitHub(slug);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Load failed' });
  }
};
