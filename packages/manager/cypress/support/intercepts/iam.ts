import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { makeResponse } from 'support/util/response';

import type { PermissionType } from '@linode/api-v4';

export const mockGetUserAccountPermissions = (
  userAccountPermissions: PermissionType[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('iam/users/*/permissions/account'),
    makeResponse(userAccountPermissions)
  );
};

export const mockGetUserAccountPermissionsError = (
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('iam/users/*/permissions/account'),
    makeErrorResponse(errorMessage, statusCode)
  );
};

export const mockGetRolePermissionsError = (
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('iam/role-permissions'),
    makeErrorResponse(errorMessage, statusCode)
  );
};
