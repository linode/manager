import { capitalizeAllWords } from 'src/utilities/capitalize';

export const transitionStatus = [
  'booting',
  'shutting_down',
  'rebooting',
  'provisioning',
  'deleting',
  'migrating',
  'resizing',
  'rebuilding',
  'restoring',
  'cloning',
  'edit_mode'
];

export const transitionAction = [
  'linode_snapshot',
  'disk_resize',
  'backups_restore',
  'disk_imagize'
];

export const linodeInTransition = (
  status: string,
  recentEvent?: Linode.Event
): boolean => {
  return (
    transitionStatus.includes(status) ||
    ((recentEvent || false) &&
      transitionAction.includes(recentEvent.action || '') &&
      recentEvent.percent_complete !== null &&
      recentEvent.percent_complete < 100)
  );
};

export const transitionText = (
  status: string,
  recentEvent?: Linode.Event
): string => {
  let event;
  if (recentEvent && transitionAction.includes(recentEvent.action)) {
    event = recentEvent.action.replace('linode_', '').replace('_', ' ');
  } else {
    event = status.replace('_', ' ');
  }
  return capitalizeAllWords(event);
};
