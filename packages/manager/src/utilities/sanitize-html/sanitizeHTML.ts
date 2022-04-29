import sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

export const sanitizeHTML = (text: string, options: sanitize.IOptions = {}) =>
  sanitize(text, {
    allowedTags: allowedHTMLTags,
    allowedAttributes: {
      '*': allowedHTMLAttr,
      // "target" and "rel" are allowed because they are handled in the
      // transformTags map below.
      a: [...allowedHTMLAttr, 'target', 'rel'],
    },
    allowedClasses: {
      span: ['version'],
    },
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
            tagName: 'span',
            attribs: {},
          };
        }

        // If this link opens a new tab, add "noopener noreferrer" for security.
        const target = attribs.target ?? '';
        if (target && target === '_blank') {
          return {
            tagName,
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer',
            },
          };
        }

        // Otherwise we don't want to allow the "rel" or "target" attributes.
        delete attribs.rel;
        delete attribs.target;

        return {
          tagName,
          attribs,
        };
      },
    },
    disallowedTagsMode: 'escape',
    ...options,
  }).trim();

export const isURLValid = (url: string) =>
  offSiteURL.test(url) || onSiteURL.test(url);

export const offSiteURL = /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9-_\.@\#\$%&amp;;:,\?=/\+!\(\)]*(\s)*)/;
export const onSiteURL = /^([A-Za-z0-9/\.\?=&\-~]){1,2000}$/;
