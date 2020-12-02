/* eslint-disable @typescript-eslint/no-var-requires */
import * as classNames from 'classnames';
import * as hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/lightfair.css';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import 'src/formatted-text.css';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { unsafe_MarkdownIt } from 'src/utilities/markdown';
// Register all languages we intend to use
hljs.registerLanguage('apache', require('highlight.js/lib/languages/apache'));
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage(
  'javascript',
  require('highlight.js/lib/languages/javascript')
);
hljs.registerLanguage('nginx', require('highlight.js/lib/languages/nginx'));
hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml'));

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& .hljs': {
      color: theme.color.offBlack
    }
  }
}));

export type SupportedLanguage =
  | 'plaintext'
  | 'apache'
  | 'bash'
  | 'javascript'
  | 'nginx'
  | 'yaml';

export interface HighlightedMarkdownProps {
  textOrMarkdown: string;
  language?: SupportedLanguage;
}

export const HighlightedMarkdown: React.FC<HighlightedMarkdownProps> = props => {
  const classes = useStyles();
  const { language, textOrMarkdown } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);

  /**
   * If the language prop is provided, we'll try to override the language
   * auto detection to specify the selected language.
   */
  React.useEffect(() => {
    if (language) {
      hljs.configure({
        languages: [language]
      });
    }
  }, [language]);

  const unsafe_parsedMarkdown = unsafe_MarkdownIt.render(textOrMarkdown);

  const sanitizedHtml = sanitizeHTML(unsafe_parsedMarkdown);

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
      className={classNames({
        [classes.root]: true,
        'formatted-text': true
      })}
      ref={rootRef}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml
      }}
    />
  );
};

export default HighlightedMarkdown;
