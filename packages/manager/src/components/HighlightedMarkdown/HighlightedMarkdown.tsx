import hljs from 'highlight.js/lib/highlight';
// Import languages as we need them to keep bundle size down
import apache from 'highlight.js/lib/languages/apache';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import nginx from 'highlight.js/lib/languages/nginx';
import yaml from 'highlight.js/lib/languages/yaml';
import 'highlight.js/styles/an-old-hope.css';
import * as React from 'react';
import { Converter } from 'showdown';

import Typography from 'src/components/core/Typography';
import 'src/formatted-text.css';
import { sanitizeHTML } from 'src/utilities/sanitize-html';

// Register all languages we intend to use
hljs.registerLanguage('apache', apache);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('yaml', yaml);

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

  const html = React.useMemo(() => {
    return new Converter({
      simplifiedAutoLink: true,
      openLinksInNewWindow: true
    }).makeHtml(textOrMarkdown);
  }, [textOrMarkdown]);

  const sanitizedHtml = sanitizeHTML(html);

  // Adapted from https://stackblitz.com/edit/react-highlighted-markdown?file=highlighted-markdown.tsx
  React.useEffect(() => {
    rootRef.current?.querySelectorAll('pre code').forEach(block => {
      hljs.highlightBlock(block);
    });
  }, [textOrMarkdown]);

  return (
    <Typography
      className="formatted-text"
      ref={rootRef}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml
      }}
    />
  );
};

export default HighlightedMarkdown;
