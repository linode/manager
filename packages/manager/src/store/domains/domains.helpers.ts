import { Domain } from '@linode/api-v4/lib/domains';

/**
 * Helpers
 */
export const entitiesFromPayload = (domains: Domain[]) => {
  /** transform as necessary */
  return domains.map((i) => i);
};

export const resultsFromPayload = (domains: Domain[]) => {
  return domains.map((l) => l.id);
};
