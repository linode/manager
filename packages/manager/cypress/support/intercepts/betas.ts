/**
 * @file Mocks and intercepts related to notification and event handling.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import type { AccountBeta, Beta } from '@linode/api-v4';

/**
 * Intercepts GET request to fetch account betas (the ones the user has opted into) and mocks response.
 *
 * @param betas - Array of Betas with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccountBetas = (
  betas: AccountBeta[]
): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    apiMatcher('account/betas'),
    paginateResponse(betas)
  );
};

/**
 * Intercepts GET request to fetch a beta and mocks response.
 *
 * @param beta - Beta with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccountBeta = (beta: AccountBeta): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    apiMatcher(`account/betas/${beta.id}`),
    makeResponse(beta)
  );
};

/**
 * Intercepts GET request to fetch available betas (all betas available to the user).
 *
 * @param betas - Array of Betas with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetBetas = (betas: Beta[]): Cypress.Chainable => {
  return cy.intercept('GET', apiMatcher(`betas`), paginateResponse(betas));
};

/**
 * Intercepts GET request to fetch a beta and mocks response.
 *
 * @param beta - Beta with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetBeta = (beta: Beta): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    apiMatcher(`betas/${beta.id}`),
    makeResponse(beta)
  );
};

/**
 * Intercepts POST request to enroll in a beta and mocks response.
 *
 * @param beta - Beta with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockPostBeta = (beta: Beta): Cypress.Chainable => {
  return cy.intercept('POST', apiMatcher(`account/betas`), makeResponse(beta));
};
