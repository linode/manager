import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { ActiveLongviewPlan, LongviewClient } from '@linode/api-v4';
import type {
  LongviewAction,
  LongviewResponse,
} from 'src/features/Longview/request.types';

/**
 * Intercepts request to retrieve Longview status for a Longview client.
 *
 * @returns Cypress chainable.
 */
export const interceptFetchLongviewStatus = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', 'https://longview.linode.com/fetch');
};

/**
 * Mocks request to retrieve Longview status for a Longview client.
 *
 * @param client - Longview Client for which to intercept Longview fetch request.
 * @param apiAction - Longview API action to intercept.
 * @param mockStatus -
 *
 * @returns Cypress chainable.
 */
export const mockFetchLongviewStatus = (
  client: LongviewClient,
  apiAction: LongviewAction,
  mockStatus: LongviewResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    {
      url: 'https://longview.linode.com/fetch',
      method: 'POST',
    },
    async (req) => {
      const payload = req.body;
      const response = new Response(payload, {
        headers: {
          'content-type': req.headers['content-type'] as string,
        },
      });
      const formData = await response.formData();

      if (
        formData.get('api_key') === client.api_key &&
        formData.get('api_action') === apiAction
      ) {
        req.reply(makeResponse([mockStatus]));
      }
    }
  );
};

/**
 * Intercepts GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
export const interceptGetLongviewClients = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('longview/clients*'));
};

/**
 * Mocks GET request to fetch Longview clients.
 *
 * @returns Cypress chainable.
 */
export const mockGetLongviewClients = (
  clients: LongviewClient[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('longview/clients*'),
    paginateResponse(clients)
  );
};

/**
 * Mocks request to create a Longview client.
 *
 * @returns Cypress chainable.
 */
export const mockCreateLongviewClient = (
  client: LongviewClient
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('longview/clients*'),
    makeResponse(client)
  );
};

export const mockGetLongviewPlan = (
  plan: ActiveLongviewPlan
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('longview/plan'), makeResponse(plan));
};

export const mockUnauthorizedLongviewPlanRequest =
  (): Cypress.Chainable<null> => {
    return cy.intercept(
      apiMatcher('longview/plan'),
      makeErrorResponse('Unauthorized', 403)
    );
  };

export const mockUpdateLongviewPlan = (
  newPlan: ActiveLongviewPlan
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher('longview/plan'),
    makeResponse(newPlan)
  );
};

export const mockCreateLongviewPlan = (
  plan: ActiveLongviewPlan
): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('longview/plan'), makeResponse(plan));
};

/**
 * Mocks request to delete a Longview Client.
 *
 * @param clientID - ID of Longview Client for which to intercept delete request.
 *
 */
export const mockDeleteLongviewClient = (
  clientID: number
): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`longview/clients/${clientID}`), {});
};

/**
 * Intercepts PUT request to update Longview Client and mocks response.
 *
 * @param clientID - ID of Longview Client for which to intercept update request.
 * @param newClient - new Longview Client object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateLongviewClient = (
  clientID: number,
  newClient: LongviewClient
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`longview/clients/${clientID}`),
    makeResponse(newClient)
  );
};
