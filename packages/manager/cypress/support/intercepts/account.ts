/**
 * @file Cypress intercepts and mocks for Cloud Manager account requests.
 */

import type {
  Account,
  AccountSettings,
  EntityTransfer,
  PaymentMethod,
  Invoice,
} from '@linode/api-v4/types';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { getFilters } from 'support/util/request';

/**
 * Intercepts GET request to fetch account and mocks response.
 *
 * @param account - Account data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccount = (account: Account): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('account'), account);
};

/**
 * Intercepts PUT request to update account and mocks response.
 *
 * @param updatedAccount - Updated account data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateAccount = (
  updatedAccount: Account
): Cypress.Chainable<null> => {
  return cy.intercept('PUT', apiMatcher('account'), updatedAccount);
};

/**
 * Intercepts GET request to fetch account user information.
 *
 * @param username - Username of user whose info is being fetched.
 *
 * @returns Cypress chainable.
 */
export const interceptGetUser = (username: string): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`account/users/${username}`));
};

/**
 * Intercepts POST request to generate entity transfer token.
 *
 * @returns Cypress chainable.
 */
export const interceptInitiateEntityTransfer = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('account/entity-transfers'));
};

/**
 * Intercepts GET request to fetch entity transfers and mocks the response.
 *
 * This intercept will catch any request to the GET entity transfer endpoint,
 * but will respond according to the contents of the `x-filter` header.
 *
 * If the filter indicates a request for pending transfers, the response will
 * contain the contents of the `pending` array. Likewise, if the filter
 * indicates a request for either received or sent transfers, the response
 * will reflect the given `received` or `sent` array, respectively. If the
 * request contains an unexpected filter or no filter, the response will not
 * be mocked at all.
 *
 * @param pending - Mocked entity transfers with which to respond for pending entity requests.
 * @param received - Mocked entity transfers with which to respond for received entity requests.
 * @param sent - Mocked entity transfers with which to respond for sent entity requests.
 */
export const mockGetEntityTransfers = (
  pending: EntityTransfer[],
  received: EntityTransfer[],
  sent: EntityTransfer[]
) => {
  return cy.intercept('GET', apiMatcher('account/entity-transfers*'), (req) => {
    const filters = getFilters(req);

    if (filters?.['status'] === 'pending') {
      req.reply(paginateResponse(pending));
      return;
    }

    if (filters?.['+and'] && Array.isArray(filters['+and'])) {
      const compositeFilters: Record<string, unknown>[] = filters['+and'];

      // Confirm that `is_sender` is set, and, if so, that it has the expected value.
      const hasTrueSenderValue = compositeFilters.some(
        (compositeFilter) => compositeFilter['is_sender'] === true
      );
      const hasFalseSenderValue = compositeFilters.some(
        (compositeFilter) => compositeFilter['is_sender'] === false
      );

      if (hasTrueSenderValue) {
        req.reply(paginateResponse(sent));
        return;
      }

      if (hasFalseSenderValue) {
        req.reply(paginateResponse(received));
        return;
      }
    }

    req.continue();
  });
};

/**
 * Intercepts GET request to receive entity transfer and mocks response.
 *
 * @param token - Token for entity transfer request to mock.
 * @param transfer - Entity transfer data with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockReceiveEntityTransfer = (
  token: string,
  transfer: EntityTransfer
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`account/entity-transfers/${token}`),
    transfer
  );
};

/**
 * Intercepts POST request to accept entity transfer and mocks response.
 *
 * @param token - Token for entity transfer request to mock.
 *
 * @returns Cypress chainable.
 */
export const mockAcceptEntityTransfer = (
  token: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`account/entity-transfers/${token}/accept`),
    {}
  );
};

/**
 * Intercepts GET request to fetch account settings and mocks response.
 *
 * @param settings - Account settings mock data with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccountSettings = (
  settings: AccountSettings
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('account/settings'), settings);
};

/**
 * Intercepts PUT request to update account username and mocks response.
 *
 * @param oldUsername - The original username which will be changed.
 * @param newUsername - The new username for the account.
 * @param restricted - Whether or not the account is restricted.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateUsername = (
  oldUsername: string,
  newUsername: string,
  restricted: boolean = false
) => {
  return cy.intercept('PUT', apiMatcher(`account/users/${oldUsername}`), {
    username: newUsername,
    email: 'mockEmail@example.com',
    restricted,
    ssh_keys: [],
    tfa_enabled: false,
    verified_phone_number: null,
  });
};

/**
 * Intercepts GET request to retrieve account payment methods and mocks response.
 *
 * @param paymentMethods - Array of payment methods with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetPaymentMethods = (
  paymentMethods: PaymentMethod[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('account/payment-methods*'),
    paginateResponse(paymentMethods)
  );
};

/**
 * Intercepts POST request to set default account payment method and mocks response.
 *
 * @param paymentMethodId - ID of payment method for which to intercept request.
 *
 * @returns Cypress chainable.
 */
export const mockSetDefaultPaymentMethod = (
  paymentMethodId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`account/payment-methods/${paymentMethodId}/make-default`),
    {}
  );
};

/**
 * Intercepts GET request to fetch account invoices and mocks response.
 *
 * @param invoices - Invoice data with which to respond.
 *
 * @returns Cypress chainable.
 */
export const mockGetInvoices = (
  invoices: Invoice[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('account/invoices*'),
    paginateResponse(invoices)
  );
};
