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

    displayBrowserInfo(browser, launchOptions);

    return launchOptions;
  });
};
