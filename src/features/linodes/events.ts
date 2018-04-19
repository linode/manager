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
  ];

  const statusWhitelist = [
    'started',
    'finished',
    'scheduled',
    'failed',
    'notification',
  ];

  const isLinodeEvent = linodeEvent.entity !== null && linodeEvent.entity.type === 'linode';
  const createdAfterMountTime = moment(linodeEvent.created + 'Z') > mountTime;
  const isPendingCompletion = linodeEvent.percent_complete !== null
    && linodeEvent.percent_complete < 100;

  const result = isLinodeEvent
    && statusWhitelist.includes(linodeEvent.status)
    && actionWhitelist.includes(linodeEvent.action)
    && (createdAfterMountTime || isPendingCompletion);

  return result;
};
