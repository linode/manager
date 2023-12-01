import { Event } from '@linode/api-v4/lib/account';
import { path } from 'ramda';

import { isProductionBuild } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import {
  formatEventWithAppendedText,
  formatEventWithUsername,
} from 'src/features/Events/Event.helpers';
import { escapeRegExp } from 'src/utilities/escapeRegExp';
import { getLinkForEvent } from 'src/utilities/getEventsActionLink';

export type EventMessageCreator = (e: Event) => string;

export interface CreatorsForStatus {
  failed?: EventMessageCreator;
  finished?: EventMessageCreator;
  notification?: EventMessageCreator;
  scheduled?: EventMessageCreator;
  started?: EventMessageCreator;
}

export const safeSecondaryEntityLabel = (
  e: Event,
  text: string,
  fallback: string = ''
) => {
  const label = e?.secondary_entity?.label;
  return label ? `${text} ${label}` : fallback;
};

export const eventMessageCreators: { [index: string]: CreatorsForStatus } = {
  account_agreement_eu_model: {
    notification: () => 'The EU Model Contract has been signed.',
  },
  account_promo_apply: {
    notification: (e) => `A promo code was applied to your account.`,
  },
  account_settings_update: {
    notification: (e) => `Your account settings have been updated.`,
  },
  account_update: {
    notification: (e) => `Your account settings have been updated.`,
  },
  backups_cancel: {
    notification: (e) => `Backups have been canceled for ${e.entity!.label}.`,
  },
  backups_enable: {
    notification: (e) => `Backups have been enabled for ${e.entity!.label}.`,
  },
  backups_restore: {
    failed: (e) =>
      `${formatEventWithAppendedText(
        e,
        `Backup restoration failed for ${e.entity!.label}.`,
        'Learn more about limits and considerations',
        'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
      )}`,
    finished: (e) => `Backup restoration completed for ${e.entity!.label}.`,
    notification: (e) => `Backup restoration completed for ${e.entity!.label}.`,
    scheduled: (e) => `Backup restoration scheduled for ${e.entity!.label}`,
    started: (e) => `Backup restoration started for ${e.entity!.label}`,
  },
  community_like: {
    notification: (e) =>
      e.entity?.label
        ? `A post on "${e.entity.label}" has been liked.`
        : `There has been a like on your community post.`,
  },
  community_mention: {
    notification: (e) =>
      e.entity?.label
        ? `You have been mentioned in a Community post: ${e.entity.label}.`
        : `You have been mentioned in a Community post.`,
  },
  community_question_reply: {
    notification: (e) =>
      e.entity?.label
        ? `There has been a reply to your thread "${e.entity.label}".`
        : `There has been a reply to your thread.`,
  },
  credit_card_updated: {
    notification: (e) => `Credit card information has been updated.`,
  },
  database_backup_restore: {
    notification: (e) =>
      `Database ${e.entity!.label} has been restored from a backup.`,
  },
  database_create: {
    failed: (e) => `Database ${e.entity!.label} could not be created.`,
    finished: (e) => `Database ${e.entity!.label} has been created.`,
    notification: (e) =>
      `Database ${e.entity!.label} is scheduled for creation.`,
    scheduled: (e) => `Database ${e.entity!.label} is scheduled for creation.`,
    started: (e) => `Database ${e.entity!.label} is being created.`,
  },
  database_credentials_reset: {
    notification: (e) =>
      `Database ${e.entity!.label}'s credentials have been reset.`,
  },
  database_delete: {
    notification: (e) => `Database ${e.entity!.label} has been deleted.`,
  },
  database_low_disk_space: {
    finished: (e) =>
      `Low disk space alert for database ${e.entity!.label} has cleared.`,
    notification: (e) => `Database ${e.entity!.label} has low disk space.`,
  },
  database_update: {
    finished: (e) => `Database ${e.entity!.label} has been updated.`,
  },
  database_update_failed: {
    notification: (e) => `Database ${e.entity!.label} failed to update.`,
  },
  disk_create: {
    failed: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Disk',
        'A disk'
      )} could not be added to Linode ${e.entity!.label}.`,
    finished: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Disk',
        'A disk'
      )} has been added to Linode ${e.entity!.label}.`,
    scheduled: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Disk',
        'A disk'
      )} is being added to Linode ${e.entity!.label}.`,
    started: (e) =>
      `${safeSecondaryEntityLabel(e, 'Disk', 'A disk')} is being added to ${
        e.entity!.label
      }.`,
    // notification: e => ``,
  },
  disk_delete: {
    failed: (e) =>
      `${safeSecondaryEntityLabel(e, 'Disk', 'A disk')} on Linode ${
        e.entity!.label
      } could not be deleted.`,
    finished: (e) =>
      `${safeSecondaryEntityLabel(e, 'Disk', 'A disk')} on Linode ${
        e.entity!.label
      } has been deleted`,
    scheduled: (e) =>
      `${safeSecondaryEntityLabel(e, 'Disk', 'A disk')} on Linode ${
        e.entity!.label
      } is scheduled for deletion.`,
    started: (e) =>
      `${safeSecondaryEntityLabel(e, 'Disk', 'A disk')} on Linode ${
        e.entity!.label
      } is being deleted.`,
    // notification: e => ``,
  },
  disk_duplicate: {
    failed: (e) =>
      `A disk on Linode ${e.entity!.label} could not be duplicated.`,
    finished: (e) => `A disk on Linode ${e.entity!.label} has been duplicated`,
    scheduled: (e) =>
      `A disk on Linode ${e.entity!.label} is scheduled for duplication.`,
    started: (e) => `A disk on Linode ${e.entity!.label} is being duplicated.`,
    // notification: e => ``,
  },
  disk_imagize: {
    failed: (e) =>
      `${formatEventWithAppendedText(
        e,
        `There was a problem creating Image ${
          e?.secondary_entity?.label ?? ''
        }.`,
        'Learn more about image technical specifications',
        'https://www.linode.com/docs/products/tools/images/#technical-specifications'
      )}`,
    finished: (e) =>
      `Image ${e?.secondary_entity?.label + ' ' ?? ''}has been created.`,
    scheduled: (e) =>
      `Image ${e?.secondary_entity?.label + ' ' ?? ''}scheduled for creation.`,
    started: (e) =>
      `Image ${e?.secondary_entity?.label + ' ' ?? ''}being created.`,
  },
  disk_resize: {
    failed: (e) =>
      `${formatEventWithAppendedText(
        e,
        `A disk on Linode ${e.entity!.label} could not be resized.`,
        'Learn more',
        'https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/'
      )}`,
    finished: (e) => `A disk on Linode ${e.entity!.label} has been resized`,
    scheduled: (e) => `A disk on ${e.entity!.label} is scheduled for resizing.`,
    started: (e) => `A disk on Linode ${e.entity!.label} is being resized.`,
    // notification: e => ``,
  },
  disk_update: {
    notification: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Disk',
        'A disk'
      )} has been updated on Linode ${e.entity!.label}.`,
  },
  dns_record_create: {
    notification: (e) => `DNS record has been added to ${e.entity!.label}`,
  },
  dns_record_delete: {
    notification: (e) => `DNS record has been removed from ${e.entity!.label}`,
  },
  dns_zone_create: {
    notification: (e) => `DNS zone has been added to ${e.entity!.label}`,
  },
  dns_zone_delete: {
    notification: (e) => `DNS zone has been removed from ${e.entity!.label}`,
  },
  domain_create: {
    notification: (e) => `Domain ${e.entity!.label} has been created.`,
  },
  domain_delete: {
    notification: (e) => `Domain ${e.entity!.label} has been deleted.`,
  },
  domain_import: {
    notification: (e) => `Domain ${e.entity?.label ?? ''} has been imported.`,
  },
  domain_record_create: {
    notification: (e) => `${e.message} added to ${e.entity!.label}`,
  },
  domain_record_delete: {
    notification: (e) =>
      `A domain record has been deleted from ${e.entity!.label}`,
  },
  domain_record_update: {
    notification: (e) => `${e.message} updated for ${e.entity!.label}`,
  },
  domain_update: {
    notification: (e) => `Domain ${e.entity!.label} has been updated.`,
  },
  entity_transfer_accept: {
    notification: (_) => `A service transfer has been accepted.`,
  },
  entity_transfer_accept_recipient: {
    notification: (_) => `You have accepted a service transfer.`,
  },
  entity_transfer_cancel: {
    notification: (_) => `A service transfer has been canceled.`,
  },
  entity_transfer_create: {
    notification: (_) => `A service transfer has been created.`,
  },
  entity_transfer_fail: {
    notification: (_) => `Service transfer failed.`,
  },
  entity_transfer_stale: {
    notification: (_) => `A service transfer token has expired.`,
  },
  firewall_create: {
    notification: (e) => `Firewall ${e.entity?.label ?? ''} has been created.`,
  },
  firewall_delete: {
    notification: (e) => `Firewall ${e.entity?.label ?? ''} has been deleted.`,
  },
  firewall_device_add: {
    notification: (e) =>
      `A device has been added to Firewall ${e.entity?.label ?? ''}.`,
  },
  firewall_device_remove: {
    notification: (e) =>
      `A device has been removed from Firewall ${e.entity?.label ?? ''}.`,
  },
  firewall_disable: {
    notification: (e) => `Firewall ${e.entity?.label ?? ''} has been disabled.`,
  },
  firewall_enable: {
    notification: (e) => `Firewall ${e.entity?.label ?? ''} has been enabled.`,
  },
  firewall_rules_update: {
    notification: (e) =>
      `Firewall rules have been updated on ${e.entity?.label ?? ''}.`,
  },
  firewall_update: {
    notification: (e) => `Firewall ${e.entity?.label ?? ''} has been updated.`,
  },
  host_reboot: {
    failed: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } could not be booted (Host initiated restart).`,
    finished: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } has been booted (Host initiated restart).`,
    scheduled: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is scheduled to reboot (Host initiated restart).`,
    started: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is being booted (Host initiated restart).`,
  },
  image_delete: {
    failed: (e) => `There was a problem deleting ${e.entity?.label ?? ''}.`,
    finished: (e) => `Image ${e.entity?.label ?? ''} has been deleted.`,
    notification: (e) => `Image ${e.entity?.label ?? ''} has been deleted.`,
    scheduled: (e) => `Image ${e.entity?.label ?? ''} scheduled for deletion.`,
    started: (e) => `Image ${e.entity?.label ?? ''} is being deleted.`,
  },
  image_update: {
    notification: (e) => `Image ${e.entity?.label ?? ''} has been updated.`,
  },
  image_upload: {
    failed: (e) =>
      `There was a problem uploading ${
        e.entity?.label ?? ''
      }: ${e?.message?.replace(/(\d+)/g, '$1 MB')}.`,
    finished: (e) => `Image ${e.entity?.label ?? ''} has been uploaded.`,
    notification: (e) => `Image ${e.entity?.label ?? ''} has been uploaded.`,
    scheduled: (e) => `Image ${e.entity?.label ?? ''} scheduled for upload.`,
    started: (e) => `Image ${e.entity?.label ?? ''} is being uploaded.`,
  },
  ipaddress_update: {
    notification: (e) => `An IP address has been updated on your account.`,
  },
  ipv6pool_add: {
    notification: () => 'An IPv6 range has been added.',
  },
  ipv6pool_delete: {
    notification: () => 'An IPv6 range has been deleted.',
  },
  /**
   * For these events, we expect an entity (the Linode being rebooted)
   * but there have been cases where an event has come through with
   * entity === null. Handle them safely.
   */
  lassie_reboot: {
    failed: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } could not be booted by the Lassie watchdog service.`,
    finished: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } has been booted by the Lassie watchdog service.`,
    scheduled: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is scheduled to be rebooted by the Lassie watchdog service.`,
    started: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is being booted by the Lassie watchdog service.`,
  },
  linode_addip: {
    notification: (e) => `An IP has been added to ${e.entity!.label}.`,
  },
  linode_boot: {
    failed: (e) =>
      `Linode ${e.entity!.label} could not be ${safeSecondaryEntityLabel(
        e,
        'booted with config',
        'booted'
      )}.`,
    finished: (e) =>
      `Linode ${e.entity!.label} has been ${safeSecondaryEntityLabel(
        e,
        'booted with config',
        'booted'
      )}.`,
    scheduled: (e) =>
      `Linode ${e.entity!.label} is scheduled to ${safeSecondaryEntityLabel(
        e,
        'boot with config',
        'boot'
      )}.`,
    started: (e) =>
      `Linode ${e.entity!.label} is being ${safeSecondaryEntityLabel(
        e,
        'booted with config',
        'booted'
      )}.`,
  },
  linode_clone: {
    failed: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } could not be cloned${safeSecondaryEntityLabel(e, ' to', '')}.`,
    finished: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } has been cloned${safeSecondaryEntityLabel(e, ' to', '')}.`,
    notification: (e) =>
      `Linode ${e.entity?.label ?? ''} is scheduled to be cloned.`,
    scheduled: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is scheduled to be cloned${safeSecondaryEntityLabel(e, ' to', '')}.`,
    started: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is being cloned${safeSecondaryEntityLabel(e, ' to', '')}.`,
  },
  linode_config_create: {
    notification: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Config',
        'A config'
      )} has been created on Linode ${e.entity!.label}.`,
  },
  linode_config_delete: {
    notification: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Config',
        'A config'
      )} has been deleted on Linode ${e.entity!.label}.`,
  },
  linode_config_update: {
    notification: (e) =>
      `${safeSecondaryEntityLabel(
        e,
        'Config',
        'A config'
      )} has been updated on Linode ${e.entity!.label}.`,
  },
  linode_create: {
    failed: (e) => `Linode ${e.entity!.label} could not be created.`,
    finished: (e) => `Linode ${e.entity!.label} has been created.`,
    scheduled: (e) => `Linode ${e.entity!.label} is scheduled for creation.`,
    started: (e) => `Linode ${e.entity!.label} is being created.`,
  },
  linode_delete: {
    failed: (e) => `Linode ${e.entity!.label} could not be deleted.`,
    finished: (e) => `Linode ${e.entity!.label} has been deleted.`,
    notification: (e) => `Linode ${e.entity!.label} has been deleted.`,
    scheduled: (e) => `Linode ${e.entity!.label} is scheduled for deletion.`,
    started: (e) => `Linode ${e.entity!.label} is being deleted.`,
  },
  linode_deleteip: {
    notification: (e) => `An IP was deleted from Linode ${e.entity!.id}`,
  },
  linode_migrate: {
    failed: (e) => `Migration failed for Linode ${e.entity?.label ?? ''}.`,
    finished: (e) => `Linode ${e.entity?.label ?? ''} has been migrated.`,
    scheduled: (e) =>
      `Linode ${e.entity?.label ?? ''} is scheduled for migration.`,
    started: (e) => `Linode ${e.entity?.label ?? ''} is being migrated.`,
  },
  // These are the same as the messages for `linode_migrate`.
  linode_migrate_datacenter: {
    failed: (e) => `Migration failed for Linode ${e.entity?.label ?? ''}.`,
    finished: (e) => `Linode ${e.entity?.label ?? ''} has been migrated.`,
    scheduled: (e) =>
      `Linode ${e.entity?.label ?? ''} is scheduled for migration.`,
    started: (e) => `Linode ${e.entity?.label ?? ''} is being migrated.`,
  },
  // This event type isn't currently being displayed, but I added a message here just in case.
  linode_migrate_datacenter_create: {
    notification: (e) =>
      `Migration for Linode ${e.entity!.label} has been initiated.`,
  },
  linode_mutate: {
    failed: (e) => `Linode ${e.entity?.label ?? ''} could not be upgraded.`,
    finished: (e) => `Linode ${e.entity?.label ?? ''} has been upgraded.`,
    notification: (e) => `Linode ${e.entity?.label ?? ''} is being upgraded.`,
    scheduled: (e) =>
      `Linode ${e.entity?.label ?? ''} is scheduled for an upgrade.`,
    started: (e) => `Linode ${e.entity?.label ?? ''} is being upgraded.`,
  },
  // This event type isn't currently being displayed, but I added a message here just in case.
  linode_mutate_create: {
    notification: (e) =>
      `Upgrade for Linode ${e.entity!.label} has been initiated.`,
  },
  linode_reboot: {
    failed: (e) =>
      `Linode ${e.entity!.label} could not be ${safeSecondaryEntityLabel(
        e,
        'rebooted with config',
        'rebooted'
      )}.`,
    finished: (e) =>
      `Linode ${e.entity!.label} has been ${safeSecondaryEntityLabel(
        e,
        'rebooted with config',
        'rebooted'
      )}.`,
    scheduled: (e) =>
      `Linode ${e.entity!.label} is scheduled ${safeSecondaryEntityLabel(
        e,
        'for a reboot with config',
        'for a reboot'
      )}.`,
    started: (e) =>
      `Linode ${e.entity!.label} is being ${safeSecondaryEntityLabel(
        e,
        'rebooted with config',
        'rebooted'
      )}.`,
  },
  linode_rebuild: {
    failed: (e) => `Linode ${e.entity!.label} could not be rebuilt.`,
    finished: (e) => `Linode ${e.entity!.label} has been rebuilt.`,
    scheduled: (e) => `Linode ${e.entity!.label} is scheduled for rebuild.`,
    started: (e) => `Linode ${e.entity!.label} is being rebuilt.`,
  },
  linode_resize: {
    failed: (e) => `Linode ${e.entity?.label ?? ''} could not be resized`,
    finished: (e) => `Linode ${e.entity?.label ?? ''} has been resized.`,
    scheduled: (e) =>
      `Linode ${e.entity?.label ?? ''} is scheduled for resizing.`,
    started: (e) => `Linode ${e.entity?.label ?? ''} is resizing.`,
  },
  linode_resize_create: {
    notification: (e) =>
      `A cold resize for Linode ${e.entity!.label} has been initiated.`,
  },
  linode_resize_warm_create: {
    notification: (e) =>
      `A warm resize for Linode ${e.entity!.label} has been initiated.`,
  },
  linode_shutdown: {
    failed: (e) => `Linode ${e.entity!.label} could not be shut down.`,
    finished: (e) => `Linode ${e.entity!.label} has been shut down.`,
    scheduled: (e) => `Linode ${e.entity!.label} is scheduled for shutdown.`,
    started: (e) => `Linode ${e.entity!.label} is shutting down.`,
  },
  linode_snapshot: {
    failed: (e) =>
      `${formatEventWithAppendedText(
        e,
        `Snapshot backup failed on Linode ${e.entity!.label}.`,
        'Learn more about limits and considerations',
        'https://www.linode.com/docs/products/storage/backups/#limits-and-considerations'
      )}`,
    finished: (e) =>
      `A snapshot backup has been created for ${e.entity!.label}.`,
    scheduled: (e) =>
      `Linode ${e.entity!.label} is scheduled for a snapshot backup.`,
    started: (e) =>
      `A snapshot backup is being created for Linode ${e.entity!.label}.`,
  },
  linode_update: {
    notification: (e) => `Linode ${e.entity!.label} has been updated.`,
  },
  lish_boot: {
    failed: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } could not be booted (Lish initiated boot).`,
    finished: (e) =>
      `Linode ${e.entity?.label ?? ''} has been booted (Lish initiated boot).`,
    scheduled: (e) =>
      `Linode ${
        e.entity?.label ?? ''
      } is scheduled to boot (Lish initiated boot).`,
    started: (e) =>
      `Linode ${e.entity?.label ?? ''} is being booted (Lish initiated boot).`,
  },
  lke_node_create: {
    // This event is a special case; a notification means the node creation failed.
    // The entity is the node pool, but entity.label contains the cluster's label.
    notification: (e) =>
      `Failed to create a node on Kubernetes Cluster${
        e.entity?.label ? ` ${e.entity.label}` : ''
      }.`,
  },
  longviewclient_create: {
    notification: (e) => `Longview Client ${e.entity!.label} has been created.`,
  },
  longviewclient_delete: {
    notification: (e) => `Longview Client ${e.entity!.label} has been deleted.`,
  },
  // managed_disabled: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  longviewclient_update: {
    notification: (e) => `Longview Client ${e.entity!.label} has been updated.`,
  },
  // },
  managed_enabled: {
    notification: (e) => `Managed has been activated on your account.`,
  },
  managed_service_create: {
    notification: (e) => `Managed service ${e.entity!.label} has been created.`,
  },
  managed_service_delete: {
    notification: (e) => `Managed service ${e.entity!.label} has been deleted.`,
  },
  nodebalancer_config_create: {
    notification: (e) =>
      `A config on NodeBalancer ${e.entity!.label} has been created.`,
  },
  nodebalancer_config_delete: {
    notification: (e) =>
      `A config on NodeBalancer ${e.entity!.label} has been deleted.`,
  },
  nodebalancer_config_update: {
    notification: (e) =>
      `A config on NodeBalancer ${e.entity!.label} has been updated.`,
  },
  nodebalancer_create: {
    notification: (e) => `NodeBalancer ${e.entity!.label} has been created.`,
  },
  nodebalancer_delete: {
    notification: (e) => `NodeBalancer ${e.entity!.label} has been deleted.`,
  },
  nodebalancer_node_create: {
    notification: (e) =>
      `A node on NodeBalancer ${e.entity!.label} has been created.`,
  },
  nodebalancer_node_delete: {
    notification: (e) =>
      `A node on NodeBalancer ${e.entity!.label} has been deleted.`,
  },
  nodebalancer_node_update: {
    notification: (e) =>
      `A node on NodeBalancer ${e.entity!.label} has been updated.`,
  },
  nodebalancer_update: {
    notification: (e) => `NodeBalancer ${e.entity!.label} has been updated.`,
  },
  oauth_client_create: {
    notification: (e) => `OAuth App ${e.entity!.label} has been created.`,
  },
  oauth_client_delete: {
    notification: (e) => `OAuth App ${e.entity!.label} has been deleted.`,
  },
  oauth_client_secret_reset: {
    notification: (e) =>
      `Secret for OAuth App ${e.entity!.label} has been reset.`,
  },
  oauth_client_update: {
    notification: (e) => `OAuth App ${e.entity!.label} has been updated.`,
  },
  password_reset: {
    failed: (e) => `Password reset failed for Linode ${e.entity!.label}.`,
    finished: (e) => `Password has been reset on Linode ${e.entity!.label}.`,
    scheduled: (e) => `A password reset is scheduled for ${e.entity!.label}.`,
    started: (e) => `The password for ${e.entity!.label} is being reset.`,
  },
  payment_method_add: {
    notification: (e) => `A payment method was added.`,
  },
  payment_submitted: {
    notification: (e) => `A payment was successfully submitted.`,
  },
  profile_update: {
    notification: (e) => `Your profile has been updated.`,
  },
  stackscript_create: {
    notification: (e) => `StackScript ${e.entity!.label} has been created.`,
  },
  stackscript_delete: {
    notification: (e) => `StackScript ${e.entity!.label} has been deleted.`,
  },
  stackscript_publicize: {
    notification: (e) => `StackScript ${e.entity!.label} has been made public.`,
  },
  stackscript_revise: {
    notification: (e) => `StackScript ${e.entity!.label} has been revised.`,
  },
  stackscript_update: {
    notification: (e) => `StackScript ${e.entity!.label} has been updated.`,
  },
  subnet_create: {
    notification: (e) =>
      `Subnet ${e.entity!.label} has been created in VPC ${
        e.secondary_entity?.label
      }.`,
  },
  subnet_delete: {
    notification: (e) =>
      `Subnet ${e.entity!.label} has been deleted in VPC ${
        e.secondary_entity?.label
      }.`,
  },
  subnet_update: {
    notification: (e) =>
      `Subnet ${e.entity!.label} in VPC ${
        e.secondary_entity?.label
      } has been updated.`,
  },
  tag_create: {
    notification: (e) => `Tag ${e.entity!.label} has been created.`,
  },
  tag_delete: {
    notification: (e) => `Tag ${e.entity!.label} has been deleted.`,
  },
  tfa_disabled: {
    notification: (e) => `Two-factor authentication has been disabled.`,
  },
  tfa_enabled: {
    notification: (e) => `Two-factor authentication has been enabled.`,
  },
  ticket_attachment_upload: {
    notification: (e) =>
      `File has been successfully uploaded to support ticket ${
        e.entity!.label
      }`,
  },
  // ticket_reply: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  ticket_create: {
    notification: (e) => `New support ticket "${e.entity!.label}" created.`,
  },
  // },
  ticket_update: {
    notification: (e) =>
      `Support ticket "${e.entity!.label}" has been updated.`,
  },
  token_create: {
    notification: (e) => `Token ${e.entity!.label} has been created.`,
  },
  token_delete: {
    notification: (e) => `Token ${e.entity!.label} has been revoked.`,
  },
  token_update: {
    notification: (e) => `Token ${e.entity!.label} has been updated.`,
  },

  user_create: {
    notification: (e) => `User ${e.entity!.label} has been created.`,
  },
  user_delete: {
    notification: (e) => `User ${e.entity!.label} has been deleted.`,
  },
  user_ssh_key_add: {
    notification: (e) => `An SSH key has been added to your profile.`,
  },
  user_ssh_key_delete: {
    notification: (e) => `An SSH key has been removed from your profile.`,
  },
  user_ssh_key_update: {
    notification: (e) => `An SSH key on your profile has been updated.`,
  },
  user_update: {
    notification: (e) => `User ${e.entity!.label} has been updated.`,
  },
  volume_attach: {
    // @todo Once we have better events, display the name of the attached Linode
    failed: (e) => `Volume ${e.entity!.label} failed to attach.`,
    finished: (e) => `Volume ${e.entity!.label} has been attached.`,
    notification: (e) => `Volume ${e.entity!.label} has been attached.`,
    // in these messages.
    scheduled: (e) => `Volume ${e.entity!.label} is scheduled to be attached.`,
    started: (e) => `Volume ${e.entity!.label} is being attached.`,
  },
  volume_clone: {
    notification: (e) => `Volume ${e.entity!.label} has been cloned.`,
  },
  volume_create: {
    failed: (e) => `Creation of volume ${e.entity!.label} failed.`,
    finished: (e) => `Volume ${e.entity!.label} has been created.`,
    notification: (e) => `Volume ${e.entity!.label} has been created.`,
    scheduled: (e) => `Volume ${e.entity!.label} is scheduled for creation.`,
    started: (e) => `Volume ${e.entity!.label} is being created.`,
  },
  volume_delete: {
    failed: (e) => ``,
    finished: (e) => ``,
    notification: (e) => `Volume ${e.entity!.label} has been deleted.`,
    scheduled: (e) => ``,
    started: (e) => ``,
  },
  volume_detach: {
    // @todo Once we have better events, display the name of the attached Linode
    failed: (e) => `Volume ${e.entity!.label} failed to detach.`,
    finished: (e) => `Volume ${e.entity!.label} has been detached.`,
    notification: (e) => `Volume ${e.entity!.label} has been detached.`,
    // in these messages.
    scheduled: (e) => `Volume ${e.entity!.label} is scheduled for detachment.`,
    started: (e) => `Volume ${e.entity!.label} is being detached.`,
  },
  volume_migrate: {
    failed: (e) => `Volume ${e.entity!.label} failed to upgrade to NVMe.`,
    finished: (e) => `Volume ${e.entity!.label} has been upgraded to NVMe.`,
    started: (e) => `Volume ${e.entity!.label} is being upgraded to NVMe.`,
  },
  volume_migrate_scheduled: {
    scheduled: (e) =>
      `Volume ${e.entity!.label} has been scheduled for an upgrade to NVMe.`,
  },
  volume_resize: {
    notification: (e) => `Volume ${e.entity!.label} has been resized.`,
  },
  volume_update: {
    notification: (e) => `Volume ${e.entity!.label} has been updated.`,
  },
  vpc_create: {
    notification: (e) => `VPC ${e.entity!.label} has been created.`,
  },
  vpc_delete: {
    notification: (e) => `VPC ${e.entity!.label} has been deleted.`,
  },
  vpc_update: {
    notification: (e) => `VPC ${e.entity!.label} has been updated.`,
  },
};

export const formatEventWithAPIMessage = (e: Event) => {
  /**
   * It would be great to format this better, but:
   * 1. Action names include gotchas that prevent simple capitalization or trimming rules.
   * 2. Provided API messages *should* make it clear what action they're referring to,
   *    but we don't have such a guarantee.
   */
  return `${e.action}: ${e.message}`;
};

export const generateEventMessage = (e: Event): string => {
  const fn = path<EventMessageCreator>(
    [e.action, e.status],
    eventMessageCreators
  );

  /** we couldn't find the event in our list above */
  if (!fn) {
    /** log unknown events to the console */
    if (!isProductionBuild) {
      /* eslint-disable no-console */
      console.error('============================================');
      console.error('Unknown API Event Received');
      console.log(e);
      console.error('============================================');
    }

    /** finally return some default fallback text */
    return e.message
      ? formatEventWithAPIMessage(e)
      : `${e.action}${e.entity?.label ? ` on ${e.entity.label}` : ''}`;
  }

  let message = '';
  try {
    message = fn(e);
  } catch (error) {
    /** report our error to sentry */
    reportException('Known API Event Received with Error', {
      error,
      event_data: e,
    });
  }

  /** add the username to message; if it already contains the username, return the original message **/
  const messageWithUsername = formatEventWithUsername(
    e.action,
    e.username,
    message
  );

  /**
   * return either the formatted message or an empty string
   * fails gracefully if the message we encounter a formatting error
   * */
  try {
    const formattedMessage = applyLinking(e, messageWithUsername);
    return applyBolding(formattedMessage);
  } catch (error) {
    console.warn('Error with formatting the event message', {
      error,
      event_data: e,
    });

    reportException('Error with formatting the event message', {
      error,
      event_data: e,
    });

    return messageWithUsername;
  }
};

export function applyBolding(message: string) {
  if (!message) {
    return '';
  }

  const wordsToBold: string[] = [
    'added',
    'attached',
    'booted',
    'cloned',
    'created',
    'deleted',
    'detached',
    'disabled',
    'duplicated',
    'enabled',
    'failed',
    'migrated',
    'reboot',
    'rebooted',
    'rebuilt',
    'removed',
    'reset',
    'Resize',
    'resized',
    'revised',
    'revoked',
    'shut down',
    'updated',
    'Upgrade',
    'upgraded',
  ];

  let newMessage = message;

  for (const word of wordsToBold) {
    const regex = new RegExp(`\\b${word}\\b`);
    newMessage = newMessage.replace(
      // We use a RegExp with word boundary checks (\\b) to ensure we're replacing the exact word, not just a substring
      // This avoids situations where we used to get back 're**booted**' instead of **rebooted**, etc
      regex,
      `**${word}**`
    );
  }

  return newMessage;
}

export function applyLinking(event: Event, message: string) {
  if (!message) {
    return '';
  }

  const entityLinkTarget = getLinkForEvent(event.action, event.entity);
  const secondaryEntityLinkTarget = getLinkForEvent(
    event.action,
    event.secondary_entity
  );

  let newMessage = message;

  if (event.entity?.label && entityLinkTarget) {
    const label = event.entity.label;
    const nonTickedLabels = new RegExp(
      `(\\B|^|[^\`])${escapeRegExp(label)}(\\B|$|[^\`])`,
      'g'
    );

    newMessage = newMessage.replace(
      nonTickedLabels,
      ` <a href="${entityLinkTarget}">${label}</a> `
    );
  }

  if (event.secondary_entity?.label && secondaryEntityLinkTarget) {
    newMessage = newMessage.replace(
      event.secondary_entity.label,
      `<a href="${secondaryEntityLinkTarget}">${event.secondary_entity.label}</a>`
    );
  }

  return newMessage;
}
