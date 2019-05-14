import * as sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    allowedTags: allowedHTMLTags,
    allowedAttributes: {
      '*': allowedHTMLAttr,
      /** only allowing classes on spans for the sole purpose of code highlighting */
      span: ['class']
    }
  }).trim();
