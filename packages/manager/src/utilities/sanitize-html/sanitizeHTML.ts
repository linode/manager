import * as sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    allowedTags: allowedHTMLTags,
    allowedAttributes: {
      '*': allowedHTMLAttr
    },
    allowedClasses: {
      // Only allow classes generated by highlight.js (for syntax highlighting).
      span: highlightjsClasses
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

export const isURLValid = (url: string) =>
  offSiteURL.test(url) || onSiteURL.test(url);

export const offSiteURL = /(?=.{1,2000}$)((\s)*((ht|f)tp(s?):\/\/|mailto:)[A-Za-z0-9]+[~a-zA-Z0-9-_\.@\#\$%&amp;;:,\?=/\+!\(\)]*(\s)*)/;
export const onSiteURL = /^([A-Za-z0-9/\.\?=&\-~]){1,2000}$/;

// List of stylable highlight.js stylable classes. This list is from:
// https://highlightjs.readthedocs.io/en/latest/css-classes-reference.html#stylable-classes
const highlightjsClasses = [
  'hljs-keyword',
  'hljs-built_in',
  'hljs-type',
  'hljs-literal',
  'hljs-number',
  'hljs-regexp',
  'hljs-string',
  'hljs-subst',
  'hljs-symbol',
  'hljs-class',
  'hljs-function',
  'hljs-title',
  'hljs-params',
  'hljs-comment',
  'hljs-doctag',
  'hljs-meta',
  'hljs-meta',
  'hljs-meta',
  'hljs-section',
  'hljs-tag',
  'hljs-name',
  'hljs-builtin',
  'hljs-attr',
  'hljs-attribute',
  'hljs-variable',
  'hljs-bullet',
  'hljs-code',
  'hljs-emphasis',
  'hljs-strong',
  'hljs-formula',
  'hljs-link',
  'hljs-quote',
  'hljs-selector',
  'hljs-selector',
  'hljs-selector',
  'hljs-selector',
  'hljs-selector',
  'hljs-template',
  'hljs-template',
  'hljs-addition',
  'hljs-deletion',
  'hljs-operator',
  'hljs-pattern',
  'hljs-typing',
  'hljs-constructor',
  'hljs-module',
  'hljs-module'
];
