import { Event } from 'linode-js-sdk/lib/account';
import * as moment from 'moment';

let newLinodeEvents: (time: moment.Moment) => (event: Event) => boolean;

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

newLinodeEvents = (time?: moment.Moment) => (e: Event): boolean => {
  return (
    e.entity !== null &&
    e.entity.type === 'linode' &&
    statusWhitelist.includes(e.status) &&
    actionWhitelist.includes(e.action) &&
    !e._initial
  );
};

export { newLinodeEvents };
