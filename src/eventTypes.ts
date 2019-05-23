export const baseRedirect = () => {
  return '/';
};

export const getLinodesRedirectUrl = () => {
  return '/linodes';
};

export const getLinodeRedirectUrl = (entity: Linode.Entity) => {
  return `${getLinodesRedirectUrl()}/${entity.label}`;
};

export const getLinodeNetworkingRedirectUrl = (entity: Linode.Entity) => {
  return `${getLinodeRedirectUrl(entity)}/networking`;
};

export const getLinodeAdvancedRedirectUrl = (entity: Linode.Entity) => {
  return `${getLinodeRedirectUrl(entity)}/settings/advanced`;
};

export const getLinodeBackupRedirectUrl = (entity: Linode.Entity) => {
  return `${getLinodeRedirectUrl(entity)}/backups`;
};

export const getDomainsRedirectUrl = () => {
  return '/domains';
};

export const getDomainRedirectUrl = (entity: Linode.Entity) => {
  return `${getDomainsRedirectUrl()}/${entity.label}`;
};

export const getNodeBalancersRedirectUrl = () => {
  return '/nodebalancers';
};

export const getNodebalancerRedirectUrl = (entity: Linode.Entity) => {
  return `${getNodeBalancersRedirectUrl()}/${entity.label}`;
};

export const getTicketsRedirectUrl = () => {
  return '/support';
};

export const getTicketRedirectUrl = (entity: Linode.Entity) => {
  return `${getTicketsRedirectUrl()}/${entity.id}`;
};

export const getStackScriptsRedirectUrl = () => {
  return '/stackscripts';
};

export const getStackScriptRedirectUrl = (entity: Linode.Entity) => {
  return `${getStackScriptsRedirectUrl()}/${entity.id}`;
};

export const getVolumesRedirectUrl = () => {
  return '/volumes';
};

export const getVolumeRedirectUrl = () => {
  return getVolumesRedirectUrl();
};

export const getImagesRedirectUrl = () => {
  return '/images';
};

export const getImageRedirectUrl = () => {
  return getImagesRedirectUrl();
};

export const getAccountRedirectUrl = () => {
  return '/account';
};

const EventTypeMap = {
  linode_boot: {
    presentTenseAction: 'Booting',
    pastTenseAction: 'Booted',
    linodeStatus: 'running',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_create: {
    presentTenseAction: 'Provisioning',
    pastTenseAction: 'Provisioned',
    linodeStatus: 'offline', // Technically this is "finished", but offline is more useful to us.
    redirectUrl: getLinodeRedirectUrl
  },
  linode_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'Deleted',
    redirectUrl: getLinodesRedirectUrl
  },
  linode_shutdown: {
    presentTenseAction: 'Shutting down',
    pastTenseAction: 'Shut down',
    linodeStatus: 'offline',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_reboot: {
    presentTenseAction: 'Rebooting',
    pastTenseAction: 'Rebooted',
    linodeStatus: 'running',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_addip: {
    presentTenseAction: 'Adding an IP to',
    pastTenseAction: '',
    pastTensePrefix: 'IP added to',
    redirectUrl: getLinodeNetworkingRedirectUrl
  },
  linode_deleteip: {
    presentTenseAction: 'Deleting an IP from',
    pastTenseAction: '',
    pastTensePrefix: 'IP deleted from',
    redirectUrl: getLinodeNetworkingRedirectUrl
  },
  linode_migrate: {
    presentTenseAction: 'Migrating',
    pastTenseAction: 'Migrated',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_rebuild: {
    presentTenseAction: 'Rebuilding',
    pastTenseAction: 'Rebuilt',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_resize: {
    presentTenseAction: 'Resizing',
    pastTenseAction: 'Resized',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_mutate: {
    presentTenseAction: 'Upgrading',
    pastTenseAction: 'Upgraded',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_clone: {
    presentTenseAction: 'Cloning',
    pastTenseAction: 'Cloned',
    redirectUrl: getLinodeRedirectUrl
  },
  linode_kvmify: {
    presentTenseAction: 'KVMifying',
    pastTenseAction: 'KVM-ified',
    redirectUrl: getLinodeRedirectUrl
  },

  disk_create: {
    presentTenseAction: 'Creating disk on',
    pastTenseAction: 'Created disk on',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl
  },
  disk_delete: {
    presentTenseAction: 'Deleting disk on',
    pastTenseAction: 'Deleted disk on',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl
  },
  disk_duplicate: {
    presentTenseAction: 'Duplicating disk on',
    pastTenseAction: 'Duplicated disk on',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl
  },
  disk_resize: {
    presentTenseAction: 'Resizing disk on',
    pastTenseAction: 'Resized disk on',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl
  },
  disk_imagize: {
    presentTenseAction: 'Creating an image from ',
    pastTenseAction: 'Image creation scheduled for',
    pastTensePrefix: 'Disk on',
    redirectUrl: getImagesRedirectUrl
  },
  linode_snapshot: {
    presentTenseAction: 'Taking a snapshot of',
    pastTenseAction: 'Snapshot taken of',
    pastTensePrefix: 'Snapshot of',
    redirectUrl: getLinodeBackupRedirectUrl
  },
  backups_enable: {
    presentTenseAction: 'Enabling backups service',
    pastTenseAction: 'Enabled backup for',
    redirectUrl: getLinodeBackupRedirectUrl
  },
  backups_cancel: {
    presentTenseAction: 'Cancelling backups service',
    pastTenseAction: 'Cancelled backup services for',
    redirectUrl: getLinodeBackupRedirectUrl
  },
  backups_restore: {
    presentTenseAction: 'Restoring from backup',
    pastTenseAction: '',
    pastTensePrefix: 'Backup restored to',
    redirectUrl: getLinodeRedirectUrl
  },

  password_reset: {
    presentTenseAction: 'Resetting password for',
    pastTenseAction: 'Reset password for',
    pastTensePrefix: 'Password for',
    redirectUrl: getLinodeRedirectUrl
  },

  domain_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getDomainRedirectUrl
  },
  domain_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'Deleted',
    redirectUrl: getDomainsRedirectUrl
  },

  domain_record_create: {
    presentTenseAction: 'Creating record on',
    pastTenseAction: 'Created record on',
    pastTensePrefix: 'Record on',
    redirectUrl: getDomainRedirectUrl
  },
  domain_record_delete: {
    presentTenseAction: 'Deleting record on',
    pastTenseAction: 'Deleted record on',
    pastTensePrefix: 'Record on',
    redirectUrl: getDomainsRedirectUrl
  },
  nodebalancer_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getNodeBalancersRedirectUrl
  },
  nodebalancer_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'Deleted',
    redirectUrl: getNodeBalancersRedirectUrl
  },
  nodebalancer_config_create: {
    presentTenseAction: 'Creating config on',
    pastTenseAction: 'Created config on',
    pastTensePrefix: 'Config on',
    redirectUrl: getNodebalancerRedirectUrl
  },
  nodebalancer_config_delete: {
    presentTenseAction: 'Deleting config on',
    pastTenseAction: 'Deleted config on',
    pastTensePrefix: 'Config on',
    redirectUrl: getNodebalancerRedirectUrl
  },

  stackscript_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getStackScriptRedirectUrl
  },
  stackscript_publicize: {
    presentTenseAction: 'Publicizing',
    pastTenseAction: 'Publicized',
    redirectUrl: getStackScriptRedirectUrl
  },
  stackscript_revise: {
    presentTenseAction: 'Revising',
    pastTenseAction: 'Revised',
    redirectUrl: getStackScriptRedirectUrl
  },
  stackscript_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'Deleted',
    redirectUrl: getStackScriptsRedirectUrl
  },

  ticket_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getTicketRedirectUrl
  },
  ticket_update: {
    presentTenseAction: 'Replying',
    pastTenseAction: 'Replied to',
    pastTensePrefix: 'Replied to',
    redirectUrl: getTicketRedirectUrl
  },
  ticket_attachment_upload: {
    presentTenseAction: 'Attachment uploading',
    pastTenseAction: 'Attached an upload to',
    pastTensePrefix: 'Attached an upload to',
    redirectUrl: getTicketRedirectUrl
  },

  volume_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getVolumeRedirectUrl
  },
  volume_attach: {
    presentTenseAction: 'Attaching',
    pastTenseAction: 'Attached',
    redirectUrl: getLinodeAdvancedRedirectUrl
  },
  volume_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'Deleted',
    redirectUrl: getVolumesRedirectUrl
  },
  volume_detach: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getVolumeRedirectUrl
  },
  volume_resize: {
    presentTenseAction: 'Resizing',
    pastTenseAction: 'Resized',
    redirectUrl: getVolumeRedirectUrl
  },
  volume_clone: {
    presentTenseAction: 'Cloning',
    pastTenseAction: 'Cloned',
    redirectUrl: getVolumesRedirectUrl
  },

  image_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'Created',
    redirectUrl: getImageRedirectUrl
  },
  image_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'Deleted',
    redirectUrl: getImagesRedirectUrl
  },
  credit_card_updated: {
    pastTenseAction: 'Updated credit card',
    pastTensePrefix: 'Credit card updated by',
    redirectUrl: getAccountRedirectUrl
  },
  payment_submitted: {
    pastTenseAction: 'Submitted a payment',
    pastTensePrefix: 'Payment submitted by',
    redirectUrl: getAccountRedirectUrl
  }
};

export default EventTypeMap;
