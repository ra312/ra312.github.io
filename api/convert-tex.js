/**
 * POST /api/convert-tex — Convert LaTeX to Markdown via pandoc.
 */
const { convertTexToMarkdown } = require('../lib/tex-convert');

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

module.exports = async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const content = body && typeof body.content === 'string' ? body.content : '';
  if (!content.trim()) {
    return res.status(400).json({ error: 'No content provided' });
  }

  try {
    const markdown = convertTexToMarkdown(content);
    return res.status(200).json({ markdown });
  } catch (err) {
    if (err.code === 'PANDOC_UNAVAILABLE') {
      return res.status(503).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message || 'Conversion failed' });
  }
};
