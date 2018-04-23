import * as moment from 'moment';

export const newLinodeEvents = (mountTime: moment.Moment) =>
(linodeEvent : Linode.Event): boolean => {
  const actionWhitelist = [
    'linode_boot',
    'linode_reboot',
    'linode_shutdown',
    'backups_enable',
    'backups_cancel',
    'linode_snapshot',
    'linode_rebuild',
  ];

  const statusWhitelist = [
    'started',
    'finished',
    'scheduled',
    'failed',
    'notification',
  ];

  const isLinodeEvent = linodeEvent.entity !== null && linodeEvent.entity.type === 'linode';

  const result = isLinodeEvent
    && statusWhitelist.includes(linodeEvent.status)
    && actionWhitelist.includes(linodeEvent.action)
    && (!linodeEvent._initial);

  return result;
};
