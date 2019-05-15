import * as sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    allowedTags: allowedHTMLTags,
    allowedAttributes: {
      '*': allowedHTMLAttr,
      /** only allowing classes on spans for the sole purpose of code highlighting */
      span: ['class']
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
