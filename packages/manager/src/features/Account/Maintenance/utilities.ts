import type { MaintenanceTableType } from './MaintenanceTable';

export const COMPLETED_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['completed', 'canceled'] },
});

export const IN_PROGRESS_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['in_progress', 'started'] },
});

export const UPCOMING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'scheduled'] },
});

export const PENDING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started', 'scheduled'] },
});

export const PENDING_AND_IN_PROGRESS_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started', 'scheduled', 'in_progress'] },
});

export const PLATFORM_MAINTENANCE_TYPE =
  'security_reboot_maintenance_scheduled';

export const PLATFORM_MAINTENANCE_REASON_MATCH = [
  'critical platform update',
  'critical security update',
];

export const maintenanceDateColumnMap: Record<
  MaintenanceTableType,
  ['complete_time' | 'start_time' | 'when', string]
> = {
  completed: ['complete_time', 'End Date'],
  'in progress': ['start_time', 'Start Date'],
  upcoming: ['start_time', 'Start Date'],
  pending: ['when', 'Date'],
};

// Helper functions for better readability
export const getMaintenanceDateField = (
  type: MaintenanceTableType
): 'complete_time' | 'start_time' | 'when' => {
  return maintenanceDateColumnMap[type][0];
};

export const getMaintenanceDateLabel = (type: MaintenanceTableType): string => {
  return maintenanceDateColumnMap[type][1];
};
