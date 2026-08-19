import MarkdownIt from 'markdown-it';
import * as React from 'react';
import { useMemo } from 'react';

import { Typography } from '../Typography/Typography';
import styles from './Markdown.module.css';
import { sanitizeMarkdownHTML } from './sanitizeHTML';
import { getHighlighterTheme, shiki } from './syntaxHighlighter';

export interface MarkdownProps {
  className?: string;
  colorMode: 'dark' | 'light';
  /** When true, rendered links open in a new tab with rel="noopener noreferrer". */
  openLinksInNewTab?: boolean;
  textOrMarkdown: string;
}

/**
 * Renders a markdown string as sanitized HTML with syntax-highlighted code blocks.
 */
export const Markdown = ({
  className,
  colorMode,
  openLinksInNewTab,
  textOrMarkdown,
}: MarkdownProps) => {
  const md = useMemo(() => {
    const instance = new MarkdownIt({
      highlight(str, lang) {
        const theme = getHighlighterTheme(colorMode);
        try {
          return shiki.codeToHtml(str, { lang, theme });
        } catch {
          return '';
        }
      },
      breaks: true,
      html: false,
      linkify: true,
    });

    if (openLinksInNewTab) {
      const defaultRender =
        instance.renderer.rules.link_open ||
        function (tokens, idx, options, _env, self) {
          return self.renderToken(tokens, idx, options);
        };

      instance.renderer.rules.link_open = function (
        tokens,
        idx,
        options,
        env,
        self
      ) {
        tokens[idx].attrSet('target', '_blank');
        tokens[idx].attrSet('rel', 'noopener noreferrer');
        return defaultRender(tokens, idx, options, env, self);
      };
    }

    return instance;
  }, [colorMode, openLinksInNewTab]);

  const sanitizedHtml = useMemo(
    () => sanitizeMarkdownHTML(md.render(textOrMarkdown)),
    [md, textOrMarkdown]
  );

  return (
    <Typography
      className={[styles.markdown, className].filter(Boolean).join(' ')}
      component="div"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
