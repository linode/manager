/* eslint-disable cypress/no-unnecessary-waiting */
import { Method } from 'axios';
import { RouteMatcher } from 'cypress/types/net-stubbing';
import { deleteAllTestDomains } from '../api/domains';
import { deleteAllTestFirewalls } from '../api/firewalls';
import { deleteAllTestImages } from '../api/images';
import { deleteAllTestLinodes } from '../api/linodes';
import { deleteAllTestClients } from '../api/longview';
import { deleteAllTestNodeBalancers } from '../api/nodebalancers';
import {
  deleteAllTestAccessKeys,
  deleteAllTestBuckets,
} from 'support/api/objectStorage';
import { deleteAllTestStackscripts } from '../api/stackscripts';
import { deleteAllTestVolumes } from '../api/volumes';
import { deleteAllTestTags } from '../api/tags';
import { cancelAllTestEntityTransfers } from '../api/entityTransfer';
import { apiMatcher } from 'support/util/intercepts';

const attempt = (fn, attemptsRemaining, delayBetweenAttemptsMs) => {
  cy.log(`Attempts remaining: ${attemptsRemaining}`);
  if (attemptsRemaining <= 1) {
    return fn(); // last attempt
  }
  try {
    return fn();
  } catch (err) {
    cy.wait(delayBetweenAttemptsMs);
    return attempt(fn, attemptsRemaining - 1, delayBetweenAttemptsMs);
  }
};

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

export const deleteAllTestData = () => {
  // Asynchronous test data deletion runs first.
  const asyncDeletionPromise = Promise.all([
    deleteAllTestBuckets(),
    deleteAllTestAccessKeys(),
    deleteAllTestTags(),
    cancelAllTestEntityTransfers(),
  ]);

  // Remaining deletion functions then run sequentially.
  cy.defer(asyncDeletionPromise).then(() => {
    deleteAllTestLinodes();
    deleteAllTestNodeBalancers();
    deleteAllTestVolumes();
    deleteAllTestImages();
    deleteAllTestClients();
    deleteAllTestFirewalls();
    deleteAllTestStackscripts();
    deleteAllTestDomains();
  });
};
