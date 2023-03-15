/* eslint-disable @typescript-eslint/no-var-requires */
import classNames from 'classnames';
import * as hljs from 'highlight.js/lib/core';
import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import 'src/formatted-text.css';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { unsafe_MarkdownIt } from 'src/utilities/markdown';
import sanitize from 'sanitize-html';
import apache from 'highlight.js/lib/languages/apache';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import nginx from 'highlight.js/lib/languages/nginx';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('apache', apache);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('yaml', yaml);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .hljs': {
      color: theme.color.offBlack,
    },
  },
}));

export type SupportedLanguage =
  | 'plaintext'
  | 'apache'
  | 'bash'
  | 'javascript'
  | 'nginx'
  | 'yaml'
  | 'shell';

export interface HighlightedMarkdownProps {
  className?: string;
  textOrMarkdown: string;
  language?: SupportedLanguage;
  sanitizeOptions?: sanitize.IOptions;
}

export const HighlightedMarkdown = (props: HighlightedMarkdownProps) => {
  const classes = useStyles();
  const { className, language, textOrMarkdown, sanitizeOptions } = props;
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
      className={classNames(classes.root, 'formatted-text', className)}
      ref={rootRef}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
};

export default HighlightedMarkdown;
