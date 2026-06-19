const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function cleanBibliography(md) {
  return md
    .replace(/::: thebibliography\n\d+\n\n/, '## References\n\n')
    .replace(/\n:::\s*$/, '\n');
}

function convertTexToMarkdown(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('No content provided');
  }

  const tmp = path.join(os.tmpdir(), `tex2blog_${Date.now()}_${Math.random().toString(36).slice(2)}.tex`);
  const out = tmp.replace('.tex', '.md');

  try {
    fs.writeFileSync(tmp, content, 'utf8');
    execFileSync('pandoc', [tmp, '--from=latex', '--to=markdown', '--wrap=none', '-o', out]);
    return cleanBibliography(fs.readFileSync(out, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      const error = new Error(
        'pandoc is not available in this environment. Use the local dev server (node server.js) for LaTeX conversion.'
      );
      error.code = 'PANDOC_UNAVAILABLE';
      throw error;
    }
    throw new Error('pandoc conversion failed: ' + err.message);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
    try { fs.unlinkSync(out); } catch (_) {}
  }
}

module.exports = {
  cleanBibliography,
  convertTexToMarkdown,
};
