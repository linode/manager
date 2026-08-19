import DOMPurify from 'dompurify';

// Isolated DOMPurify instance — keeps hooks and config from affecting other
// DOMPurify usages (e.g. src/utilities/sanitizeHTML.ts) anywhere in the app.
const purify = DOMPurify(window);

// Tags allowed in markdown-it + Shiki output.
const ALLOWED_TAGS = [
  'a',
  'abbr',
  'acronym',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
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
  'ul',
];

const ALLOWED_ATTRS = [
  'align',
  'class',
  'href',
  'lang',
  'rel',
  'style',
  'target',
  'title',
];

const OFFSITE_URL_REGEX =
  /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9\-_.@#$%&;:,?=/+!()]*(\s)*)/;
const ONSITE_URL_REGEX = /^([A-Za-z0-9/_.\-?=&#~]){1,2000}$/;

const isURLValid = (url: string): boolean =>
  OFFSITE_URL_REGEX.test(url) || ONSITE_URL_REGEX.test(url);

// Hooks are registered once at instance creation to avoid stacking copies on every call.
purify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'a') {
    const href = (node as HTMLAnchorElement).getAttribute('href') ?? '';

    if (href && !isURLValid(href)) {
      // Invalid URL — replace with a <span> to defuse the link.
      // Move child nodes first so visible text content is preserved.
      const span = document.createElement('span');
      const classAttr = (node as HTMLElement).getAttribute('class');
      if (classAttr) {
        span.setAttribute('class', classAttr);
      }
      while (node.firstChild) {
        span.appendChild(node.firstChild);
      }
      node.parentNode?.replaceChild(span, node);
    } else {
      const target = (node as HTMLElement).getAttribute('target') || '';
      if (target === '_blank') {
        (node as HTMLElement).setAttribute('rel', 'noopener noreferrer');
      } else {
        (node as HTMLElement).removeAttribute('rel');
        (node as HTMLElement).removeAttribute('target');
      }
    }
  } else if (data.tagName === 'span') {
    // Shiki adds class="line" to spans — preserve that, strip everything else.
    const classAttr = (node as HTMLSpanElement).getAttribute('class');
    if (classAttr && classAttr !== 'line') {
      (node as HTMLSpanElement).removeAttribute('class');
    }
  }
});

// Shiki uses inline `style` on <span> for token colors and on <pre> for the
// theme background. MarkdownIt uses style="text-align:..." on <td>/<th> for
// column alignment. Strip it from every other element to prevent CSS injection.
purify.addHook('uponSanitizeAttribute', (node, data) => {
  if (
    data.attrName === 'style' &&
    node.tagName !== 'SPAN' &&
    node.tagName !== 'PRE' &&
    node.tagName !== 'TD' &&
    node.tagName !== 'TH'
  ) {
    data.keepAttr = false;
  }
});

const SANITIZE_CONFIG = {
  ALLOWED_ATTR: ALLOWED_ATTRS,
  ALLOWED_TAGS,
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false,
} as const;

/**
 * Sanitizes HTML produced by markdown-it rendering.
 */
export const sanitizeMarkdownHTML = (text: string): string =>
  purify.sanitize(text, SANITIZE_CONFIG).trim();
