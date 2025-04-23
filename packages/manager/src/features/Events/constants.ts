import type { Event, EventAction } from '@linode/api-v4';

export const ACTIONS_TO_INCLUDE_AS_PROGRESS_EVENTS: Event['action'][] = [
  'linode_resize',
  'linode_migrate',
  'linode_migrate_datacenter',
  'disk_imagize',
  'linode_boot',
  'host_reboot',
  'lassie_reboot',
  'linode_reboot',
  'linode_shutdown',
  'linode_delete',
  'linode_clone',
  'disk_resize',
  'disk_duplicate',
  'backups_restore',
  'linode_snapshot',
  'linode_mutate',
  'linode_rebuild',
  'linode_create',
  'image_upload',
  'volume_migrate',
  'database_resize',
];

export const ACTIONS_WITHOUT_USERNAMES: EventAction[] = [
  'entity_transfer_accept',
  'entity_transfer_accept_recipient',
  'entity_transfer_cancel',
  'entity_transfer_create',
  'entity_transfer_fail',
  'entity_transfer_stale',
  'lassie_reboot',
  'community_like',
  'community_mention',
  'community_question_reply',
];

/**
 * This is our base filter for GETing /v4/account/events.
 *
 * We exclude `profile_update` events because they are generated
 * often (by updating user preferences for example) and we don't
 * need them.
 *
 * @readonly Do not modify this object
 */
export const EVENTS_LIST_FILTER = Object.freeze({
  action: { '+neq': 'profile_update' },
});
