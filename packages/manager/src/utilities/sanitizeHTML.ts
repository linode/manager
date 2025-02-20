import DOMPurify from 'dompurify';

import { allowedHTMLAttr } from 'src/constants';

import { getAllowedHTMLTags, isURLValid } from './sanitizeHTML.utils';

import type { AllowedHTMLTagsTier } from './sanitizeHTML.utils';
import type { Config } from 'dompurify';

type DisallowedTagsMode = 'discard' | 'escape';

export interface SanitizeOptions extends Config {
  disallowedTagsMode?: DisallowedTagsMode;
}

interface SanitizeHTMLOptions {
  allowMoreAttrs?: string[];
  allowMoreTags?: string[];
  disallowedTagsMode?: DisallowedTagsMode;
  sanitizeOptions?: Config;
  sanitizingTier: AllowedHTMLTagsTier;
  text: string;
}

export const sanitizeHTML = ({
  allowMoreAttrs,
  allowMoreTags,
  disallowedTagsMode = 'escape',
  sanitizeOptions: options = {},
  sanitizingTier,
  text,
}: SanitizeHTMLOptions) => {
  DOMPurify.setConfig({
    ALLOWED_ATTR: [...allowedHTMLAttr, ...(allowMoreAttrs ?? [])],
    ALLOWED_TAGS: getAllowedHTMLTags(sanitizingTier, allowMoreTags),
    KEEP_CONTENT: disallowedTagsMode === 'discard' ? false : true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
    ...options,
  });

  // Define transform function for anchor tags
  const anchorHandler = (node: HTMLAnchorElement) => {
    const href = node.getAttribute('href') ?? '';

    // If the URL is invalid, transform to a span.
    if (href && !isURLValid(href)) {
      const span = document.createElement('span');
      span.setAttribute('class', node.getAttribute('class') || '');

      if (node.parentNode) {
        node.parentNode.replaceChild(span, node);
      }
    } else {
      // If this link opens a new tab, add "noopener noreferrer" for security.
      const target = node.getAttribute('target') || '';
      if (target === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
      } else {
        node.removeAttribute('rel');
        node.removeAttribute('target');
      }
    }
  };

  // Register hooks for DOMPurify
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'a') {
      anchorHandler(node as HTMLAnchorElement);
    } else if (data.tagName === 'span') {
      // Allow class attribute only for span elements
      const classAttr = (node as HTMLSpanElement).getAttribute('class');
      if (classAttr && classAttr.trim() !== 'version' && classAttr !== 'line') {
        (node as HTMLSpanElement).removeAttribute('class');
      }
    }
  });

  // Perform sanitization
  const output = DOMPurify.sanitize(text);
  return output.trim();
};
