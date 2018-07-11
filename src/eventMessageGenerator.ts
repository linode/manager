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
  backups_cancel: {
    notification: e => `Backups have been cancelled for ${e.entity!.label}.`,
  },
  backups_enable: {
    notification: e => `Backups have been enabled for ${e.entity!.label}.`,
  },
  backups_restore: {
    scheduled: e => `Backup restoration scheduled for ${e.entity!.label}`,
    started: e => `Backup restoration started for ${e.entity!.label}`,
    failed: e => `Backup restoration has failed for ${e.entity!.label}.`,
    finished: e => `Backup restoration has completed for ${e.entity!.label}.`,
    notification: e => `Backup restoration has completed for ${e.entity!.label}.`,
  },
  community_question_reply: {
    notification: e => `There has been a reply to your thread "${e.entity!.label}".`,
  },
  credit_card_updated: {
    notification: e => `Credit card information has been updated.`,
  },
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
  disk_imagize: {
    // Currently, the event contains no information about the image,
    // making it impossible to access the label for these messages.
    scheduled: e => `Image scheduled for creation.`,
    started: e => `Image being created.`,
    failed: e => `There was an error creating the image.`,
    finished: e => `Image created successfully.`,
    // notification: e => ``,
  },
  // disk_resize: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  dns_record_create: {
    notification: e => `DNS record added to ${e.entity!.label}`,
  },
  dns_record_delete: {
    notification: e => `DNS record removed from ${e.entity!.label}`,
  },
  dns_zone_create: {
    notification: e => `DNS zone add to ${e.entity!.label}`,
  },
  dns_zone_delete: {
    notification: e => `DNS zone removed from ${e.entity!.label}`,
  },
  domain_create: {
    notification: e => `Domain ${e.entity!.label} has been created.`,
  },
  domain_delete: {
    notification: e => `Domain ${e.entity!.label} has been deleted.`,
  },
  domain_record_create: {
    notification: e => `A domain record has been created for ${e.entity!.label}`,
  },
  domain_record_delete: {
    notification: e => `A domain record has been deleted from ${e.entity!.label}`,
  },
  image_delete: {
    // scheduled: e => `Image ${e.entity!.label} scheduled for deletion.`,
    // started: e => `Image ${e.entity!.label} is being deleted.`,
    // failed: e => `There was a problem deleting ${e.entity!.label}.`,
    // finished: e => `${e.entity!.label}`,
    notification: e => `Image ${e.entity!.label} has been deleted.`,
  },
  linode_addip: {
    notification: e => `An IP has been added to ${e.entity!.label}.`,
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
  nodebalancer_config_create: {
    notification: e => `NodeBalancer configuration ${e.entity!.label} has been created.`,
  },
  nodebalancer_config_delete: {
    notification: e => `NodeBalancer configuration ${e.entity!.label} has been deleted.`,
  },
  nodebalancer_create: {
    notification: e => `NodeBalancer ${e.entity!.label} has been created.`,
  },
  nodebalancer_delete: {
    notification: e => `NodeBalancer ${e.entity!.label} has been deleted.`,
  },
  password_reset: {
    scheduled: e => `A password reset for ${e.entity!.label} has been scheduled.`,
    started: e => `The password for ${e.entity!.label} is being reset.`,
    failed: e => `A password reset has failed for Linode ${e.entity!.label}.`,
    finished: e => `Linode ${e.entity!.label} has had it's password reset.`,
  },
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
  tfa_disabled: {
    notification: e => `Two-factor authentication has been disabled.`,
  },
  tfa_enabled: {
    notification: e => `Two-factor authentication has been enabled.`,
  },
  // ticket_attachment_upload: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  ticket_create: {
    notification: e => `New support ticket "${e.entity!.label}" created.`,
  },
  // ticket_reply: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  ticket_update: {
    notification: e => `Support ticket "${e.entity!.label}" has been updated.`,
  },
  volume_attach: {
    scheduled: e => `Volume ${e.entity!.label} is scheduled for attachment to a Linode.`,
    started: e => `Volume ${e.entity!.label} is being attached to a Linode.`,
    failed: e => `Volume ${e.entity!.label} failed to attach to a Linode.`,
    finished: e => `Volume ${e.entity!.label} has been attached to a Linode.`,
  },
  volume_clone: {
    notification: e => `Volume ${e.entity!.label} has been cloned.`,
  },
  volume_create: {
    scheduled: e => `Volume ${e.entity!.label} has been scheduled for creation.`,
    started: e => `Volume ${e.entity!.label} is being created.`,
    failed: e => `Creation of volume ${e.entity!.label} has failed.`,
    finished: e => `Volume ${e.entity!.label} has been created.`,
    notification: e => `Volume ${e.entity!.label} has been created.`,
  },
  volume_delete: {
    scheduled: e => ``,
    started: e => ``,
    failed: e => ``,
    finished: e => ``,
    notification: e => `Volume ${e.entity!.label} has been deleted.`,
  },
  volume_detach: {
    scheduled: e => `Volume ${e.entity!.label} is scheduled for detachment.`,
    started: e => `Volume ${e.entity!.label} is being detached from a Linode.`,
    failed: e => `Volume ${e.entity!.label} has failed to detach from a Linode.`,
    finished: e => `Volume ${e.entity!.label} has been detached..`,
    notification: e => `Volume ${e.entity!.label} has been detached.`,
  },
  volume_resize: {
    notification: e => `Volume ${e.entity!.label} has been resized.`,
  },
};

export default (
  e: Linode.Event,
  onUnfound?: (e: Linode.Event) => void,
  onError?: (e: Linode.Event, err: Error) => void,
) => {
  const fn = path<EventMessageCreator>([e.action, e.status], eventMessageCreators);

  if (!fn) {
    if (onUnfound) onUnfound(e);
    return;
  }

  let message;
  try {
    message = fn(e);
  } catch (error) {
    if (onError) onError(e, error);
    return;
  }

  return message;
};
