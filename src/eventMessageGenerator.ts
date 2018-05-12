import { path } from 'ramda';

interface EventMessageCreator {
  (e: Linode.Event): string;
}

interface CreatorsForStatus {
  scheduled?: EventMessageCreator;
  started?: EventMessageCreator;
  failed?: EventMessageCreator;
  finished?: EventMessageCreator;
  notification?: EventMessageCreator;
}

/** @see https://leo.stcloudstate.edu/grammar/tenses.html */
export const eventMessageCreators: { [index: string]: CreatorsForStatus } = {
  // backups_cancel: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // backups_enable: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // backups_restore: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // community_question_reply: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // credit_card_updated: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // disk_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // disk_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // disk_duplicate: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // disk_imagize: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // disk_resize: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // dns_record_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // dns_record_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // dns_zone_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // dns_zone_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // domain_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // domain_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // domain_record_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // domain_record_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // image_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  linode_addip: {
    notification: e => `An IP as been added to ${e.entity!.label}.`,
  },
  linode_boot: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled to boot.`,
    started: e => `Linode ${e.entity!.label} is booting.`,
    failed: e => `Linode ${e.entity!.label} could not be booted.`,
    finished: e => `Linode ${e.entity!.label} was booted.`,
  },
  linode_clone: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled to be cloned.`,
    started: e => `Linode ${e.entity!.label} is being cloned.`,
    failed: e => `Linode ${e.entity!.label} could not be cloned.`,
    finished: e => `Linode ${e.entity!.label} was cloned.`,
  },
  linode_create: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for creation.`,
    started: e => `Linode ${e.entity!.label} is being created.`,
    failed: e => `Linode ${e.entity!.label} could not be created.`,
    finished: e => `Linode ${e.entity!.label} was created.`,
  },
  linode_delete: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for deletion.`,
    started: e => `Linode ${e.entity!.label} is being deleted.`,
    failed: e => `Linode ${e.entity!.label} could not be deleted.`,
    finished: e => `Linode ${e.entity!.label} was deleted.`,
  },
  linode_deleteip: {
    notification: e => `An IP was deleted from Linode ${e.entity!.id}`,
  },
  linode_migrate: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for migration.`,
    started: e => `Linode ${e.entity!.label} is being migrated.`,
    failed: e => `Linode ${e.entity!.label} could not be migrated.`,
    finished: e => `Linode ${e.entity!.label} was migrated.`,
  },
  // linode_mutate: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  linode_reboot: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for a reboot.`,
    started: e => `Linode ${e.entity!.label} is rebooting.`,
    failed: e => `Linode ${e.entity!.label} could not be rebooted.`,
    finished: e => `Linode ${e.entity!.label} was rebooted.`,
  },
  linode_rebuild: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for rebuild.`,
    started: e => `Linode ${e.entity!.label} is being rebuilt.`,
    failed: e => `Linode ${e.entity!.label} could not be rebuilt.`,
    finished: e => `Linode ${e.entity!.label} was rebuilt.`,
  },
  linode_resize: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for resize.`,
    started: e => `Linode ${e.entity!.label} is resizing.`,
    failed: e => `Linode ${e.entity!.label} could not be rebuilt`,
    finished: e => `Linode ${e.entity!.label} was resized.`,
  },
  linode_shutdown: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for shut down.`,
    started: e => `Linode ${e.entity!.label} is shutting down.`,
    failed: e => `Linode ${e.entity!.label} could not be shut down.`,
    finished: e => `Linode ${e.entity!.label} was shut down.`,
  },
  linode_snapshot: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for a snapshot backup.`,
    started: e => `A snapshot backup is being created for Linode ${e.entity!.label}.`,
    failed: e => `A snapshot back up could not be created for Linode ${e.entity!.label}.`,
    finished: e => `A snapshot back up has been created for ${e.entity!.label}.`,
  },
  // longviewclient_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // longviewclient_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // managed_disabled: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // managed_enabled: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // managed_service_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // managed_service_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // nodebalancer_config_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // nodebalancer_config_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // nodebalancer_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // nodebalancer_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // password_reset: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // payment_submitted: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // stackscript_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // stackscript_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // stackscript_publicize: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // stackscript_revise: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // tfa_disabled: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // tfa_enabled: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // ticket_attachment_upload: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // ticket_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // ticket_reply: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // volume_attach: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // volume_clone: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // volume_create: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // volume_delete: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // volume_detach: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  // volume_resize: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
};

export default (e: Linode.Event) => {
  const fn = path<EventMessageCreator>([e.action, e.status], eventMessageCreators);

  if (!fn) {
    /** @todo Use Sentry to track? */
    return;
  }

  let message;
  try {
    message = fn(e);
  } catch (error) {
    /** @todo Use Sentry to track? */
    return;
  }

  return message;
};
