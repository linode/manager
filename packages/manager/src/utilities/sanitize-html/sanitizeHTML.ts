import * as sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

const offSiteURL = /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9-_\.@\#\$%&amp;;:,\?=/\+!\(\)]*(\s)*)/;
const onSiteURL = /^([A-Za-z0-9/\.\?=&\-~]){1,2000}$/;
export const isURLValid = (url: string) =>
  offSiteURL.test(url) || onSiteURL.test(url);

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    allowedTags: allowedHTMLTags,
    allowedAttributes: {
      '*': allowedHTMLAttr
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? '';

        // If the URL is invalid, transform the tag to a span.
        if (href && !isURLValid(href)) {
          return {
            tagName: 'span',
            attribs: {}
          };
        }

        // Otherwise, return the tag as-is.
        return {
          tagName,
          attribs
        };
      }
    },
    /**
     * this option is not supported and was patched
     * See: https://github.com/punkave/sanitize-html/pull/169
     */
    escapeDisallowedTags: true
    /** this is basically just converting script tags to text */
    // transformTags: {
    //   script: (tagName, attrs: Record<string, string>) => {
    //     /**
    //      * get all attributes of the script tag and recreate them as they were typed
    //      * i.e src="hello.js"
    //      */
    //     const attrsAsString = Object.keys(attrs).reduce((accum, eachKey) => {
    //       return `${accum} ${eachKey}="${attrs[eachKey]}"`;
    //     }, '');

    //     /** return the script tag as text inside a p tag */
    //     return {
    //       tagName: 'script',
    //       text: `&lt;${tagName}${attrsAsString}&gt;&lt;/${tagName}&gt;`,
    //       attribs: {}
    //     };
    //   }
    // }
  }).trim();
