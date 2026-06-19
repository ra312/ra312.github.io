/*
 * Markdown + LaTeX renderer for blog posts.
 * It protects math before Markdown parsing, then renders placeholders with KaTeX.
 */
(function (window) {
  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  function isEscaped(text, index) {
    var count = 0;
    for (var i = index - 1; i >= 0 && text[i] === '\\'; i -= 1) count += 1;
    return count % 2 === 1;
  }

  function findClosing(text, start, delimiter) {
    var i = start;
    while (i < text.length) {
      var next = text.indexOf(delimiter, i);
      if (next === -1) return -1;
      if (!isEscaped(text, next)) return next;
      i = next + delimiter.length;
    }
    return -1;
  }

  function findClosingDollar(text, start) {
    for (var i = start; i < text.length; i += 1) {
      if (text[i] === '\n') return -1;
      if (text[i] === '$' && !isEscaped(text, i)) return i;
    }
    return -1;
  }

  function protectMath(md) {
    var parts = [];
    var out = '';
    var i = 0;

    function stash(source, displayMode) {
      var token = 'BLOGMATHPLACEHOLDER' + parts.length + 'X';
      parts.push({ token: token, source: source, displayMode: displayMode });
      return token;
    }

    while (i < md.length) {
      if (md.slice(i, i + 2) === '$$' && !isEscaped(md, i)) {
        var closeDisplayDollar = findClosing(md, i + 2, '$$');
        if (closeDisplayDollar !== -1) {
          out += stash(md.slice(i + 2, closeDisplayDollar), true);
          i = closeDisplayDollar + 2;
          continue;
        }
      }

      if (md.slice(i, i + 2) === '\\[' && !isEscaped(md, i)) {
        var closeBracket = findClosing(md, i + 2, '\\]');
        if (closeBracket !== -1) {
          out += stash(md.slice(i + 2, closeBracket), true);
          i = closeBracket + 2;
          continue;
        }
      }

      if (md.slice(i, i + 2) === '\\(' && !isEscaped(md, i)) {
        var closeParen = findClosing(md, i + 2, '\\)');
        if (closeParen !== -1) {
          out += stash(md.slice(i + 2, closeParen), false);
          i = closeParen + 2;
          continue;
        }
      }

      if (md[i] === '$' && md[i + 1] !== '$' && !isEscaped(md, i)) {
        var closeInlineDollar = findClosingDollar(md, i + 1);
        if (closeInlineDollar !== -1 && closeInlineDollar > i + 1) {
          out += stash(md.slice(i + 1, closeInlineDollar), false);
          i = closeInlineDollar + 1;
          continue;
        }
      }

      out += md[i];
      i += 1;
    }

    return { markdown: out, parts: parts };
  }

  function renderMath(part) {
    if (typeof katex === 'undefined' || !katex.renderToString) {
      return part.displayMode
        ? '<pre class="math-fallback">' + escapeHtml(part.source) + '</pre>'
        : '<code class="math-fallback">' + escapeHtml(part.source) + '</code>';
    }

    try {
      return katex.renderToString(part.source.trim(), {
        displayMode: part.displayMode,
        throwOnError: false,
        strict: 'warn',
      });
    } catch (e) {
      return part.displayMode
        ? '<div class="katex-error">LaTeX Error: ' + escapeHtml(e.message) + '</div>'
        : '<span class="katex-error">LaTeX Error</span>';
    }
  }

  function extractFencedDivs(md) {
    var parts = [];
    var out = md.replace(/^:::\s+(\S+)\s*\n([\s\S]*?)^:::\s*$/gm, function (_, cls, body) {
      var token = 'BLOGTHEOREMPLACEHOLDER' + parts.length + 'X';
      parts.push({ token: token, cls: cls, body: body.trim() });
      return token;
    });
    return { markdown: out, parts: parts };
  }

  function renderMarkdownParts(md, parts) {
    var html = typeof marked !== 'undefined' && marked.parse
      ? marked.parse(md)
      : '<pre>' + escapeHtml(md) + '</pre>';

    parts.forEach(function (part) {
      html = html.split(part.token).join(renderMath(part));
    });

    return html;
  }

  function renderMarkdown(md) {
    var fenced = extractFencedDivs(String(md || ''));
    var protectedMath = protectMath(fenced.markdown);
    var html = renderMarkdownParts(protectedMath.markdown, protectedMath.parts);

    fenced.parts.forEach(function (part) {
      var innerProtected = protectMath(part.body);
      var innerHtml = renderMarkdownParts(innerProtected.markdown, innerProtected.parts);
      html = html.split(part.token).join(
        '<div class="theorem ' + escapeHtml(part.cls) + '">' + innerHtml + '</div>'
      );
    });

    return html;
  }

  window.BlogMath = {
    renderMarkdown: renderMarkdown,
  };
})(window);
