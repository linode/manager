import type { MaintenanceTableType } from './MaintenanceTable';

export const COMPLETED_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['completed', 'canceled'] },
});

export const IN_PROGRESS_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['in-progress', 'started'] },
});

export const SCHEDULED_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'scheduled'] },
});

export const PENDING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started'] },
});

export const maintenanceDateColumnMap: Record<
  MaintenanceTableType,
  ['complete_time' | 'start_time' | 'when', string]
> = {
  completed: ['complete_time', 'End Date'],
  'in progress': ['start_time', 'Start Date'],
  scheduled: ['start_time', 'Start Date'],
  pending: ['when', 'Date'],
};
