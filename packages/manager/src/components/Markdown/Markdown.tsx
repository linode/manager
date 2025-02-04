import { Typography } from '@linode/ui';
import MarkdownIt from 'markdown-it';
import React from 'react';

import { sanitizeHTML } from 'src/utilities/sanitizeHTML';
import { getHighlighterTheme, shiki } from 'src/utilities/syntax-highlighter';
import { useColorMode } from 'src/utilities/theme';

import type { SanitizeOptions } from 'src/utilities/sanitizeHTML';

export interface HighlightedMarkdownProps {
  className?: string;
  sanitizeOptions?: SanitizeOptions;
  textOrMarkdown: string;
}

/**
 * Renders markdown as HTML using https://github.com/markdown-it/markdown-it
 * - Used mostly for rendering support ticket messages
 * - Will perform syntax highlighting on any fenced code blocks
 */
export const Markdown = (props: HighlightedMarkdownProps) => {
  const { className, sanitizeOptions, textOrMarkdown } = props;

  const { colorMode } = useColorMode();

  // This is "unsafe" because the output may contain HTML. To be deemed "safe" it
  // needs to be sanitized before rendered as HTML.
  const unsafeMarkdownIt = new MarkdownIt({
    /**
     * We pass a custom highlight function to perform syntax highlighting on code blocks
     */
    highlight(str, lang) {
      try {
        return shiki.codeToHtml(str, {
          lang,
          theme: getHighlighterTheme(colorMode),
        });
      } catch (error) {
        return shiki.codeToHtml(str, {
          lang: 'js',
          theme: getHighlighterTheme(colorMode),
        });
      }
    },
    html: true,
    linkify: true,
  });

  const unsafeParsedMarkdown = unsafeMarkdownIt.render(textOrMarkdown);

  const sanitizedHtml = sanitizeHTML({
    allowMoreAttrs: ['class', 'style'],
    allowMoreTags: ['code', 'span', 'pre'],
    sanitizeOptions,
    sanitizingTier: 'flexible',
    text: unsafeParsedMarkdown,
  });

  return (
    <Typography
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      sx={{ pre: { borderRadius: 1, p: 1 } }}
    />
  );
};
