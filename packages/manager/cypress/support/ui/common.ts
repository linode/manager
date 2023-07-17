/* eslint-disable cypress/no-unnecessary-waiting */
import { Method } from 'axios';
import { RouteMatcher } from 'cypress/types/net-stubbing';
import { deleteAllTestLkeClusters } from 'support/api/lke';
import {
  deleteAllTestAccessKeys,
  deleteAllTestBuckets,
} from 'support/api/objectStorage';
import { deleteAllTestOAuthApps } from 'support/api/profile';
import { SimpleBackoffMethod, attemptWithBackoff } from 'support/util/backoff';
import { apiMatcher } from 'support/util/intercepts';

import { deleteAllTestDomains } from '../api/domains';
import { cancelAllTestEntityTransfers } from '../api/entityTransfer';
import { deleteAllTestFirewalls } from '../api/firewalls';
import { deleteAllTestImages } from '../api/images';
import { deleteAllTestLinodes } from '../api/linodes';
import { deleteAllTestClients } from '../api/longview';
import { deleteAllTestNodeBalancers } from '../api/nodebalancers';
import { deleteAllTestStackScripts } from '../api/stackscripts';
import { deleteAllTestTags } from '../api/tags';
import { deleteAllTestVolumes } from '../api/volumes';

export const waitForAppLoad = (path = '/', withLogin = true) => {
  cy.intercept('GET', apiMatcher('linode/instances/*')).as('getLinodes');
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
    '@getLinodes',
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

/**
 * Deletes all test data on the account.
 *
 * In case an HTTP error occurs, 2 additional attempts will be made to delete
 * the data with a 45 second delay between attempts.
 */
export const deleteAllTestData = async () => {
  const backoff = new SimpleBackoffMethod(45000, {
    maxAttempts: 3,
  });

  await attemptWithBackoff(backoff, async () => {
    // Cancel service transfers first, then Linodes, before attempting to delete
    // any other entities.
    await cancelAllTestEntityTransfers();
    await deleteAllTestLinodes();

    // Delete remaining test data.
    await Promise.all([
      deleteAllTestLkeClusters(),
      deleteAllTestNodeBalancers(),
      deleteAllTestImages(),
      deleteAllTestClients(),
      deleteAllTestFirewalls(),
      deleteAllTestStackScripts(),
      deleteAllTestDomains(),
      deleteAllTestBuckets(),
      deleteAllTestAccessKeys(),
      deleteAllTestTags(),
      deleteAllTestVolumes(),
      deleteAllTestOAuthApps(),
    ]);
  });
};
