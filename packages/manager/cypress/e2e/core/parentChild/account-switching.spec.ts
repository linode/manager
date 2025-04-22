import { grantsFactory, profileFactory } from '@linode/utilities';
import {
  accountFactory,
  appTokenFactory,
  paymentMethodFactory,
} from '@src/factories';
import { accountUserFactory } from '@src/factories/accountUsers';
import { DateTime } from 'luxon';
import {
  interceptGetInvoices,
  interceptGetPaymentMethods,
  interceptGetPayments,
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
import { mockAllApiRequests } from 'support/intercepts/general';
import { mockGetLinodes } from 'support/intercepts/linodes';
import {
  mockGetProfile,
  mockGetProfileGrants,
} from 'support/intercepts/profile';
import { mockGetRegions } from 'support/intercepts/regions';
import { ui } from 'support/ui';
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
  user_type: 'parent',
  username: randomLabel(),
});

const mockParentUser = accountUserFactory.build({
  user_type: 'parent',
  username: mockParentProfile.username,
});

const mockChildAccount = accountFactory.build({
  company: 'Partner Company',
});

// Used for testing flows involving multiple children (e.g. switching child -> child).
const mockAlternateChildAccount = accountFactory.build({
  company: 'Other Partner Company',
});

const mockChildAccountProxyUser = accountUserFactory.build({
  user_type: 'proxy',
  username: mockParentProfile.username,
});

// Used for testing flows involving multiple children (e.g. switching child -> child).
const mockAlternateChildAccountProxyUser = accountUserFactory.build({
  user_type: 'proxy',
  username: mockParentProfile.username,
});

const mockChildAccountProfile = profileFactory.build({
  user_type: 'proxy',
  username: mockChildAccountProxyUser.username,
});

// Used for testing flows involving multiple children (e.g. switching child -> child).
const mockAlternateChildAccountProfile = profileFactory.build({
  user_type: 'proxy',
  username: mockAlternateChildAccountProxyUser.username,
});

const childAccountAccessGrantEnabled = grantsFactory.build({
  global: { account_access: 'read_only', child_account_access: true },
});

const childAccountAccessGrantDisabled = grantsFactory.build({
  global: { account_access: 'read_only', child_account_access: false },
});

const mockChildAccountToken = appTokenFactory.build({
  created: DateTime.now().toISO(),
  expiry: DateTime.now().plus({ minutes: 15 }).toISO(),
  id: randomNumber(),
  label: `${mockChildAccount.company}_proxy`,
  scopes: '*',
  thumbnail_url: undefined,
  token: randomString(32),
  website: undefined,
});

// Used for testing flows involving multiple children (e.g. switching child -> child).
const mockAlternateChildAccountToken = appTokenFactory.build({
  created: DateTime.now().toISO(),
  expiry: DateTime.now().plus({ minutes: 15 }).toISO(),
  id: randomNumber(),
  label: `${mockAlternateChildAccount.company}_proxy`,
  scopes: '*',
  thumbnail_url: undefined,
  token: randomString(32),
  website: undefined,
});

const mockErrorMessage = 'An unknown error has occurred.';

describe('Parent/Child account switching', () => {
  /*
   * Tests to confirm that Parent account users can switch to Child accounts as expected.
   */
  describe('From Parent to Child', () => {
    /*
     * - Confirms that Parent account user can switch to Child account from Account Billing page.
     * - Confirms that Child account information is displayed in user menu button after switch.
     * - Confirms that Cloud updates local storage auth values upon account switch.
     */
    it('can switch from Parent account user to Proxy account user from Billing page', () => {
      mockGetProfile(mockParentProfile);
      mockGetAccount(mockParentAccount);
      mockGetChildAccounts([mockChildAccount]);
      mockGetUser(mockParentUser);
      interceptGetPayments().as('getPayments');
      interceptGetPaymentMethods().as('getPaymentMethods');
      interceptGetInvoices().as('getInvoices');

      cy.visitWithLogin('/account/billing');
      cy.trackPageVisit().as('pageVisit');
      cy.wait(['@getPayments', '@getInvoices', '@getPaymentMethods']);

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
      cy.expectNewPageVisit('@pageVisit');

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
    it('can switch from Parent account user to Proxy account user using user menu', () => {
      mockGetProfile(mockParentProfile);
      mockGetAccount(mockParentAccount);
      mockGetChildAccounts([mockChildAccount]);
      mockGetUser(mockParentUser);

      cy.visitWithLogin('/');
      cy.trackPageVisit().as('pageVisit');

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
      mockGetProfile(mockChildAccountProfile);
      mockGetUser(mockChildAccountProxyUser);

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
      cy.expectNewPageVisit('@pageVisit');

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

    /*
     * - Confirms search functionality in the account switching drawer.
     */
    it('can search child accounts', () => {
      mockGetProfile(mockParentProfile);
      mockGetAccount(mockParentAccount);
      mockGetChildAccounts([mockChildAccount, mockAlternateChildAccount]);
      mockGetUser(mockParentUser);

      cy.visitWithLogin('/');
      cy.trackPageVisit().as('pageVisit');

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

      // Confirm search functionality.
      ui.drawer
        .findByTitle('Switch Account')
        .should('be.visible')
        .within(() => {
          // Confirm all child accounts are displayed when drawer loads.
          cy.findByText(mockChildAccount.company).should('be.visible');
          cy.findByText(mockAlternateChildAccount.company).should('be.visible');

          // Confirm no results message.
          mockGetChildAccounts([]).as('getEmptySearchResults');
          cy.findByPlaceholderText('Search').click();
          cy.focused().type('Fake Name');
          cy.wait('@getEmptySearchResults');

          cy.contains(mockChildAccount.company).should('not.exist');
          cy.findByText(
            'There are no child accounts that match this query.'
          ).should('be.visible');

          // Confirm filtering by company name displays only one search result.
          mockGetChildAccounts([mockChildAccount]).as('getSearchResults');
          cy.findByPlaceholderText('Search').click();
          cy.focused().clear();
          cy.focused().type(mockChildAccount.company);
          cy.wait('@getSearchResults');

          cy.findByText(mockChildAccount.company).should('be.visible');
          cy.contains(mockAlternateChildAccount.company).should('not.exist');
          cy.contains(
            'There are no child accounts that match this query.'
          ).should('not.exist');
        });
    });
  });

  /**
   * Tests to confirm that Parent account users can switch back from Child accounts as expected.
   */
  describe('From Child to Parent', () => {
    /*
     * - Confirms that a Child account Proxy user can switch back to a Parent account from Billing page.
     * - Confirms that Parent account information is displayed in user menu button after switch.
     * - Confirms that Cloud updates local storage auth values upon account switch.
     */
    it('can switch from Proxy user back to Parent account user from Billing page', () => {
      const mockParentToken = randomString(32);
      const mockParentExpiration = DateTime.now().plus({ minutes: 15 }).toISO();

      mockGetAccount(mockChildAccount);
      mockGetProfile(mockChildAccountProfile);
      mockGetChildAccounts([]);
      mockGetUser(mockChildAccountProxyUser);
      interceptGetPayments().as('getPayments');
      interceptGetPaymentMethods().as('getPaymentMethods');
      interceptGetInvoices().as('getInvoices');

      // Visit billing page with `authentication/parent_token/*` local storage
      // data set to mock values.
      cy.visitWithLogin('/account/billing', {
        localStorageOverrides: {
          'authentication/parent_token/expire': mockParentExpiration,
          'authentication/parent_token/scopes': '*',
          'authentication/parent_token/token': `Bearer ${mockParentToken}`,
          proxy_user: true,
        },
      });

      // Track the initial page visit so that we can later assert that Cloud has
      // reloaded upon switching accounts.
      cy.trackPageVisit().as('pageVisit');

      // Wait for page to finish loading before proceeding with account switch.
      cy.wait(['@getPayments', '@getPaymentMethods', '@getInvoices']);

      ui.button
        .findByTitle('Switch Account')
        .should('be.visible')
        .should('be.enabled')
        .click();

      // Prepare mocks in advance of the account switch. As soon as the switch back link is clicked,
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
      mockGetPaymentMethods(paymentMethodFactory.buildList(1)).as(
        'getPaymentMethods'
      );
      mockGetInvoices([]).as('getInvoices');
      mockGetPayments([]).as('getPayments');

      ui.drawer
        .findByTitle('Switch Account')
        .should('be.visible')
        .within(() => {
          cy.findByText('There are no child accounts.').should('be.visible');
          cy.findByText('switch back to your account')
            .should('be.visible')
            .click();
        });

      cy.expectNewPageVisit('@pageVisit');
      cy.wait(['@getInvoices', '@getPayments', '@getPaymentMethods']);

      assertAuthLocalStorage(mockParentToken, mockParentExpiration, '*');

      assertUserMenuButton(
        mockParentProfile.username,
        mockParentAccount.company
      );
    });
  });

  /**
   * Tests to confirm that Proxy users can switch to other Child accounts as expected.
   */
  describe('From Child to Child', () => {
    /*
     * - Confirms that a Child account Proxy user can switch to another Child account from Billing page.
     * - Confirms that alternate Child account information is displayed in user menu button after switch.
     * - Confirms that Cloud updates local storage auth values upon account switch.
     */
    it('can switch to another Child account as a Proxy user', () => {
      const mockParentToken = randomString(32);
      const mockParentExpiration = DateTime.now().plus({ minutes: 15 }).toISO();

      mockGetAccount(mockChildAccount);
      mockGetProfile(mockChildAccountProfile);
      mockGetChildAccounts([mockAlternateChildAccount]);
      mockGetUser(mockChildAccountProxyUser);
      interceptGetPayments().as('getPayments');
      interceptGetPaymentMethods().as('getPaymentMethods');
      interceptGetInvoices().as('getInvoices');

      // Visit billing page with `authentication/parent_token/*` local storage
      // data set to mock values.
      cy.visitWithLogin('/account/billing', {
        localStorageOverrides: {
          'authentication/parent_token/expire': mockParentExpiration,
          'authentication/parent_token/scopes': '*',
          'authentication/parent_token/token': `Bearer ${mockParentToken}`,
          proxy_user: true,
        },
      });

      cy.trackPageVisit().as('pageVisit');

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
      mockGetAccount(mockAlternateChildAccount);
      mockGetProfile(mockAlternateChildAccountProfile);
      mockGetUser(mockAlternateChildAccountProxyUser);
      mockGetPaymentMethods(paymentMethodFactory.buildList(1)).as(
        'getPaymentMethods'
      );
      mockGetInvoices([]).as('getInvoices');
      mockGetPayments([]).as('getPayments');

      // Set up account switch mock.
      mockCreateChildAccountToken(
        mockAlternateChildAccount,
        mockAlternateChildAccountToken
      ).as('switchAccount');

      // Click mock company name in "Switch Account" drawer.
      ui.drawer
        .findByTitle('Switch Account')
        .should('be.visible')
        .within(() => {
          cy.findByText(mockAlternateChildAccount.company)
            .should('be.visible')
            .click();
        });

      // Allow page to load before asserting user menu, ensuring no app crash, etc.
      cy.wait('@switchAccount');
      cy.expectNewPageVisit('@pageVisit');
      cy.wait(['@getInvoices', '@getPayments', '@getPaymentMethods']);

      assertUserMenuButton(
        mockAlternateChildAccountProfile.username,
        mockAlternateChildAccount.company
      );

      assertAuthLocalStorage(
        mockAlternateChildAccountToken.token!,
        mockAlternateChildAccountToken.expiry!,
        mockAlternateChildAccountToken.scopes
      );
      // TODO Confirm whether toast is intended here.
      // ui.toast.assertMessage(
      //   `Account switched to ${mockAlternateChildAccount.company}.`
      // );
    });
  });

  describe('Child Account Access', () => {
    /*
     * - Smoke test to confirm that restricted parent users with the child_account_access grant can switch accounts.
     * - Confirms that the "Switch Account" button is rendered.
     */
    describe('Enabled', () => {
      it('renders "Switch Account" button for restricted users on Billing page', () => {
        mockGetProfile({ ...mockParentProfile, restricted: true });
        mockGetUser(mockParentUser);
        mockGetProfileGrants(childAccountAccessGrantEnabled);

        cy.visitWithLogin('/account/billing');

        cy.findByTestId('switch-account-button').should('be.visible');
      });

      it('renders "Switch Account" button for restricted users in user menu', () => {
        mockGetProfile({ ...mockParentProfile, restricted: true });
        mockGetAccount(mockParentAccount);
        mockGetUser(mockParentUser);
        mockGetProfileGrants(childAccountAccessGrantEnabled);

        cy.visitWithLogin('/');

        assertUserMenuButton(
          mockParentProfile.username,
          mockParentAccount.company
        ).click();

        ui.userMenu
          .find()
          .should('be.visible')
          .within(() => {
            cy.findByTestId('switch-account-button').should('be.visible');
          });
      });
    });
    /*
     * - Smoke test to confirm that restricted parent users without the child_account_access grant cannot switch accounts.
     * - Confirms that the "Switch Account" button is not rendered.
     */
    describe('Disabled', () => {
      it('does not render "Switch Account" button for restricted users on Billing page', () => {
        mockGetProfile({ ...mockParentProfile, restricted: true });
        mockGetUser(mockParentUser);
        mockGetProfileGrants(childAccountAccessGrantDisabled);

        cy.visitWithLogin('/account/billing');

        cy.findByTestId('switch-account-button').should('not.exist');
      });

      it('does not render "Switch Account" button for restricted users in user menu', () => {
        mockGetProfile({ ...mockParentProfile, restricted: true });
        mockGetAccount(mockParentAccount);
        mockGetUser(mockParentUser);
        mockGetProfileGrants(childAccountAccessGrantDisabled);

        cy.visitWithLogin('/');

        assertUserMenuButton(
          mockParentProfile.username,
          mockParentAccount.company
        ).click();

        ui.userMenu
          .find()
          .should('be.visible')
          .within(() => {
            cy.findByTestId('switch-account-button').should('not.exist');
          });
      });
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
