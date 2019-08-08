import { path } from 'ramda';
import { isProduction } from 'src/constants';
import { reportException } from 'src/exceptionReporting';

type EventMessageCreator = (e: Linode.Event) => string;

interface CreatorsForStatus {
  scheduled?: EventMessageCreator;
  started?: EventMessageCreator;
  failed?: EventMessageCreator;
  finished?: EventMessageCreator;
  notification?: EventMessageCreator;
}

/** @see https://leo.stcloudstate.edu/grammar/tenses.html */
export const eventMessageCreators: { [index: string]: CreatorsForStatus } = {
  account_update: {
    notification: e => `Your account settings have been updated.`
  },
  account_settings_update: {
    notification: e => `Your account settings have been updated.`
  },
  backups_cancel: {
    notification: e => `Backups have been cancelled for ${e.entity!.label}.`
  },
  backups_enable: {
    notification: e => `Backups have been enabled for ${e.entity!.label}.`
  },
  backups_restore: {
    scheduled: e => `Backup restoration scheduled for ${e.entity!.label}`,
    started: e => `Backup restoration started for ${e.entity!.label}`,
    failed: e => `Backup restoration failed for ${e.entity!.label}.`,
    finished: e => `Backup restoration completed for ${e.entity!.label}.`,
    notification: e => `Backup restoration completed for ${e.entity!.label}.`
  },
  community_question_reply: {
    notification: e =>
      `There has been a reply to your thread "${e.entity!.label}".`
  },
  community_like: {
    notification: e => e.entity!.label
  },
  community_mention: {
    notification: e =>
      `You have been mentioned in a Community post: ${e.entity!.label}`
  },
  credit_card_updated: {
    notification: e => `Credit card information has been updated.`
  },
  disk_create: {
    scheduled: e => `Disk is being added to Linode ${e.entity!.label}.`,
    started: e => `Disk is being added to ${e.entity!.label}.`,
    failed: e => `Disk could not be added to Linode ${e.entity!.label}.`,
    finished: e => `Disk has been added to Linode ${e.entity!.label}.`
    // notification: e => ``,
  },
  disk_update: {
    notification: e => `A disk has been updated on Linode ${e.entity!.label}.`
  },
  disk_delete: {
    scheduled: e =>
      `A disk on Linode ${e.entity!.label} is scheduled for deletion.`,
    started: e => `A disk on Linode ${e.entity!.label} is being deleted.`,
    failed: e => `A disk on Linode ${e.entity!.label} could not be deleted.`,
    finished: e => `A disk on Linode ${e.entity!.label} has been deleted`
    // notification: e => ``,
  },
  disk_duplicate: {
    scheduled: e =>
      `A disk on Linode ${e.entity!.label} is scheduled for duplication.`,
    started: e => `A disk on Linode ${e.entity!.label} is being duplicated.`,
    failed: e => `A disk on Linode ${e.entity!.label} could not be duplicated.`,
    finished: e => `A disk on Linode ${e.entity!.label} has been duplicated`
    // notification: e => ``,
  },
  disk_imagize: {
    // Currently, the event contains no information about the image,
    // making it impossible to access the label for these messages.
    scheduled: e => `Image scheduled for creation.`,
    started: e => `Image being created.`,
    failed: e => `Image creation failed.`,
    finished: e => `Image has been created.`
    // notification: e => ``,
  },
  disk_resize: {
    scheduled: e => `A disk on ${e.entity!.label} is scheduled for resizing.`,
    started: e => `A disk on Linode ${e.entity!.label} is being resized.`,
    failed: e => `A disk on Linode ${e.entity!.label} could not be resized.`,
    finished: e => `A disk on Linode ${e.entity!.label} has been resized`
    // notification: e => ``,
  },
  dns_record_create: {
    notification: e => `DNS record has been added to ${e.entity!.label}`
  },
  dns_record_delete: {
    notification: e => `DNS record has been removed from ${e.entity!.label}`
  },
  dns_zone_create: {
    notification: e => `DNS zone has been added to ${e.entity!.label}`
  },
  dns_zone_delete: {
    notification: e => `DNS zone has been removed from ${e.entity!.label}`
  },
  domain_create: {
    notification: e => `Domain ${e.entity!.label} has been created.`
  },
  domain_update: {
    notification: e => `Domain ${e.entity!.label} has been updated.`
  },
  domain_delete: {
    notification: e => `Domain ${e.entity!.label} has been deleted.`
  },
  domain_record_create: {
    notification: e => `A domain record has been created for ${e.entity!.label}`
  },
  domain_record_update: {
    notification: e => `A domain record has been updated for ${e.entity!.label}`
  },
  domain_record_delete: {
    notification: e =>
      `A domain record has been deleted from ${e.entity!.label}`
  },
  image_update: {
    notification: e => `Image ${e.entity!.label} has been updated.`
  },
  image_delete: {
    // scheduled: e => `Image ${e.entity!.label} scheduled for deletion.`,
    // started: e => `Image ${e.entity!.label} is being deleted.`,
    // failed: e => `There was a problem deleting ${e.entity!.label}.`,
    // finished: e => `${e.entity!.label}`,
    notification: e => `Image ${e.entity!.label} has been deleted.`
  },
  linode_addip: {
    notification: e => `An IP has been added to ${e.entity!.label}.`
  },
  linode_boot: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled to boot.`,
    started: e => `Linode ${e.entity!.label} is booting.`,
    failed: e => `Linode ${e.entity!.label} could not be booted.`,
    finished: e => `Linode ${e.entity!.label} has booted.`
  },
  lassie_reboot: {
    scheduled: e =>
      `Linode ${
        e.entity!.label
      } is scheduled to be rebooted by the Lassie watchdog service.`,
    started: e =>
      `Linode ${
        e.entity!.label
      } is being booted by the Lassie watchdog service.`,
    failed: e =>
      `Linode ${
        e.entity!.label
      } could not be booted by the Lassie watchdog service.`,
    finished: e =>
      `Linode ${
        e.entity!.label
      } has been booted by the Lassie watchdog service.`
  },
  host_reboot: {
    scheduled: e =>
      `Linode ${
        e.entity!.label
      } is scheduled to reboot (Host initiated restart).`,
    started: e =>
      `Linode ${e.entity!.label} is booting (Host initiated restart).`,
    failed: e =>
      `Linode ${e.entity!.label} could not be booted (Host initiated restart).`,
    finished: e =>
      `Linode ${e.entity!.label} has booted (Host initiated restart).`
  },
  ipaddress_update: {
    notification: e => `An IP address has been updated on your account.`
  },
  lish_boot: {
    scheduled: e =>
      `Linode ${e.entity!.label} is scheduled to boot (Lish initiated boot).`,
    started: e => `Linode ${e.entity!.label} is booting (Lish initiated boot).`,
    failed: e =>
      `Linode ${e.entity!.label} could not be booted (Lish initiated boot).`,
    finished: e => `Linode ${e.entity!.label} has booted (Lish initiated boot).`
  },
  linode_clone: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled to be cloned.`,
    started: e => `Linode ${e.entity!.label} is being cloned.`,
    failed: e => `Linode ${e.entity!.label} could not be cloned.`,
    finished: e => `Linode ${e.entity!.label} has been cloned.`,
    notification: e => `Linode ${e.entity!.label} is scheduled to be cloned.`
  },
  linode_create: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for creation.`,
    started: e => `Linode ${e.entity!.label} is being created.`,
    failed: e => `Linode ${e.entity!.label} could not be created.`,
    finished: e => `Linode ${e.entity!.label} has been created.`
  },
  linode_update: {
    notification: e => `Linode ${e.entity!.label} has been updated.`
  },
  linode_delete: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for deletion.`,
    started: e => `Linode ${e.entity!.label} is being deleted.`,
    failed: e => `Linode ${e.entity!.label} could not be deleted.`,
    finished: e => `Linode ${e.entity!.label} has been deleted.`
  },
  linode_deleteip: {
    notification: e => `An IP was deleted from Linode ${e.entity!.id}`
  },
  linode_migrate: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for migration.`,
    started: e => `Linode ${e.entity!.label} is being migrated.`,
    failed: e => `Migration failed for Linode ${e.entity!.label}.`,
    finished: e => `Linode ${e.entity!.label} has been migrated.`
  },
  // This event type isn't currently being displayed, but I added a message here just in case.
  linode_migrate_datacenter_create: {
    notification: e =>
      `Migration for Linode ${e.entity!.label} has been initiated.`
  },
  // These are the same as the messages for `linode_migrate`.
  linode_migrate_datacenter: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for migration.`,
    started: e => `Linode ${e.entity!.label} is being migrated.`,
    failed: e => `Migration failed for Linode ${e.entity!.label}.`,
    finished: e => `Linode ${e.entity!.label} has been migrated.`
  },
  // This event type isn't currently being displayed, but I added a message here just in case.
  linode_mutate_create: {
    notification: e =>
      `Upgrade for Linode ${e.entity!.label} has been initiated.`
  },
  linode_mutate: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for an upgrade.`,
    started: e => `Linode ${e.entity!.label} is being upgraded.`,
    failed: e => `Linode ${e.entity!.label} could not be upgraded.`,
    finished: e => `Linode ${e.entity!.label} has been upgraded.`,
    notification: e => `Linode ${e.entity!.label} is being upgraded.`
  },
  linode_reboot: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for a reboot.`,
    started: e => `Linode ${e.entity!.label} is rebooting.`,
    failed: e => `Linode ${e.entity!.label} could not be rebooted.`,
    finished: e => `Linode ${e.entity!.label} was rebooted.`
  },
  linode_rebuild: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for rebuild.`,
    started: e => `Linode ${e.entity!.label} is being rebuilt.`,
    failed: e => `Linode ${e.entity!.label} could not be rebuilt.`,
    finished: e => `Linode ${e.entity!.label} was rebuilt.`
  },
  // This event type isn't currently being displayed, but I added a message here just in case.
  linode_resize_create: {
    notification: e =>
      `Resize for Linode ${e.entity!.label} has been initiated.`
  },
  linode_resize: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for resizing.`,
    started: e => `Linode ${e.entity!.label} is resizing.`,
    failed: e => `Linode ${e.entity!.label} could not be resized`,
    finished: e => `Linode ${e.entity!.label} has been resized.`
  },
  linode_shutdown: {
    scheduled: e => `Linode ${e.entity!.label} is scheduled for shutdown.`,
    started: e => `Linode ${e.entity!.label} is shutting down.`,
    failed: e => `Linode ${e.entity!.label} could not be shut down.`,
    finished: e => `Linode ${e.entity!.label} has been shut down.`
  },
  linode_snapshot: {
    scheduled: e =>
      `Linode ${e.entity!.label} is scheduled for a snapshot backup.`,
    started: e =>
      `A snapshot backup is being created for Linode ${e.entity!.label}.`,
    failed: e => `Snapshot backup failed on Linode ${e.entity!.label}.`,
    finished: e => `A snapshot backup has been created for ${e.entity!.label}.`
  },
  linode_config_create: {
    notification: e => `A config has been created on Linode ${e.entity!.label}.`
  },
  linode_config_update: {
    notification: e => `A config has been updated on Linode ${e.entity!.label}.`
  },
  linode_config_delete: {
    notification: e => `A config has been deleted on Linode ${e.entity!.label}.`
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
    notification: e =>
      `A config on NodeBalancer ${e.entity!.label} has been created.`
  },
  nodebalancer_config_update: {
    notification: e =>
      `A config on NodeBalancer ${e.entity!.label} has been updated.`
  },
  nodebalancer_config_delete: {
    notification: e =>
      `A config on NodeBalancer ${e.entity!.label} has been deleted.`
  },
  nodebalancer_create: {
    notification: e => `NodeBalancer ${e.entity!.label} has been created.`
  },
  nodebalancer_update: {
    notification: e => `NodeBalancer ${e.entity!.label} has been updated.`
  },
  nodebalancer_delete: {
    notification: e => `NodeBalancer ${e.entity!.label} has been deleted.`
  },
  nodebalancer_node_create: {
    notification: e =>
      `A node on NodeBalancer ${e.entity!.label} has been created.`
  },
  nodebalancer_node_update: {
    notification: e =>
      `A node on NodeBalancer ${e.entity!.label} has been updated.`
  },
  oauth_client_create: {
    notification: e => `OAuth App ${e.entity!.label} has been created.`
  },
  oauth_client_update: {
    notification: e => `OAuth App ${e.entity!.label} has been updated.`
  },
  oauth_client_secret_reset: {
    notification: e => `Secret for OAuth App ${e.entity!.label} has been reset.`
  },
  oauth_client_delete: {
    notification: e => `OAuth App ${e.entity!.label} has been deleted.`
  },
  password_reset: {
    scheduled: e => `A password reset is scheduled for ${e.entity!.label}.`,
    started: e => `The password for ${e.entity!.label} is being reset.`,
    failed: e => `Password reset failed for Linode ${e.entity!.label}.`,
    finished: e => `Password has been reset on Linode ${e.entity!.label}.`
  },
  profile_update: {
    notification: e => `Your profile has been updated.`
  },
  payment_submitted: {
    notification: e => `A payment was successfully submitted.`
  },
  stackscript_create: {
    notification: e => `StackScript ${e.entity!.label} has been created.`
  },
  stackscript_update: {
    notification: e => `StackScript ${e.entity!.label} has been updated.`
  },
  stackscript_delete: {
    notification: e => `StackScript ${e.entity!.label} has been deleted.`
  },
  stackscript_publicize: {
    notification: e => `StackScript ${e.entity!.label} has been made public.`
  },
  stackscript_revise: {
    notification: e => `StackScript ${e.entity!.label} has been revised.`
  },
  tag_create: {
    notification: e => `Tag ${e.entity!.label} has been created.`
  },
  tag_delete: {
    notification: e => `Tag ${e.entity!.label} has been deleted.`
  },
  tfa_disabled: {
    notification: e => `Two-factor authentication has been disabled.`
  },
  tfa_enabled: {
    notification: e => `Two-factor authentication has been enabled.`
  },
  ticket_create: {
    notification: e => `New support ticket "${e.entity!.label}" created.`
  },
  // ticket_reply: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  ticket_update: {
    notification: e => `Support ticket "${e.entity!.label}" has been updated.`
  },
  ticket_attachment_upload: {
    notification: e =>
      `File has been successfully uploaded to support ticket ${e.entity!.label}`
  },
  token_create: {
    notification: e => `Token ${e.entity!.label} has been created.`
  },
  token_update: {
    notification: e => `Token ${e.entity!.label} has been updated.`
  },
  token_delete: {
    notification: e => `Token ${e.entity!.label} has been revoked.`
  },

  volume_attach: {
    // @todo Once we have better events, display the name of the attached Linode
    // in these messages.
    scheduled: e => `Volume ${e.entity!.label} is scheduled to be attached.`,
    started: e => `Volume ${e.entity!.label} is being attached.`,
    failed: e => `Volume ${e.entity!.label} failed to attach.`,
    finished: e => `Volume ${e.entity!.label} has been attached.`,
    notification: e => `Volume ${e.entity!.label} has been attached.`
  },
  volume_clone: {
    notification: e => `Volume ${e.entity!.label} has been cloned.`
  },
  volume_create: {
    scheduled: e => `Volume ${e.entity!.label} is scheduled for creation.`,
    started: e => `Volume ${e.entity!.label} is being created.`,
    failed: e => `Creation of volume ${e.entity!.label} failed.`,
    finished: e => `Volume ${e.entity!.label} has been created.`,
    notification: e => `Volume ${e.entity!.label} has been created.`
  },
  volume_update: {
    notification: e => `Volume ${e.entity!.label} has been updated.`
  },
  volume_delete: {
    scheduled: e => ``,
    started: e => ``,
    failed: e => ``,
    finished: e => ``,
    notification: e => `Volume ${e.entity!.label} has been deleted.`
  },
  volume_detach: {
    // @todo Once we have better events, display the name of the attached Linode
    // in these messages.
    scheduled: e => `Volume ${e.entity!.label} is scheduled for detachment.`,
    started: e => `Volume ${e.entity!.label} is being detached.`,
    failed: e => `Volume ${e.entity!.label} failed to detach.`,
    finished: e => `Volume ${e.entity!.label} has been detached.`,
    notification: e => `Volume ${e.entity!.label} has been detached.`
  },
  volume_resize: {
    notification: e => `Volume ${e.entity!.label} has been resized.`
  },
  user_ssh_key_add: {
    notification: e => `An SSH key has been added to your profile.`
  },
  user_ssh_key_update: {
    notification: e => `An SSH key on your profile has been updated.`
  },
  user_ssh_key_delete: {
    notification: e => `An SSH key has been removed from your profile.`
  },
  user_create: {
    notification: e => `User ${e.entity!.label} has been created.`
  },
  user_delete: {
    notification: e => `User ${e.entity!.label} has been deleted.`
  },
  user_update: {
    notification: e => `User ${e.entity!.label} has been updated.`
  }
};

export default (e: Linode.Event): string => {
  const fn = path<EventMessageCreator>(
    [e.action, e.status],
    eventMessageCreators
  );

  /** we couldn't find the event in our list above */
  if (!fn) {
    /** log unknown events to the console */
    if (!isProduction) {
      /* tslint:disable */
      console.error('============================================');
      console.error('Unknown API Event Received');
      console.log(e);
      console.error('============================================');
      /* tslint:enable */
    }

    /** finally return some default fallback text */
    return `${e.action}${e.entity ? ` on ${e.entity.label}` : ''}`;
  }

  let message = '';
  try {
    message = fn(e);
  } catch (error) {
    /** report our error to sentry */
    reportException('Known API Event Received with Error', {
      event_data: e,
      error
    });
  }

  /** return either the message or an empty string */
  return message;
};
