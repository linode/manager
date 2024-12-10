export const PENDING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started'] },
});
