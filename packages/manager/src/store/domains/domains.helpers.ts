import { Domain } from 'linode-js-sdk/lib/domains';

/**
 * Helpers
 */
export const entitiesFromPayload = (domains: Domain[]) => {
  /** transform as necessary */
  return domains.map(i => i);
};

export const resultsFromPayload = (domains: Domain[]) => {
  return domains.map(l => l.id);
};
