export const PENDING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started', 'scheduled'] },
});

export const PLATFORM_MAINTENANCE_TYPE =
  'security_reboot_maintenance_scheduled';

export const PLATFORM_MAINTENANCE_REASON_MATCH = [
  'critical platform update',
  'critical security update',
];
