import * as sanitize from 'sanitize-html';
import { allowedHTMLAttr, allowedHTMLTags } from 'src/constants';

export const sanitizeHTML = (text: string) =>
  sanitize(text, {
    allowedTags: allowedHTMLTags,
    allowedAttributes: {
      '*': allowedHTMLAttr
    }
  }).trim();
