import vitePreprocessor from 'cypress-vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import { CypressPlugin } from './plugin';

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
