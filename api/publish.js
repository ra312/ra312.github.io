/**
 * POST /api/publish — commit public or private post + manifest (branch: TARGET_BRANCH).
 */
const jwt = require('jsonwebtoken');
const { Octokit } = require('@octokit/rest');

function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';');
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim();
    if (p.indexOf(name + '=') === 0) {
      return decodeURIComponent(p.slice(name.length + 1));
    }
  }
  return null;
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
}

function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) && slug.length <= 120;
}

async function getFile(octokit, owner, repo, path, branch) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    if (Array.isArray(data) || data.type !== 'file') return null;
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content, sha: data.sha };
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

async function deleteGitFile(octokit, owner, repo, path, branch, message) {
  const file = await getFile(octokit, owner, repo, path, branch);
  if (!file) return false;
  await octokit.rest.repos.deleteFile({
    owner,
    repo,
    path,
    message,
    sha: file.sha,
    branch,
  });
  return true;
}

function parseJson(req) {
  try {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Missing JWT_SECRET' });
  }

  const sessionToken = getCookie(req, 'blog_session');
  let session;
  const authHeader = req.headers.authorization || '';
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/);

  if (req.method === 'DELETE') {
    if (bearerMatch) {
      try {
        session = jwt.verify(bearerMatch[1], jwtSecret);
        if (!session.auth || session.auth !== 'password') {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } else if (sessionToken) {
      try {
        session = jwt.verify(sessionToken, jwtSecret);
      } catch (e) {
        return res.status(401).json({ error: 'Session expired. Sign in again.' });
      }
    } else {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const owner = process.env.REPO_OWNER;
    const repo = process.env.REPO_NAME;
    const branch = process.env.TARGET_BRANCH || 'academic';
    const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const authToken = bearerMatch ? githubToken : session.access_token;

    if (!owner || !repo) {
      return res.status(500).json({ error: 'Missing REPO_OWNER or REPO_NAME for publishing' });
    }
    if (!authToken) {
      return res.status(500).json({ error: 'Missing GitHub auth token.' });
    }

    const body = parseJson(req);
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    const slug = body.slug;
    if (!validSlug(slug)) {
      return res.status(400).json({
        error: 'Invalid slug. Use lowercase letters, numbers, and hyphens only.',
      });
    }

    const octokit = new Octokit({ auth: authToken });
    const manifestPath = 'blog/manifest.json';
    const manifestFile = await getFile(octokit, owner, repo, manifestPath, branch);
    let manifest = { version: 1, posts: [] };
    let manifestSha = null;
    if (manifestFile) {
      try {
        manifest = JSON.parse(manifestFile.content);
      } catch (e) {
        return res.status(500).json({ error: 'Could not parse blog/manifest.json in repo' });
      }
      manifestSha = manifestFile.sha;
    }
    if (!Array.isArray(manifest.posts)) manifest.posts = [];

    const existing = manifest.posts.filter(function (p) { return p.slug === slug; });
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found in manifest.' });
    }

    await deleteGitFile(octokit, owner, repo, 'blog/posts/' + slug + '.md', branch, 'blog: delete post ' + slug);
    await deleteGitFile(octokit, owner, repo, 'blog/private/' + slug + '.json', branch, 'blog: delete private post ' + slug);

    manifest.posts = manifest.posts.filter(function (p) { return p.slug !== slug; });
    const manifestJson = JSON.stringify(manifest, null, 2) + '\n';
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: manifestPath,
      message: 'blog: remove post ' + slug,
      content: Buffer.from(manifestJson, 'utf8').toString('base64'),
      branch,
      sha: manifestSha || undefined,
    });

    return res.status(200).json({ ok: true, slug: slug, deleted: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (bearerMatch) {
    try {
      session = jwt.verify(bearerMatch[1], jwtSecret);
      if (!session.auth || session.auth !== 'password') {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } else if (sessionToken) {
    try {
      session = jwt.verify(sessionToken, jwtSecret);
    } catch (e) {
      return res.status(401).json({ error: 'Session expired. Sign in again.' });
    }
  } else {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  // For password-based auth, we still need GitHub repo access to save posts
  const isPasswordAuth = bearerMatch !== null;
  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const branch = process.env.TARGET_BRANCH || 'academic';
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!owner || !repo) {
    return res.status(500).json({ error: 'Missing REPO_OWNER or REPO_NAME for publishing' });
  }

  if (isPasswordAuth && !githubToken) {
    return res.status(500).json({
      error: 'Password auth publishing requires GITHUB_TOKEN (or GH_TOKEN) in the server environment.',
    });
  }

  let body;
  try {
    body = parseJson(req);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Expected JSON object body' });
  }

  const slug = body.slug;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const date = typeof body.date === 'string' ? body.date.trim() : '';
  const visibility = body.visibility === 'private' ? 'private' : 'public';

  if (!validSlug(slug)) {
    return res.status(400).json({
      error: 'Invalid slug. Use lowercase letters, numbers, and hyphens only.',
    });
  }
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const authToken = isPasswordAuth ? githubToken : session.access_token;
  if (!authToken) {
    return res.status(401).json({ error: 'Not authenticated with GitHub.' });
  }

  const octokit = new Octokit({ auth: authToken });

  const manifestPath = 'blog/manifest.json';
  const manifestFile = await getFile(octokit, owner, repo, manifestPath, branch);
  let manifest = { version: 1, posts: [] };
  let manifestSha = null;
  if (manifestFile) {
    try {
      manifest = JSON.parse(manifestFile.content);
    } catch (e) {
      return res.status(500).json({ error: 'Could not parse blog/manifest.json in repo' });
    }
    manifestSha = manifestFile.sha;
  }
  if (!Array.isArray(manifest.posts)) manifest.posts = [];

  const entry = {
    slug,
    title,
    date: date || new Date().toISOString().slice(0, 10),
    visibility,
    contentPath:
      visibility === 'private'
        ? 'blog/private/' + slug + '.json'
        : 'blog/posts/' + slug + '.md',
  };

  const others = manifest.posts.filter(function (p) {
    return p.slug !== slug;
  });
  others.push(entry);
  others.sort(function (a, b) {
    return (b.date || '').localeCompare(a.date || '');
  });
  manifest.posts = others;

  const manifestJson = JSON.stringify(manifest, null, 2) + '\n';

  if (visibility === 'public') {
    const md = typeof body.body === 'string' ? body.body : '';
    const pubPath = 'blog/posts/' + slug + '.md';
    const existingPub = await getFile(octokit, owner, repo, pubPath, branch);
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: pubPath,
      message: 'blog: add public post ' + slug,
      content: Buffer.from(md, 'utf8').toString('base64'),
      branch,
      sha: existingPub ? existingPub.sha : undefined,
    });
    try {
      const priv = await getFile(octokit, owner, repo, 'blog/private/' + slug + '.json', branch);
      if (priv && priv.sha) {
        await octokit.rest.repos.deleteFile({
          owner,
          repo,
          path: 'blog/private/' + slug + '.json',
          message: 'blog: remove private file for ' + slug + ' (now public)',
          sha: priv.sha,
          branch,
        });
      }
    } catch (e) {
      /* ignore */
    }
  } else {
    const enc = body.encrypted;
    if (!enc || enc.v !== 1 || !enc.salt || !enc.iv || !enc.ciphertext) {
      return res.status(400).json({
        error: 'Private posts require client-encrypted payload (encrypted.v, salt, iv, ciphertext).',
      });
    }
    const privateJson = JSON.stringify(enc, null, 2) + '\n';
    const privPath = 'blog/private/' + slug + '.json';
    const existingPriv = await getFile(octokit, owner, repo, privPath, branch);
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: privPath,
      message: 'blog: add private post ' + slug,
      content: Buffer.from(privateJson, 'utf8').toString('base64'),
      branch,
      sha: existingPriv ? existingPriv.sha : undefined,
    });
    try {
      const pub = await getFile(octokit, owner, repo, 'blog/posts/' + slug + '.md', branch);
      if (pub && pub.sha) {
        await octokit.rest.repos.deleteFile({
          owner,
          repo,
          path: 'blog/posts/' + slug + '.md',
          message: 'blog: remove public file for ' + slug + ' (now private)',
          sha: pub.sha,
          branch,
        });
      }
    } catch (e) {
      /* ignore */
    }
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: manifestPath,
    message: 'blog: update manifest for ' + slug,
    content: Buffer.from(manifestJson, 'utf8').toString('base64'),
    branch,
    sha: manifestSha || undefined,
  });

  return res.status(200).json({ ok: true, slug: slug, visibility: visibility });
};
