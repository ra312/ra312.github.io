const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug) && slug.length <= 120;
}

async function getGitHubFile(octokit, owner, repo, filePath, branch) {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branch,
  });
  if (Array.isArray(data) || data.type !== 'file') return null;
  return Buffer.from(data.content, 'base64').toString('utf8');
}

async function loadPostFromGitHub(slug) {
  if (!validSlug(slug)) {
    const error = new Error('Invalid slug');
    error.status = 400;
    throw error;
  }

  const owner = process.env.REPO_OWNER;
  const repo = process.env.REPO_NAME;
  const branch = process.env.TARGET_BRANCH || 'academic';
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (!owner || !repo) {
    const error = new Error('Missing REPO_OWNER or REPO_NAME');
    error.status = 500;
    throw error;
  }
  if (!githubToken) {
    const error = new Error('Missing GitHub auth token');
    error.status = 500;
    throw error;
  }

  const octokit = new Octokit({ auth: githubToken });
  let manifest;
  try {
    const manifestRaw = await getGitHubFile(octokit, owner, repo, 'blog/manifest.json', branch);
    manifest = JSON.parse(manifestRaw);
  } catch (e) {
    const error = new Error('Could not load blog/manifest.json from repo');
    error.status = 500;
    throw error;
  }

  const entry = (manifest.posts || []).find(function (p) { return p.slug === slug; });
  if (!entry) {
    const error = new Error('Post not found in manifest');
    error.status = 404;
    throw error;
  }
  if (entry.visibility === 'private') {
    const error = new Error('Private posts cannot be loaded for editing here');
    error.status = 403;
    throw error;
  }

  try {
    const body = await getGitHubFile(octokit, owner, repo, entry.contentPath, branch);
    if (!body) {
      const error = new Error('Post file not found in repo');
      error.status = 404;
      throw error;
    }
    return {
      slug: entry.slug,
      title: entry.title,
      date: entry.date,
      visibility: entry.visibility,
      body,
    };
  } catch (e) {
    if (e.status) throw e;
    const error = new Error('Post file not found in repo');
    error.status = 404;
    throw error;
  }
}

function loadPostFromLocal(slug, repoRoot) {
  if (!validSlug(slug)) {
    const error = new Error('Invalid slug');
    error.status = 400;
    throw error;
  }

  const manifestPath = path.join(repoRoot, 'blog', 'manifest.json');
  let manifest = { posts: [] };
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (_) {}

  const entry = (manifest.posts || []).find(function (p) { return p.slug === slug; });
  if (!entry) {
    const error = new Error('Post not found in manifest');
    error.status = 404;
    throw error;
  }
  if (entry.visibility === 'private') {
    const error = new Error('Private posts cannot be loaded for editing here');
    error.status = 403;
    throw error;
  }

  const mdPath = path.join(repoRoot, entry.contentPath);
  try {
    const body = fs.readFileSync(mdPath, 'utf8');
    return {
      slug: entry.slug,
      title: entry.title,
      date: entry.date,
      visibility: entry.visibility,
      body,
    };
  } catch (_) {
    const error = new Error('Post file not found locally — run git pull first');
    error.status = 404;
    throw error;
  }
}

module.exports = {
  loadPostFromGitHub,
  loadPostFromLocal,
  validSlug,
};
