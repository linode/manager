import {
  accountFactory,
  appTokenFactory,
  profileFactory,
} from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { DateTime } from 'luxon';
import {
  mockCreateChildAccountToken,
  mockGetAccount,
  mockGetChildAccounts,
  mockGetUser,
} from 'support/intercepts/account';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockAllApiRequests } from 'support/intercepts/general';
import { mockGetProfile } from 'support/intercepts/profile';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { assertLocalStorageValue } from 'support/util/local-storage';
import { randomLabel, randomNumber, randomString } from 'support/util/random';

describe('Parent/Child account switching', () => {
  it('can switch from Parent account to Child account', () => {
    const mockParentAccount = accountFactory.build({
      company: 'Parent Company',
    });
    const mockParentProfile = profileFactory.build({
      username: randomLabel(),
      user_type: 'parent',
    });
    const mockParentUser = accountUserFactory.build({
      username: mockParentProfile.username,
      user_type: 'parent',
    });

    const mockChildAccount = accountFactory.build({
      company: 'Child Company',
    });

    const mockChildAccountToken = appTokenFactory.build({
      id: randomNumber(),
      created: DateTime.now().toISO(),
      expiry: DateTime.now().plus({ hours: 1 }).toISO(),
      label: `${mockChildAccount.company}_proxy`,
      scopes: '*',
      token: randomString(32),
      website: undefined,
      thumbnail_url: undefined,
    });

    mockAppendFeatureFlags({
      parentChildAccountAccess: makeFeatureFlagData(true),
    });
    mockGetFeatureFlagClientstream();
    mockGetProfile(mockParentProfile);
    mockGetAccount(mockParentAccount);
    mockGetChildAccounts([mockChildAccount]);
    mockGetUser(mockParentUser);

    cy.visitWithLogin('/');

    // Confirm that Parent account username and company name are shown in user
    // menu button, then click the button.
    ui.userMenuButton
      .find()
      .should('be.visible')
      .within(() => {
        cy.findByText(mockParentProfile.username).should('be.visible');
        cy.findByText(mockParentAccount.company).should('be.visible');
      })
      .click();

    // Click "Switch Account" button in user menu.
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

    // Click mock company name in "Switch Account" drawer.
    mockCreateChildAccountToken(mockChildAccount, mockChildAccountToken).as(
      'switchAccount'
    );
    ui.drawer
      .findByTitle('Switch Account')
      .should('be.visible')
      .within(() => {
        cy.findByText(mockChildAccount.company).should('be.visible').click();
      });

    cy.wait('@switchAccount');

    // Confirm that Cloud Manager updates local storage authentication values.
    assertLocalStorageValue(
      'authentication/token',
      mockChildAccountToken.token
    );
    assertLocalStorageValue(
      'authentication/expire',
      mockChildAccountToken.expiry
    );
    assertLocalStorageValue(
      'authentication/scopes',
      mockChildAccountToken.scopes
    );

    // From this point forward, we will not have a valid test account token stored in local storage,
    // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
    // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
    // individual requests as needed.
    mockAllApiRequests();
    mockGetAccount(mockChildAccount);
    mockGetProfile(mockParentProfile);
    mockGetUser(mockParentUser);

    // TODO Remove the call to `cy.reload()` once Cloud Manager automatically updates itself upon account switching.
    // TODO Add assertions for toast upon account switch.
    // This probably involves updating the Axios interceptor to use the new auth token, and possibly involves invalidating React Query cache.
    cy.reload();

    ui.userMenuButton
      .find()
      .should('be.visible')
      .within(() => {
        cy.findByText(mockParentProfile.username).should('be.visible');
        cy.findByText(mockChildAccount.company).should('be.visible');
      });
  });
});
