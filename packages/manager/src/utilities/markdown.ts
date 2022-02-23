import MarkdownIt from 'markdown-it';

// This is "unsafe" because the output may contain HTML. To be deemed "safe" it
// needs to be sanitized before rendered as HTML.
export const unsafe_MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
});
