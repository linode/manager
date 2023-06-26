import { CypressPlugin } from './plugin';

// Dependencies used in hooks have to use `require()` syntax.
const path = require('path'); // eslint-disable-line
const vitePreprocessor = require('cypress-vite'); // eslint-disable-line

export const vitePreprocess: CypressPlugin = (on, _config): void => {
  on(
    'file:preprocessor',
    vitePreprocessor(path.resolve(__dirname, '..', '..', 'vite.config.ts'))
  );
};
