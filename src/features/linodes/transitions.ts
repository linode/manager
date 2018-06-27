export const transitionStatus = [
  'booting',
  'shutting_down',
  'rebooting',
  'provisioning',
  'deleting',
  'migrating',
  'resizing',
];

export const transitionAction = [
  'linode_snapshot'
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
  if (recentEvent && transitionAction.includes(recentEvent.action)) {
    return recentEvent.action.replace('linode_', '');
  }
  return status.replace('_', ' ');
}