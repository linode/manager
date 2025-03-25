import { DateTime } from 'luxon';
import {
  mockGetAccount,
  mockGetChildAccounts,
} from 'support/intercepts/account';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { randomLabel, randomString } from 'support/util/random';

import {
  accountFactory,
  accountUserFactory,
  profileFactory,
} from 'src/factories';

const mockChildAccount = accountFactory.build({
  company: 'Partner Company',
});

const mockChildAccountProxyUser = accountUserFactory.build({
  user_type: 'proxy',
  username: randomLabel(),
});

const mockChildAccountProxyProfile = profileFactory.build({
  user_type: 'proxy',
  username: mockChildAccountProxyUser.username,
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
        'authentication/parent_token/expire': DateTime.local()
          .minus({ minutes: 30 })
          .toISO(),
        'authentication/parent_token/scopes': '*',
        'authentication/parent_token/token': `Bearer ${randomString(32)}`,
        proxy_user: true,
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
