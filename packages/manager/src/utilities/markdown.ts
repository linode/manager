import MarkdownIt from 'markdown-it';
import { shiki } from './syntax-highlighter';

// This is "unsafe" because the output may contain HTML. To be deemed "safe" it
// needs to be sanitized before rendered as HTML.
export const unsafe_MarkdownIt = new MarkdownIt({
  highlight(str, lang) {
    try {
      return shiki.codeToHtml(str, {
        lang,
        theme: 'one-dark-pro',
      });
    } catch (error) {
      return '';
    }
  },
  html: true,
  linkify: true,
});
