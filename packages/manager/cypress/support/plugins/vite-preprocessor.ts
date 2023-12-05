import vitePreprocessor from 'cypress-vite';
import { resolve } from 'path';

import { CypressPlugin } from './plugin';
import { fileURLToPath } from 'url';

export const vitePreprocess: CypressPlugin = (on, _config): void => {
  on(
    'file:preprocessor',
    vitePreprocessor(
      resolve(fileURLToPath(import.meta.url), '..', '..', 'vite.config.ts')
    )
  );
};
