import { UserPreferences } from '@linode/api-v4/types';
import { DateTime } from 'luxon';
import { oauthToken } from 'support/constants/api';
import {
  CommonRequestMockOptions,
  mockCommonRequests,
} from 'support/intercepts/common';
import { apiMatcher } from 'support/util/intercepts';

const overrideLocalStorage = (
  window: any,
  storageOverrides: Record<string, any>
): void => {
  Object.keys(storageOverrides).forEach((key: string) => {
    const value = storageOverrides[key];
    window.localStorage.setItem(key, value);
  });
};

const _loginWithToken = (win) => {
  win.localStorage.setItem('authentication/oauth-token', oauthToken);
  win.localStorage.setItem('authentication/scopes', '*');
  // cy.log(window.localStorage.getItem('authentication/oauth-token'));
  const expireDate = DateTime.local().plus({ days: 30 });
  const isoExpire = expireDate.toISO();
  // cy.log(isoExpire);
  win.localStorage.setItem('authentication/expires', isoExpire);
  win.localStorage.setItem('authentication/expire-datetime', isoExpire);
  win.localStorage.setItem('authentication/token', 'Bearer ' + oauthToken);
  win.localStorage.setItem('authentication/expire', isoExpire);
};

/**
 * Options that can be applied when visiting a Cloud Manager page via `cy.visitWithLogin()`.
 */
export interface LinodeVisitOptions {
  /**
   * Local storage overrides.
   *
   * If `undefined` is passed, local storage overriding will be disabled.
   *
   */
  localStorageOverrides?: Record<string, any>;

  /**
   * Whether or not to mock common Linode API requests.
   *
   * If `true`, mocks are enabled with default options. If a
   * `CommonRequestMockOptions` object is passed, mocks are enabled with the
   * provided options. Otherwise (e.g. `false` or `undefined`) mocks are disabled.
   *
   */
  mockRequests?: CommonRequestMockOptions | boolean;

  /**
   * User preference overrides.
   *
   * The given object will override the specific user preferences fetched by
   * Cloud Manager without mocking the preferences altogether.
   *
   * If `undefined` is passed, preference overriding will be disabled.
   *
   */
  preferenceOverrides?: UserPreferences;
}

Cypress.Commands.add(
  'visitWithLogin',
  (url: string, linodeOptions?: LinodeVisitOptions, cypressOptions?: any) => {
    const defaultLinodeOptions: LinodeVisitOptions = {
      localStorageOverrides: undefined,
      mockRequests: true,
      preferenceOverrides: undefined,
    };

    const resolvedLinodeOptions = linodeOptions
      ? {
          ...defaultLinodeOptions,
          ...linodeOptions,
        }
      : defaultLinodeOptions;

    // returning false here prevents Cypress from
    // failing the test with newrelic errors
    Cypress.on('uncaught:exception', (_err, _runnable) => false);

    const opt = {
      onBeforeLoad: (win: any) => {
        _loginWithToken(win);
        if (resolvedLinodeOptions.localStorageOverrides) {
          overrideLocalStorage(
            win,
            resolvedLinodeOptions.localStorageOverrides
          );
        }
      },
    };

    if (resolvedLinodeOptions.mockRequests) {
      const mockOptions =
        typeof resolvedLinodeOptions.mockRequests === 'boolean'
          ? undefined
          : resolvedLinodeOptions.mockRequests;
      mockCommonRequests(mockOptions);
    }

    if (resolvedLinodeOptions.preferenceOverrides) {
      cy.intercept('GET', apiMatcher('profile/preferences*'), (request) => {
        request.continue((response) => {
          response.body = {
            ...response?.body,
            ...resolvedLinodeOptions.preferenceOverrides,
          };
        });
      });
    }

    console.log('executing visit');
    return cy.visit(url, { ...cypressOptions, ...opt });
  }
);
