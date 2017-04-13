export function baseRedirect() {
  return '/';
}

export function getLinodesRedirectUrl() {
  return '/linodes';
}

export function getLinodeRedirectUrl(entity) {
  return `${getLinodesRedirectUrl()}/${entity.label}`;
}

export function getLinodeDiskRedirectUrl(entity) {
  return `${getLinodeRedirectUrl(entity)}/settings/advanced`;
}

export function getLinodeBackupRedirectUrl(entity) {
  return `${getLinodeRedirectUrl(entity)}/backups`;
}

export function getDNSZonesRedirectUrl() {
  return '/domains';
}

export function getDNSZoneRedirectUrl(entity) {
  return `${getDNSZonesRedirectUrl()}/${entity.label}`;
}

export function getNodebalancersRedirectUrl() {
  return '/nodebalancers';
}

export function getNodebalancerRedirectUrl(entity) {
  return `${getNodebalancersRedirectUrl()}/${entity.label}`;
}

const EventTypeMap = {
  linode_boot: {
    presentTenseAction: 'Booting',
    pastTenseAction: 'booted',
    linodeStatus: 'running',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_create: {
    presentTenseAction: 'Provisioning',
    pastTenseAction: 'provisioned',
    linodeStatus: 'offline', // Technically this is "finished", but offline is more useful to us.
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getLinodesRedirectUrl,
  },
  linode_shutdown: {
    presentTenseAction: 'Shutting down',
    pastTenseAction: 'shut down',
    linodeStatus: 'offline',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_reboot: {
    presentTenseAction: 'Rebooting',
    pastTenseAction: 'rebooted',
    linodeStatus: 'running',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_snapshot: {
    presentTenseAction: 'Taking a snapshot of',
    pastTenseAction: 'taken',
    pastTensePrefix: 'Snapshot of',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_addip: {
    presentTenseAction: 'Adding an IP to',
    pastTenseAction: '',
    pastTensePrefix: 'IP added to',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_migrate: {
    presentTenseAction: 'Migrating',
    pastTenseAction: 'migrated',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_rebuild: {
    presentTenseAction: 'Rebuilding',
    pastTenseAction: 'rebuilt',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_resize: {
    presentTenseAction: 'Resizing',
    pastTenseAction: 'resized',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_clone: {
    presentTenseAction: 'Cloning',
    pastTenseAction: 'cloned',
    redirectUrl: getLinodeRedirectUrl,
  },

  disk_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getLinodeDiskRedirectUrl,
  },
  disk_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getLinodeDiskRedirectUrl,
  },
  disk_duplicate: {
    presentTenseAction: 'Duplicating',
    pastTenseAction: 'duplicated',
    redirectUrl: getLinodeDiskRedirectUrl,
  },
  disk_resize: {
    presentTenseAction: 'Resizing',
    pastTenseAction: 'resized',
    redirectUrl: getLinodeDiskRedirectUrl,
  },

  backups_enable: {
    presentTenseAction: 'Enabling',
    pastTenseAction: 'enabled',
    redirectUrl: getLinodeBackupRedirectUrl,
  },
  backups_cancel: {
    presentTenseAction: 'Cancelling',
    pastTenseAction: 'cancelled',
    redirectUrl: getLinodeBackupRedirectUrl,
  },
  backups_restore: {
    presentTenseAction: 'Restoring',
    pastTenseAction: 'restored',
    redirectUrl: getLinodeBackupRedirectUrl,
  },

  password_reset: {
    presentTenseAction: 'Resetting password for',
    pastTenseAction: 'reset',
    pastTensePrefix: 'Password for',
    redirectUrl: getLinodeRedirectUrl,
  },

  dns_zone_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getDNSZoneRedirectUrl,
  },
  dns_zone_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getDNSZonesRedirectUrl,
  },

  dns_record_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getDNSZoneRedirectUrl,
  },
  dns_record_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getDNSZonesRedirectUrl,
  },

  stackscript_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: baseRedirect,
  },
  stackscript_publicize: {
    presentTenseAction: 'Publicizing',
    pastTenseAction: 'publicized',
    redirectUrl: baseRedirect,
  },
  stackscript_revise: {
    presentTenseAction: 'Revising',
    pastTenseAction: 'revised',
    redirectUrl: baseRedirect,
  },
  stackscript_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: baseRedirect,
  },
};

export default EventTypeMap;
