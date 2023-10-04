import type { CypressPlugin } from './plugin';

/**
 * Attempts to resolve hanging tests by forcing Chrome's old headless implementation.
 *
 * See also: https://github.com/cypress-io/cypress/issues/27264
 */
export const disableChromeNewHeadless: CypressPlugin = (on, _config) => {
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args.push('--headless=old');
    }
    return launchOptions;
  });
};
