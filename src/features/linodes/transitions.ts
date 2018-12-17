export const transitionStatus = [
  'booting',
  'shutting_down',
  'rebooting',
  'provisioning',
  'deleting',
  'migrating',
  'resizing',
  'rebuilding',
  'restoring'
];

export const transitionAction = [
  'linode_snapshot',
  'disk_resize',
  'backups_restore'
];

export const linodeInTransition = (status: string, recentEvent?: Linode.Event): boolean => {
  return (
    transitionStatus.includes(status)
    || (
      (recentEvent || false)
      && (transitionAction.includes(recentEvent.action || ''))
      && recentEvent.percent_complete !== null
      && recentEvent.percent_complete < 100
    )
  );
}

export const transitionText = (status: string, recentEvent?: Linode.Event): string => {
  let event;
  if (recentEvent && transitionAction.includes(recentEvent.action)) {
    event = recentEvent.action.replace('linode_', '').replace('_', ' ');
  } else {
    event = status.replace('_', ' ');
  }
  return event.charAt(0).toUpperCase() + event.slice(1);
}
