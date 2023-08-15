/* eslint-disable cypress/no-unnecessary-waiting */
import { Method } from 'axios';
import { RouteMatcher } from 'cypress/types/net-stubbing';
import { apiMatcher } from 'support/util/intercepts';

export const waitForAppLoad = (path = '/', withLogin = true) => {
  cy.intercept('GET', apiMatcher('account')).as('getAccount');
  cy.intercept('GET', apiMatcher('profile')).as('getProfile');
  cy.intercept('GET', apiMatcher('account/settings')).as('getAccountSettings');
  cy.intercept('GET', apiMatcher('profile/preferences')).as(
    'getProfilePreferences'
  );
  cy.intercept('GET', apiMatcher('account/notifications**')).as(
    'getNotifications'
  );

  withLogin ? cy.visitWithLogin(path) : cy.visit(path);
  cy.wait([
    '@getAccount',
    '@getAccountSettings',
    '@getProfilePreferences',
    '@getProfile',
    '@getNotifications',
  ]);
};

// use this if the call happens multiple times but you only want to intercept it once
export const interceptOnce = (
  method: Method,
  url: RouteMatcher,
  response: {}
) => {
  let count = 0;
  return cy.intercept(method, url, (req) => {
    count += 1;
    if (count < 2) {
      req.reply(response);
    }
  });
};
