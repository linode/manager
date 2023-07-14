/* eslint-disable @typescript-eslint/no-var-requires */
import { Theme, useTheme } from '@mui/material/styles';
import * as hljs from 'highlight.js/lib/core';
import apache from 'highlight.js/lib/languages/apache';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import nginx from 'highlight.js/lib/languages/nginx';
import yaml from 'highlight.js/lib/languages/yaml';
import * as React from 'react';
import sanitize from 'sanitize-html';

import { Typography } from 'src/components/Typography';
import 'src/formatted-text.css';
import { unsafe_MarkdownIt } from 'src/utilities/markdown';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

hljs.registerLanguage('apache', apache);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('yaml', yaml);

export type SupportedLanguage =
  | 'apache'
  | 'bash'
  | 'javascript'
  | 'nginx'
  | 'plaintext'
  | 'shell'
  | 'yaml';

export interface HighlightedMarkdownProps {
  className?: string;
  language?: SupportedLanguage;
  sanitizeOptions?: sanitize.IOptions;
  textOrMarkdown: string;
}

export const HighlightedMarkdown = (props: HighlightedMarkdownProps) => {
  const theme = useTheme<Theme>();
  const { className, language, sanitizeOptions, textOrMarkdown } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);

  /**
   * If the language prop is provided, we'll try to override the language
   * auto detection to specify the selected language.
   */
  React.useEffect(() => {
    if (language) {
      hljs.configure({
        languages: [language],
      });
    }
  }, [language]);

  const unsafe_parsedMarkdown = unsafe_MarkdownIt.render(textOrMarkdown);

  const sanitizedHtml = sanitizeHTML(unsafe_parsedMarkdown, sanitizeOptions);

  // Adapted from https://stackblitz.com/edit/react-highlighted-markdown?file=highlighted-markdown.tsx
  // All the safety checking is due to a reported error from certain versions of FireFox.
  React.useEffect(() => {
    try {
      if (rootRef.current) {
        const blocks = rootRef.current.querySelectorAll('pre code') ?? [];
        const len = blocks.length ?? 0;
        let i = 0;
        for (i; i < len; i++) {
          hljs.highlightBlock(blocks[i]);
        }
      }
    } catch {
      // do nothing, it's not the end of the world if we can't highlight Markdown.
    }
  }, [textOrMarkdown]);

  return (
    <Typography
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
      sx={{
        '& .hljs': {
          color: theme.color.offBlack,
        },
      }}
      className={`formatted-text ${className}`}
      ref={rootRef}
    />
  );
};
