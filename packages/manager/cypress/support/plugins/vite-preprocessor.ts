import vitePreprocessor from 'cypress-vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import type { CypressPlugin } from './plugin';

export const vitePreprocess: CypressPlugin = (on, _config): void => {
  on(
    'file:preprocessor',
    vitePreprocessor(
      resolve(
        fileURLToPath(import.meta.url),
        '..',
        '..',
        '..',
        'vite.config.ts'
      )
    )
  );
};
