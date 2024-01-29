import { CypressPlugin } from './plugin';

/**
 * Displays a table of information about the browser being used for the tests.
 */
const displayBrowserInfo = (
  browser: Cypress.Browser,
  launchOptions: Cypress.BeforeBrowserLaunchOptions
) => {
  const browserBasicInfo = {
    Browser: `${browser.displayName} v${browser.version}`,
    Family: browser.family,
    Headless: browser.isHeadless ? 'Yes' : 'No',
  };

  const browserChromeSpecificInfo =
    browser.name === 'chrome'
      ? {
          // Show whether we're using the new or old Chrome headless implementation.
          'Chrome Headless': (() => {
            if (!browser.isHeadless) {
              return 'N/A';
            }
            if (launchOptions.args.includes('--headless=old')) {
              return 'Old';
            }
            return 'New';
          })(),
        }
      : {};

  console.log('Browser information:');
  console.table({
    ...browserBasicInfo,
    ...browserChromeSpecificInfo,
  });
};

/**
 * Configures the browser instance for Cypress testing.
 */
export const configureBrowser: CypressPlugin = (on, _config) => {
  on('before:browser:launch', (browser, launchOptions) => {
    const originalPreferences = launchOptions.preferences.default;

    // Disable requests to Google's safe browsing API.
    // We opt to disable these requests because they can be slow and have
    // contributed to test timeouts in the past.
    launchOptions.preferences.default = {
      ...originalPreferences,
      safebrowsing: {
        enabled: false,
      },
    };

    // Disable Chrome's new headless implementation.
    // This attempts to resolve indefinite test hanging.
    //
    // See also: https://github.com/cypress-io/cypress/issues/27264
    if (browser.name === 'chrome' && browser.isHeadless) {
      // If present, remove the `--headless=new` command line argument.
      launchOptions.args = launchOptions.args.filter((arg: string) => {
        return arg !== '--headless=new';
      });
      // Append `--headless=old` and `--disable-dev-shm-usage` args.
      launchOptions.args.push('--headless=old');
      launchOptions.args.push('--disable-dev-shm-usage');
    }

    displayBrowserInfo(browser, launchOptions);
    return launchOptions;
  });
};
