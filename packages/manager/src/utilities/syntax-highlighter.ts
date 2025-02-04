import html from '@shikijs/langs/html';
import js from '@shikijs/langs/javascript';
import markdown from '@shikijs/langs/markdown';
import shell from '@shikijs/langs/shell';
import yaml from '@shikijs/langs/yaml';
import darkTheme from '@shikijs/themes/one-dark-pro';
import lightTheme from '@shikijs/themes/one-light';
import { createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki';

import type { ThemeName } from '@linode/ui';

export const shiki = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: [js, markdown, html, yaml, shell],
  themes: [lightTheme, darkTheme],
});

export function getHighlighterTheme(theme: ThemeName) {
  if (theme === 'dark') {
    return 'one-dark-pro';
  }
  return 'one-light';
}
