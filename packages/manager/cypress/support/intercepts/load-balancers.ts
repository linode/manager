import { paginateResponse } from 'support/util/paginate';
import { apiMatcher } from 'support/util/intercepts';
import type { ServiceTargetPayload } from '@linode/api-v4';

export const mockGetServiceTargets = (
  serviceTargets: ServiceTargetPayload[]
) => {
  return cy.intercept(
    'GET',
    apiMatcher('/aglb/service-targets*'),
    paginateResponse(serviceTargets)
  );
};
