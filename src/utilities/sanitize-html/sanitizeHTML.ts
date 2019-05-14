import * as sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    allowedTags: [...allowedHTMLTags, 'script'],
    allowedAttributes: {
      '*': allowedHTMLAttr,
      /** only allowing classes on spans for the sole purpose of code highlighting */
      span: ['class']
    },
    /** this is basically just converting script tags to text */
    transformTags: {
      script: (tagName, attrs: Record<string, string>) => {
        const attrsAsString = Object.keys(attrs).reduce((accum, eachKey) => {
          return `${accum} ${eachKey}=${attrs[eachKey]}`;
        }, '');
        return {
          tagName: 'p',
          text: `&lt;${tagName}${attrsAsString}&gt;&lt;/${tagName}&gt;`,
          attribs: {}
        };
      }
    }
  }).trim();
