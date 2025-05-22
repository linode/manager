export const COMPLETED_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['completed', 'canceled'] },
});

export const IN_PROGRESS_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['in-progress', 'started'] },
});

export const SCHEDULED_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'scheduled'] },
});
