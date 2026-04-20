/**
 * GitHub OAuth callback. Exchanges code, optional ALLOWED_GITHUB_USER check, sets session cookie.
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
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const jwtSecret = process.env.JWT_SECRET;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!jwtSecret || !clientId || !clientSecret) {
    return res.status(500).send('Server misconfiguration');
  }

  const code = req.query.code;
  const state = req.query.state;
  const err = req.query.error;

  if (err) {
    return res.status(400).send('OAuth error: ' + String(err));
  }
  if (!code || !state) {
    return res.status(400).send('Missing code or state');
  }

  let statePayload;
  try {
    statePayload = jwt.verify(state, jwtSecret);
  } catch (e) {
    return res.status(400).send('Invalid state');
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    return res.status(400).send('Token error: ' + tokenData.error_description);
  }

  const accessToken = tokenData.access_token;
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'User-Agent': 'ra312-blog-publish',
    },
  });

  if (!userRes.ok) {
    return res.status(400).send('Could not load GitHub user');
  }

  const user = await userRes.json();
  const allowed = process.env.ALLOWED_GITHUB_USER;
  if (allowed && user.login !== allowed) {
    return res.status(403).send('GitHub user ' + user.login + ' is not allowed to publish.');
  }

  const session = jwt.sign(
    {
      access_token: accessToken,
      login: user.login,
    },
    jwtSecret,
    { expiresIn: '2h' }
  );

  const returnUrl = statePayload.returnUrl || '/';
  const maxAge = 7200;
  const cookieParts = [
    'blog_session=' + encodeURIComponent(session),
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Path=/',
    'Max-Age=' + maxAge,
  ];

  res.setHeader('Set-Cookie', cookieParts.join('; '));
  res.redirect(302, returnUrl);
};
