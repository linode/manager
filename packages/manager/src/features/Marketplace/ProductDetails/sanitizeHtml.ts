import DOMPurify from 'dompurify';

type SanitizeMode = 'banner' | 'tab';

const ensureSafeLinkRels = (sanitizedHtml: string) => {
  // DOMPurify returns a string; we do a small post-pass to ensure
  // `target="_blank"` links can't access window.opener.
  const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html');

  doc.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((a) => {
    const existing = a.getAttribute('rel') ?? '';
    const tokens = new Set(existing.split(/\s+/).filter(Boolean));
    tokens.add('noopener');
    tokens.add('noreferrer');
    a.setAttribute('rel', Array.from(tokens).join(' '));
  });

  return doc.body.innerHTML;
};

const sanitizeMarketplaceHtml = (html: string, mode: SanitizeMode) => {
  const allowedTagsByMode: Record<SanitizeMode, string[]> = {
    banner: ['a', 'br', 'div', 'em', 'p', 'span', 'strong'],
    tab: [
      'a',
      'b',
      'blockquote',
      'br',
      'code',
      'div',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'i',
      'img',
      'li',
      'ol',
      'p',
      'pre',
      'span',
      'strong',
      'table',
      'tbody',
      'td',
      'th',
      'thead',
      'tr',
      'u',
      'ul',
    ],
  };

  const sanitized = DOMPurify.sanitize(html, {
    // Allow inline/base64 images for tab content (API may provide them)
    ADD_DATA_URI_TAGS: mode === 'tab' ? ['img'] : [],
    ALLOWED_ATTR: [
      'alt',
      'colspan',
      'height',
      'href',
      'rel',
      'rowspan',
      'src',
      'target',
      'title',
      'width',
    ],
    ALLOWED_TAGS: allowedTagsByMode[mode],
  });

  return ensureSafeLinkRels(sanitized);
};

export const sanitizeMarketplaceBannerHtml = (html: string) =>
  sanitizeMarketplaceHtml(html, 'banner');

export const sanitizeMarketplaceTabHtml = (html: string) =>
  sanitizeMarketplaceHtml(html, 'tab');
