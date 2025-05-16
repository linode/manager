export const PENDING_MAINTENANCE_FILTER = Object.freeze({
  status: { '+or': ['pending', 'started'] },
});

export const PLATFORM_MAINTENANCE_TYPE =
  'security_reboot_maintenance_scheduled';
