import sanitize from 'sanitize-html';

import { allowedHTMLAttr } from 'src/constants';

import { getAllowedHTMLTags } from './sanitizeHTML.utils';

import type { AllowedHTMLTagsTier } from './sanitizeHTML.utils';
import type { IOptions } from 'sanitize-html';

interface SanitizeHTMLOptions {
  allowMoreTags?: string[];
  disallowedTagsMode?: IOptions['disallowedTagsMode'];
  options?: IOptions;
  sanitizingTier: AllowedHTMLTagsTier;
  text: string;
}

export const sanitizeHTML = ({
  allowMoreTags,
  disallowedTagsMode = 'escape',
  options = {},
  sanitizingTier,
  text,
}: SanitizeHTMLOptions) =>
  sanitize(text, {
    allowedAttributes: {
      '*': allowedHTMLAttr,
      // "target" and "rel" are allowed because they are handled in the
      // transformTags map below.
      a: [...allowedHTMLAttr, 'target', 'rel'],
    },
    allowedClasses: {
      span: ['version'],
    },
    allowedTags: getAllowedHTMLTags(sanitizingTier, allowMoreTags),
    disallowedTagsMode,
    transformTags: {
      // This transformation function does the following to anchor tags:
      // 1. Turns the <a /> into a <span /> if the "href" is invalid
      // 2. Adds `rel="noopener noreferrer" if _target is "blank" (for security)
      // 3. Removes "target" attribute  if it's anything other than "_blank"
      // 4. Removes custom "rel" attributes

      a: (tagName, attribs) => {
        // If the URL is invalid, transform to a span.
        const href = attribs.href ?? '';
        if (href && !isURLValid(href)) {
          return {
            attribs: {},
            tagName: 'span',
          };
        }

        // If this link opens a new tab, add "noopener noreferrer" for security.
        const target = attribs.target ?? '';
        if (target && target === '_blank') {
          return {
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer',
            },
            tagName,
          };
        }

        // Otherwise we don't want to allow the "rel" or "target" attributes.
        delete attribs.rel;
        delete attribs.target;

        return {
          attribs,
          tagName,
        };
      },
    },
    ...options,
  }).trim();

export const isURLValid = (url: string) =>
  offSiteURL.test(url) || onSiteURL.test(url);

export const offSiteURL = /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9-_\.@\#\$%&amp;;:,\?=/\+!\(\)]*(\s)*)/;
export const onSiteURL = /^([A-Za-z0-9/\.\?=&\-~]){1,2000}$/;
