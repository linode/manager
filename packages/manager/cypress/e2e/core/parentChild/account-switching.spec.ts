import {
  accountFactory,
  appTokenFactory,
  paymentMethodFactory,
  profileFactory,
} from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { DateTime } from 'luxon';
import {
  interceptGetInvoices,
  interceptGetPayments,
  interceptGetPaymentMethods,
  mockCreateChildAccountToken,
  mockCreateChildAccountTokenError,
  mockGetAccount,
  mockGetChildAccounts,
  mockGetChildAccountsError,
  mockGetInvoices,
  mockGetPaymentMethods,
  mockGetPayments,
  mockGetUser,
} from 'support/intercepts/account';
import { mockGetEvents, mockGetNotifications } from 'support/intercepts/events';
import {
  mockAppendFeatureFlags,
  mockGetFeatureFlagClientstream,
} from 'support/intercepts/feature-flags';
import { mockAllApiRequests } from 'support/intercepts/general';
import { mockGetLinodes } from 'support/intercepts/linodes';
import { mockGetProfile } from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
import { makeFeatureFlagData } from 'support/util/feature-flags';
import { assertLocalStorageValue } from 'support/util/local-storage';
import { randomLabel, randomNumber, randomString } from 'support/util/random';

/**
 * Confirms expected username and company name are shown in user menu button and yields the button.
 *
 * @param username - Username to expect in user menu button.
 * @param companyName - Company name to expect in user menu button.
 *
 * @returns Cypress chainable that yields the user menu button.
 */
const assertUserMenuButton = (username: string, companyName: string) => {
  return ui.userMenuButton
    .find()
    .should('be.visible')
    .within(() => {
      cy.findByText(username).should('be.visible');
      cy.findByText(companyName).should('be.visible');
    });
};

/**
 * Confirms that expected authentication values are set in Local Storage.
 *
 * @param token - Authentication token value to assert.
 * @param expiry - Authentication expiry value to assert.
 * @param scopes - Authentication scope value to assert.
 */
const assertAuthLocalStorage = (
  token: string,
  expiry: string,
  scopes: string
) => {
  assertLocalStorageValue('authentication/token', `Bearer ${token}`);
  assertLocalStorageValue('authentication/expire', expiry);
  assertLocalStorageValue('authentication/scopes', scopes);
};

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

const mockChildAccountProxyUser = accountUserFactory.build({
  username: 'Partner User',
  user_type: 'proxy',
});

const mockChildAccountProfile = profileFactory.build({
  username: mockChildAccountProxyUser.username,
  user_type: 'proxy',
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

const mockErrorMessage = 'An unknown error has occurred.';

describe('Parent/Child account switching', () => {
  /**
   * Tests to confirm that Parent account users can switch back from Child accounts as expected.
   */
  describe('From Proxy to Parent', () => {
    beforeEach(() => {
      mockAppendFeatureFlags({
        parentChildAccountAccess: makeFeatureFlagData(true),
      });
      mockGetFeatureFlagClientstream();
    });

    it.only('can switch from Child account to Parent account from Billing page', () => {
      const mockParentToken = randomString(32);

      mockGetAccount(mockChildAccount);
      mockGetProfile(mockChildAccountProfile);
      mockGetChildAccounts([mockParentAccount]);
      mockGetUser(mockChildAccountProxyUser);
      interceptGetPayments().as('getPayments');
      interceptGetPaymentMethods().as('getPaymentMethods');
      interceptGetInvoices().as('getInvoices');

      // Visit billing page with `authentication/parent_token/*` local storage
      // data set to mock values.
      cy.visitWithLogin('/account/billing', {
        localStorageOverrides: {
          'authentication/parent_token/token': `Bearer ${mockParentToken}`,
          'authentication/parent_token/expire':
            'Thu Mar 07 2024 16:59:36 GMT-0500 (Eastern Standard Time)',
          'authentication/parent_token/scopes': '*',
        },
      });

      // Wait for page to finish loading before proceeding with account switch.
      cy.wait(['@getPayments', '@getPaymentMethods', '@getInvoices']);

      ui.button
        .findByTitle('Switch Account')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Prepare mocks in advance of the account switch. As soon as the child account is clicked,
      // Cloud will replace its stored token with the token provided by the API and then reload.
      // From that point forward, we will not have a valid test account token stored in local storage,
      // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
      // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
      // individual requests as needed.
      mockAllApiRequests();
      mockGetLinodes([]);
      mockGetRegions([]);
      mockGetEvents([]);
      mockGetNotifications([]);
      mockGetAccount(mockParentAccount);
      mockGetProfile(mockParentProfile);
      mockGetUser(mockParentUser);
      mockGetPaymentMethods(paymentMethodFactory.buildList(1));
      mockGetInvoices([]);
      mockGetPayments([]);

      ui.drawer
        .findByTitle('Switch Account')
        .should('be.visible')
        .within(() => {
          cy.findByText(mockParentAccount.company).should('be.visible').click();
        });

      cy.wait(1000000);
    });
  });

  /*
   * Tests to confirm that Parent account users can switch to Child accounts as expected.
   */
  describe('From Parent to Proxy', () => {
    beforeEach(() => {
      // @TODO M3-7554, M3-7559: Remove feature flag mocks after feature launch and clean-up.
      mockAppendFeatureFlags({
        parentChildAccountAccess: makeFeatureFlagData(true),
      });
      mockGetFeatureFlagClientstream();
    });

    /*
     * - Confirms that Parent account user can switch to Child account from Account Billing page.
     * - Confirms that Child account information is displayed in user menu button after switch.
     * - Confirms that Cloud updates local storage auth values upon account switch.
     */
    it('can switch from Parent account to Child account from Billing page', () => {
      mockGetProfile(mockParentProfile);
      mockGetAccount(mockParentAccount);
      mockGetChildAccounts([mockChildAccount]);
      mockGetUser(mockParentUser);

      cy.visitWithLogin('/account/billing');

      // Confirm that "Switch Account" button is present, then click it.
      ui.button
        .findByTitle('Switch Account')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Prepare up mocks in advance of the account switch. As soon as the child account is clicked,
      // Cloud will replace its stored token with the token provided by the API and then reload.
      // From that point forward, we will not have a valid test account token stored in local storage,
      // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
      // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
      // individual requests as needed.
      mockAllApiRequests();
      mockGetLinodes([]);
      mockGetRegions([]);
      mockGetEvents([]);
      mockGetNotifications([]);
      mockGetAccount(mockChildAccount);
      mockGetProfile(mockChildAccountProfile);
      mockGetUser(mockChildAccountProxyUser);
      mockGetPaymentMethods(paymentMethodFactory.buildList(1));
      mockGetInvoices([]);
      mockGetPayments([]);

      // Mock the account switch itself -- we have to do this after the mocks above
      // to ensure that it is applied.
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
      // Satisfy TypeScript using non-null assertions since we know what the mock data contains.
      assertAuthLocalStorage(
        mockChildAccountToken.token!,
        mockChildAccountToken.expiry!,
        mockChildAccountToken.scopes
      );

      // Confirm expected username and company are shown in user menu button.
      assertUserMenuButton(
        mockChildAccountProxyUser.username,
        mockChildAccount.company
      );

      ui.toast.assertMessage(
        `Account switched to ${mockChildAccount.company}.`
      );
    });

    /*
     * - Confirms that Parent account user can switch to Child account using the user menu.
     * - Confirms that Parent account information is initially displayed in user menu button.
     * - Confirms that Child account information is displayed in user menu button after switch.
     * - Confirms that Cloud updates local storage auth values upon account switch.
     */
    it('can switch from Parent account to Child account using user menu', () => {
      mockGetProfile(mockParentProfile);
      mockGetAccount(mockParentAccount);
      mockGetChildAccounts([mockChildAccount]);
      mockGetUser(mockParentUser);

      cy.visitWithLogin('/');

      // Confirm that Parent account username and company name are shown in user
      // menu button, then click the button.
      assertUserMenuButton(
        mockParentProfile.username,
        mockParentAccount.company
      ).click();

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

      // Prepare up mocks in advance of the account switch. As soon as the child account is clicked,
      // Cloud will replace its stored token with the token provided by the API and then reload.
      // From that point forward, we will not have a valid test account token stored in local storage,
      // so all non-intercepted API requests will respond with a 401 status code and we will get booted to login.
      // We'll mitigate this by broadly mocking ALL API-v4 requests, then applying more specific mocks to the
      // individual requests as needed.
      mockAllApiRequests();
      mockGetLinodes([]);
      mockGetRegions([]);
      mockGetEvents([]);
      mockGetNotifications([]);
      mockGetAccount(mockChildAccount);
      mockGetProfile(mockParentProfile);
      mockGetUser(mockParentUser);

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
      // Satisfy TypeScript using non-null assertions since we know what the mock data contains.
      assertAuthLocalStorage(
        mockChildAccountToken.token!,
        mockChildAccountToken.expiry!,
        mockChildAccountToken.scopes
      );

      // Confirm expected username and company are shown in user menu button.
      assertUserMenuButton(
        mockParentProfile.username,
        mockChildAccount.company
      );
    });
  });

  /*
   * Tests to confirm that Cloud handles account switching errors gracefully.
   */
  describe('Error flows', () => {
    /*
     * - Confirms error handling upon failure to fetch child accounts.
     * - Confirms "Try Again" button can be used to re-fetch child accounts successfully.
     * - Confirms error handling upon failure to create child account token.
     */
    it('handles account switching API errors', () => {
      mockGetProfile(mockParentProfile);
      mockGetAccount(mockParentAccount);
      mockGetChildAccountsError('An unknown error has occurred', 500);
      mockGetUser(mockParentUser);

      cy.visitWithLogin('/account/billing');
      ui.button
        .findByTitle('Switch Account')
        .should('be.visible')
        .should('be.enabled')
        .click();

      ui.drawer
        .findByTitle('Switch Account')
        .should('be.visible')
        .within(() => {
          // Confirm error message upon failure to fetch child accounts.
          cy.findByText('Unable to load data.').should('be.visible');
          cy.findByText(
            'Try again or contact support if the issue persists.'
          ).should('be.visible');

          // Click "Try Again" button and mock a successful response.
          mockGetChildAccounts([mockChildAccount]);
          ui.button
            .findByTitle('Try again')
            .should('be.visible')
            .should('be.enabled')
            .click();

          // Click child company and mock an error.
          // Confirm that Cloud Manager displays the error message in the drawer.
          mockCreateChildAccountTokenError(mockChildAccount, mockErrorMessage);
          cy.findByText(mockChildAccount.company).click();
          cy.findByText(mockErrorMessage).should('be.visible');
        });
    });
  });
});
