import { sanitizeMarkdownHTML } from './sanitizeHTML';

describe('sanitizeMarkdownHTML', () => {
  describe('XSS prevention', () => {
    it('strips <script> tags', () => {
      expect(
        sanitizeMarkdownHTML('<script>alert("xss")</script>')
      ).not.toContain('<script>');
    });

    it('keeps text content when a disallowed tag is stripped', () => {
      expect(sanitizeMarkdownHTML('<div>safe text</div>')).toContain(
        'safe text'
      );
    });

    it('strips event handler attributes', () => {
      expect(
        sanitizeMarkdownHTML('<p onmouseover="alert(1)">text</p>')
      ).not.toContain('onmouseover');
    });

    it('strips <img> tags', () => {
      expect(
        sanitizeMarkdownHTML('<img src="x" onerror="alert(1)">')
      ).not.toContain('<img');
    });

    it('strips <form> and <input> tags', () => {
      const result = sanitizeMarkdownHTML('<form><input type="text" /></form>');
      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
    });
  });

  describe('URL validation', () => {
    it('preserves valid https URLs', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="https://example.com">link</a>'
      );
      expect(result).toContain('href="https://example.com"');
    });

    it('preserves valid http URLs', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="http://example.com">link</a>'
      );
      expect(result).toContain('href="http://example.com"');
    });

    it('preserves valid mailto URLs', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="mailto:user@example.com">email</a>'
      );
      expect(result).toContain('href="mailto:user@example.com"');
    });

    it('preserves valid relative URLs', () => {
      const result = sanitizeMarkdownHTML('<a href="/some/path?q=1">link</a>');
      expect(result).toContain('href="/some/path?q=1"');
    });

    it('preserves fragment-only URLs', () => {
      const result = sanitizeMarkdownHTML('<a href="#section">Jump</a>');
      expect(result).toContain('href="#section"');
      expect(result).toContain('Jump');
    });

    it('preserves relative URLs containing a fragment', () => {
      const result = sanitizeMarkdownHTML('<a href="/page#section">link</a>');
      expect(result).toContain('href="/page#section"');
    });

    it('replaces a javascript: href anchor with a <span> but preserves its text', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="javascript:alert(1)">click</a>'
      );
      expect(result).not.toContain('<a');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('click');
    });

    it('replaces an anchor with an unrecognized href with a <span> but preserves its text', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="not a valid url ##!!">click</a>'
      );
      expect(result).not.toContain('<a');
      expect(result).not.toContain('href=');
      expect(result).toContain('click');
    });

    it('replaces a data: href anchor with a <span> but preserves its text', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="data:text/html,<script>alert(1)</script>">click</a>'
      );
      expect(result).not.toContain('<a');
      expect(result).not.toContain('data:');
      expect(result).toContain('click');
    });

    it('preserves an anchor with no href', () => {
      const result = sanitizeMarkdownHTML('<a>link text</a>');
      expect(result).toContain('<a>');
      expect(result).toContain('link text');
    });
  });

  describe('target="_blank" handling', () => {
    it('adds rel="noopener noreferrer" when target="_blank" is present', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="https://example.com" target="_blank">link</a>'
      );
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('target="_blank"');
    });

    it('does not add rel or target when target is absent', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="https://example.com">link</a>'
      );
      expect(result).not.toContain('target=');
      expect(result).not.toContain('rel=');
    });

    it('strips rel and target when target is not "_blank"', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="https://example.com" target="custom" rel="noopener">link</a>'
      );
      expect(result).not.toContain('target=');
      expect(result).not.toContain('rel=');
    });

    it('strips a custom rel attribute on links without target="_blank"', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="https://example.com" rel="dns-prefetch">link</a>'
      );
      expect(result).not.toContain('rel=');
    });

    it('replaces the rel attribute with noopener noreferrer when target="_blank" is present', () => {
      const result = sanitizeMarkdownHTML(
        '<a href="https://example.com" target="_blank" rel="dns-prefetch">link</a>'
      );
      expect(result).not.toContain('rel="dns-prefetch"');
      expect(result).toContain('rel="noopener noreferrer"');
    });
  });

  describe('style attribute', () => {
    it('preserves style on <span> elements', () => {
      const result = sanitizeMarkdownHTML(
        '<span style="color: red;">text</span>'
      );
      expect(result).toContain('style="color: red;"');
    });

    it('preserves style on <pre> elements', () => {
      const result = sanitizeMarkdownHTML(
        '<pre style="background-color: #fafafa; color: #383a42;">code</pre>'
      );
      expect(result).toContain('style=');
    });

    it('strips style from <p> elements', () => {
      expect(
        sanitizeMarkdownHTML('<p style="color: red;">text</p>')
      ).not.toContain('style=');
    });

    it('preserves text-align style on <td> and <th> elements (MarkdownIt column alignment)', () => {
      const td = sanitizeMarkdownHTML(
        '<table><tbody><tr><td style="text-align:left">cell</td></tr></tbody></table>'
      );
      expect(td).toContain('style="text-align:left"');

      const th = sanitizeMarkdownHTML(
        '<table><thead><tr><th style="text-align:center">header</th></tr></thead></table>'
      );
      expect(th).toContain('style="text-align:center"');
    });

    it('strips style from headings', () => {
      expect(
        sanitizeMarkdownHTML('<h1 style="font-size: 2em;">heading</h1>')
      ).not.toContain('style=');
    });
  });

  describe('span class handling', () => {
    it('preserves class="line" on spans', () => {
      const result = sanitizeMarkdownHTML('<span class="line">code</span>');
      expect(result).toContain('class="line"');
    });

    it('strips other class names from spans', () => {
      const result = sanitizeMarkdownHTML(
        '<span class="token keyword">text</span>'
      );
      expect(result).not.toContain('class=');
    });

    it('preserves Shiki combined output: class="line" on outer span and style on inner span', () => {
      const result = sanitizeMarkdownHTML(
        '<span class="line"><span style="color: #e06c75">const</span></span>'
      );
      expect(result).toContain('class="line"');
      expect(result).toContain('style="color: #e06c75"');
    });
  });

  describe('allowed elements pass through', () => {
    it('preserves inline formatting', () => {
      const result = sanitizeMarkdownHTML(
        '<p><strong>bold</strong> and <em>italic</em></p>'
      );
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('preserves code blocks', () => {
      const result = sanitizeMarkdownHTML(
        '<pre><code>const x = 1;</code></pre>'
      );
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
      expect(result).toContain('const x = 1;');
    });

    it('preserves headings', () => {
      const result = sanitizeMarkdownHTML('<h1>Title</h1><h2>Subtitle</h2>');
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<h2>Subtitle</h2>');
    });

    it('preserves lists', () => {
      const result = sanitizeMarkdownHTML(
        '<ul><li>item one</li><li>item two</li></ul>'
      );
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>item one</li>');
    });

    it('preserves tables', () => {
      const result = sanitizeMarkdownHTML(
        '<table><thead><tr><th>Col</th></tr></thead><tbody><tr><td>val</td></tr></tbody></table>'
      );
      expect(result).toContain('<table>');
      expect(result).toContain('<th>Col</th>');
      expect(result).toContain('<td>val</td>');
    });

    it('preserves blockquotes', () => {
      const result = sanitizeMarkdownHTML(
        '<blockquote><p>quoted text</p></blockquote>'
      );
      expect(result).toContain('<blockquote>');
      expect(result).toContain('quoted text');
    });
  });
});
