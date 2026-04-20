/**
 * Start GitHub OAuth. GET /api/login?return_url=<encoded admin URL>
 */
const jwt = require('jsonwebtoken');

function corsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

module.exports = async function handler(req, res) {
  corsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const jwtSecret = process.env.JWT_SECRET;
  const redirectUri = process.env.OAUTH_REDIRECT_URL;

  if (!clientId || !jwtSecret || !redirectUri) {
    return res.status(500).json({
      error: 'Missing env: GITHUB_CLIENT_ID, JWT_SECRET, OAUTH_REDIRECT_URL',
    });
  }

  const returnUrl = typeof req.query.return_url === 'string' ? req.query.return_url : '';
  const state = jwt.sign({ returnUrl: returnUrl }, jwtSecret, { expiresIn: '10m' });

  const authorize =
    'https://github.com/login/oauth/authorize' +
    '?client_id=' +
    encodeURIComponent(clientId) +
    '&redirect_uri=' +
    encodeURIComponent(redirectUri) +
    '&scope=' +
    encodeURIComponent('repo') +
    '&state=' +
    encodeURIComponent(state);

  res.redirect(302, authorize);
};
