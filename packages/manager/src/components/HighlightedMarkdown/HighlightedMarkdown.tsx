import * as hljs from 'highlight.js/lib/core';
import apache from 'highlight.js/lib/languages/apache';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import nginx from 'highlight.js/lib/languages/nginx';
import yaml from 'highlight.js/lib/languages/yaml';
import HLJSDarkTheme from 'highlight.js/styles/a11y-dark.css?raw';
import HLJSLightTheme from 'highlight.js/styles/a11y-light.css?raw';
import * as React from 'react';
import sanitize from 'sanitize-html';

import { Typography } from 'src/components/Typography';
import 'src/formatted-text.css';
import { ThemeName } from 'src/foundations/themes';
import { unsafe_MarkdownIt } from 'src/utilities/markdown';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';
import { useColorMode } from 'src/utilities/theme';

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
  const { className, language, sanitizeOptions, textOrMarkdown } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);

  const { colorMode } = useColorMode();

  /**
   * This function exists because we use Hightlight.js and it does not have a built-in
   * way to programaticly change the theme.
   *
   * We must manually switch our Highlight.js theme's CSS when our theme is changed.
   */
  const handleThemeChange = async (theme: ThemeName) => {
    const THEME_STYLE_ID = 'hljs-theme';
    const existingStyleTag = document.getElementById(THEME_STYLE_ID);

    if (existingStyleTag) {
      // If the style tag already exists in the <head>, just update the css content.
      existingStyleTag.innerHTML =
        theme === 'light' ? HLJSLightTheme : HLJSDarkTheme;
    } else {
      // The page has been loaded and we need to manually append our Hightlight.js
      // css so we can easily change it later on.
      const styleTag = document.createElement('style');
      styleTag.id = THEME_STYLE_ID;
      styleTag.innerHTML = theme === 'light' ? HLJSLightTheme : HLJSDarkTheme;
      document.head.appendChild(styleTag);
    }
  };

  React.useEffect(() => {
    handleThemeChange(colorMode);
  }, [colorMode]);

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
      sx={(theme) => ({
        '& .hljs': {
          color: theme.color.offBlack,
        },
      })}
      className={`formatted-text ${className}`}
      ref={rootRef}
    />
  );
};
