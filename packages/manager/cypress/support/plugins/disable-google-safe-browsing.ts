import { CypressPlugin } from './plugin';

/*
 * Disable requests to Google's safe browsing API.
 *
 * We opt to disable these requests because they can be slow and have
 * contributed to test timeouts before.
 */
export const disableGoogleSafeBrowsing: CypressPlugin = (on, _config) => {
  on('before:browser:launch', (_browser, launchOptions) => {
    const originalPreferences = launchOptions.preferences.default;
    launchOptions.preferences.default = {
      ...originalPreferences,
      safebrowsing: {
        enabled: false,
      },
    };
    return launchOptions;
  });
};
