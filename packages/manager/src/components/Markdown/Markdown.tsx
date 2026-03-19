import { Typography } from '@linode/ui';
import { useTheme } from '@mui/material';
import MarkdownIt from 'markdown-it';
import React from 'react';

import { sanitizeHTML } from 'src/utilities/sanitizeHTML';
import { getHighlighterTheme, shiki } from 'src/utilities/syntax-highlighter';

import type { SanitizeOptions } from 'src/utilities/sanitizeHTML';

export interface HighlightedMarkdownProps {
  className?: string;
  openLinksInNewTab?: boolean;
  sanitizeOptions?: SanitizeOptions;
  textOrMarkdown: string;
}

/**
 * Renders markdown as HTML using https://github.com/markdown-it/markdown-it
 * - Used mostly for rendering support ticket messages
 * - Will perform syntax highlighting on any fenced code blocks
 */
export const Markdown = (props: HighlightedMarkdownProps) => {
  const { className, openLinksInNewTab, sanitizeOptions, textOrMarkdown } =
    props;

  const theme = useTheme();

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
          theme: getHighlighterTheme(theme.palette.mode),
        });
      } catch {
        return shiki.codeToHtml(str, {
          lang: 'js',
          theme: getHighlighterTheme(theme.palette.mode),
        });
      }
    },
    breaks: true,
    html: true,
    linkify: true,
  });

  if (openLinksInNewTab) {
    const defaultRender =
      unsafeMarkdownIt.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    unsafeMarkdownIt.renderer.rules.link_open = function (
      tokens,
      idx,
      options,
      env,
      self
    ) {
      tokens[idx].attrSet('target', '_blank');
      // Adding rel="noopener noreferrer" directly here just as backup,
      // although sanitizeHTML will already add it when it sees target="_blank"
      tokens[idx].attrSet('rel', 'noopener noreferrer');
      return defaultRender(tokens, idx, options, env, self);
    };
  }

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
      sx={{ pre: { borderRadius: 1, overflowX: 'auto', p: 1 } }}
    />
  );
};
