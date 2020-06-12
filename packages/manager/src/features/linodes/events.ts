import { Event } from '@linode/api-v4/lib/account';

const actionWhitelist = [
  'linode_boot',
  'linode_reboot',
  'linode_shutdown',
  'backups_enable',
  'backups_cancel',
  'backups_restore',
  'linode_snapshot',
  'linode_rebuild',
  'linode_resize',
  'disk_resize',
  'linode_migrate'
];

const statusWhitelist = [
  'started',
  'finished',
  'scheduled',
  'failed',
  'notification'
];

const newLinodeEvents = (_time?: any) => (e: Event): boolean => {
  return (
    e.entity !== null &&
    e.entity.type === 'linode' &&
    statusWhitelist.includes(e.status) &&
    actionWhitelist.includes(e.action) &&
    !e._initial
  );
};

export { newLinodeEvents };
