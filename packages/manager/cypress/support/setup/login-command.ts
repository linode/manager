import { DateTime } from 'luxon';
import { oauthToken } from 'support/constants/api';
import { apiMatcher } from 'support/util/intercepts';

import type { UserPreferences } from '@linode/api-v4';

const overrideLocalStorage = (
  window: Window,
  storageOverrides: Record<string, any>
): void => {
  Object.keys(storageOverrides).forEach((key: string) => {
    const value = storageOverrides[key];
    window.localStorage.setItem(key, value);
  });
};

const _loginWithToken = (win: Window) => {
  win.localStorage.setItem('authentication/scopes', '*');
  win.localStorage.setItem('authentication/token', 'Bearer ' + oauthToken);
  win.localStorage.setItem(
    'authentication/expire',
    DateTime.local().plus({ days: 30 }).toISO()
  );
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
      onBeforeLoad: (win: Window) => {
        _loginWithToken(win);
        if (resolvedLinodeOptions.localStorageOverrides) {
          overrideLocalStorage(
            win,
            resolvedLinodeOptions.localStorageOverrides
          );
        }
      },
      failOnStatusCode: false,
    };

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

    return cy.visit(url, { ...cypressOptions, ...opt });
  }
);
