import type { CypressPlugin } from './plugin';

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
    // Explicitly set Chrome pointer type.
    //
    // This is useful to for webpages/components that attempt to detect if a
    // user is using a desktop device or a mobile device.
    //
    // MUI's date/time picker uses the `@media (pointer: fine)` media query
    // to accomplish this, which does not match on headless CI environments,
    // prompting the component to behave as if it were running on a mobile
    // device.
    //
    // See also:
    // - https://mui.com/x/react-date-pickers/date-time-picker/
    // - https://mui.com/x/react-date-pickers/base-concepts/#testing-caveats
    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args.push('--blink-settings=primaryPointerType=4');
    }

    displayBrowserInfo(browser, launchOptions);

    return launchOptions;
  });
};
