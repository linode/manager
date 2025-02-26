import { mockGetLinodes } from 'support/intercepts/linodes';
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

const mockChildAccount = accountFactory.build({
  company: 'Partner Company',
});

const mockChildAccountProxyUser = accountUserFactory.build({
  username: randomLabel(),
  user_type: 'proxy',
});

const mockChildAccountProxyProfile = profileFactory.build({
  username: mockChildAccountProxyUser.username,
  user_type: 'proxy',
});

describe('Parent/Child token expiration', () => {
  /*
   * - Confirms flow when a Proxy user attempts to switch back to a Parent account with expired auth token.
   * - Uses mock API and local storage data.
   */
  it('shows session expiry prompt upon switching back to Parent account with expired Parent token', () => {
    mockGetLinodes([]).as('getLinodes');
    mockGetAccount(mockChildAccount);
    mockGetProfile(mockChildAccountProxyProfile);
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

    // Wait for page load, then click "Switch Account" button.
    cy.wait('@getLinodes');
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

    cy.url().should('endWith', '/login');
  });
});
