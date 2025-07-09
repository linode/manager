import type { EventAction, LinodeStatus } from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

export const LINODE_STATUS_TO_STATUS_ICON_MAP: Record<LinodeStatus, Status> = {
  booting: 'other',
  cloning: 'other',
  deleting: 'other',
  migrating: 'other',
  offline: 'inactive',
  provisioning: 'other',
  rebooting: 'other',
  rebuilding: 'other',
  restoring: 'other',
  running: 'active',
  shutting_down: 'other',
  stopped: 'error',
  resizing: 'other',
};

export const LINODE_EVENT_TO_STATUS_MAP: Partial<
  Record<EventAction, LinodeStatus>
> = {
  backups_restore: 'restoring',
  linode_boot: 'booting',
  linode_clone: 'cloning',
  linode_create: 'provisioning',
  linode_delete: 'deleting',
  linode_migrate_datacenter: 'migrating',
  linode_migrate: 'migrating',
  linode_mutate: 'migrating',
  linode_poweroff_on: 'rebooting',
  linode_reboot: 'rebooting',
  linode_rebuild: 'rebuilding',
  linode_resize: 'resizing',
  linode_shutdown: 'shutting_down',
};
