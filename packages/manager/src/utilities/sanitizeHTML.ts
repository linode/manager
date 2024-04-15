import DOMPurify from 'dompurify';

import { allowedHTMLAttr } from 'src/constants';

import { getAllowedHTMLTags, isURLValid } from './sanitizeHTML.utils';

import type { AllowedHTMLTagsTier } from './sanitizeHTML.utils';
import type { Config } from 'dompurify';

interface SanitizeHTMLOptions {
  allowMoreTags?: string[];
  disallowedTagsMode?: 'discard' | 'escape';
  options?: Config;
  sanitizingTier: AllowedHTMLTagsTier;
  text: string;
}

export const sanitizeHTML = ({
  allowMoreTags,
  disallowedTagsMode = 'escape',
  options = {},
  sanitizingTier,
  text,
}: SanitizeHTMLOptions) => {
  DOMPurify.setConfig({
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: true,
    ...options,
  });

  // Define transform function for anchor tags
  const transformAnchor = (node: HTMLAnchorElement) => {
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
      }
      node.removeAttribute('target');
    }
  };

  // Register hooks for DOMPurify
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'a') {
      transformAnchor(node as HTMLAnchorElement);
    }
  });

  // Perform sanitization
  return DOMPurify.sanitize(text, {
    ALLOWED_ATTR: allowedHTMLAttr, // Provide the allowed attributes object
    ALLOWED_TAGS: getAllowedHTMLTags(sanitizingTier, allowMoreTags),
    KEEP_CONTENT: disallowedTagsMode === 'discard' ? false : true,
  }).trim();
};
