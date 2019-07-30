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
  'disk_imagize',
  'disk_duplicate',
  'linode_mutate',
  'linode_clone',
  'linode_migrate_datacenter'
];

export const linodeInTransition = (
  status: string,
  recentEvent?: Linode.Event
): boolean => {
  if (!recentEvent) {
    return false;
  }

  return (
    transitionStatus.includes(status) ||
    (transitionAction.includes(recentEvent.action || '') &&
      recentEvent.percent_complete !== null &&
      recentEvent.percent_complete < 100)
  );
};

export const transitionText = (
  status: string,
  recentEvent?: Linode.Event
): string => {
  // `linode_mutate` is a special case, because we want to display
  // "Upgrading" instead of "Mutate".

  // @todo @tdt: use a map instead (event_type to display name)
  if (recentEvent && recentEvent.action === 'linode_mutate') {
    return 'Upgrading';
  }

  if (recentEvent && recentEvent.action === 'linode_clone') {
    return 'Cloning';
  }

  if (recentEvent && recentEvent.action === 'linode_migrate_datacenter') {
    return 'Migrating';
  }

  let event;
  if (recentEvent && transitionAction.includes(recentEvent.action)) {
    event = recentEvent.action.replace('linode_', '').replace('_', ' ');
  } else {
    event = status.replace('_', ' ');
  }
  return capitalizeAllWords(event);
};
