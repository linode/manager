/**
 * Helpers
 */
export const entitiesFromPayload = (domains: Linode.Domain[]) => {
  /** transform as necessary */
  return domains.map(i => i);
};

export const resultsFromPayload = (domains: Linode.Domain[]) => {
  return domains.map(l => l.id);
};
