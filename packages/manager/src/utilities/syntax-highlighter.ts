import bash from '@shikijs/langs/bash';
import go from '@shikijs/langs/go';
import javascript from '@shikijs/langs/javascript';
import python from '@shikijs/langs/python';
import shell from '@shikijs/langs/shell';
import typescript from '@shikijs/langs/typescript';
import yaml from '@shikijs/langs/yaml';
import darkTheme from '@shikijs/themes/one-dark-pro';
import lightTheme from '@shikijs/themes/one-light';
import { createHighlighterCoreSync } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import type { ThemeName } from '@linode/ui';

const languages = {
  bash,
  go,
  javascript,
  python,
  shell,
  typescript,
  yaml,
};

export type SupportedLanguage = keyof typeof languages;

export const shiki = createHighlighterCoreSync({
  engine: createJavaScriptRegexEngine(),
  langs: Object.values(languages),
  themes: [lightTheme, darkTheme],
});

export function getHighlighterTheme(theme: ThemeName) {
  if (theme === 'dark') {
    return 'one-dark-pro';
  }
  return 'one-light';
}
