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
