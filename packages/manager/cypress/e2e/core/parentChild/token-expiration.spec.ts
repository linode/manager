import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import {
  accountFactory,
  accountUserFactory,
  profileFactory,
} from 'src/factories';
import { randomLabel, randomString } from 'support/util/random';
import {
  mockGetAccount,
  mockGetChildAccounts,
} from 'support/intercepts/account';
import { mockGetProfile } from 'support/intercepts/profile';
import { DateTime } from 'luxon';
import { ui } from 'support/ui';
// import { mockAllApiRequests } from 'support/intercepts/general';
// import { mockGetUser } from 'support/intercepts/account';

const mockChildAccount = accountFactory.build({
  company: 'Partner Company',
});

const mockChildAccountProxyUser = accountUserFactory.build({
  username: randomLabel(),
  user_type: 'proxy',
});

const mockChildAccountProfile = profileFactory.build({
  username: mockChildAccountProxyUser.username,
  user_type: 'proxy',
});

describe('Parent/Child token expiration', () => {
  // @TODO M3-7554, M3-7559: Remove feature flag mocks after launch and clean-up.
  beforeEach(() => {
    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
  });

  it.skip('wip', () => {
    // mockGetLinodes([]).as('getLinodes');
    // mockAllApiRequests({}, 401);
    // mockGetAccount(mockChildAccount);
    // mockGetProfile(mockChildAccountProfile);
    // mockGetChildAccounts([]);
    // Mock local storage parent token expiry to have already passed.
    // cy.visitWithLogin('/', {
    //   localStorageOverrides: {
    //     proxy_user: true,
    //     'authentication/token': `Bearer ${randomString(32)}`,
    //     'authentication/expire': DateTime.local().minus({ minutes: 30 }).toISO(),
    //     'authentication/scopes': '*',
    //     'authentication/parent_token/token': `Bearer ${Cypress.env('MANAGER_OAUTH')}`,
    //     'authentication/parent_token/expire': DateTime.local().plus({ minutes: 30 }).toISO(),
    //     'authentication/parent_token/scopes': '*',
    //   },
    // });
    // // Wait for page load
    // cy.wait('@getLinodes');
  });

  it('shows session expiry prompt upon switching back to Parent account', () => {
    mockGetLinodes([]).as('getLinodes');
    mockGetAccount(mockChildAccount);
    mockGetProfile(mockChildAccountProfile);
    mockGetChildAccounts([]);

    // Mock local storage parent token expiry to have already passed.
    cy.visitWithLogin('/', {
      localStorageOverrides: {
        proxy_user: true,
        'authentication/parent_token/token': `Bearer ${randomString(32)}`,
        'authentication/parent_token/expire': DateTime.local()
          .minus({ minutes: 30 })
          .toISO(),
        'authentication/parent_token/scopes': '*',
      },
    });

    // Wait for page load
    cy.wait('@getLinodes');

    // Click "Switch Account" button.
    ui.userMenuButton.find().should('be.visible').click();

    ui.userMenu
      .find()
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Switch Account')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    // Confirm session expiry prompt, and that clicking "Log In" prompts login flow.
    ui.dialog
      .findByTitle('Session expired')
      .should('be.visible')
      .within(() => {
        ui.button
          .findByTitle('Log in')
          .should('be.visible')
          .should('be.enabled')
          .click();
      });

    cy.url().should('endWith', '/logout');
  });
});
