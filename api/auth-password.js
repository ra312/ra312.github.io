/**
 * POST /api/auth-password — Authenticate with password and return JWT token
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
}

module.exports = async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  const hashedPassword = process.env.BLOG_PASSWORD_HASH;
  const passwordSalt = process.env.BLOG_PASSWORD_SALT;

  if (!jwtSecret || !hashedPassword || !passwordSalt) {
    return res.status(500).json({
      error: 'Missing JWT_SECRET, BLOG_PASSWORD_HASH, or BLOG_PASSWORD_SALT',
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const password = typeof body.password === 'string' ? body.password : '';
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const salt = Buffer.from(passwordSalt, 'base64');
  const providedHash = hashPassword(password, salt);
  const expectedHash = Buffer.from(hashedPassword, 'base64');

  if (!crypto.timingSafeEqual(providedHash, expectedHash)) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ auth: 'password', iat: Math.floor(Date.now() / 1000) }, jwtSecret, {
    expiresIn: '7d',
  });

  res.setHeader('Set-Cookie', `blog_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`);
  res.status(200).json({ success: true, token });
};
