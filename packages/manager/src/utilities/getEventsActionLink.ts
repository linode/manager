import { nonClickEvents } from 'src/constants';

import type { Entity, EventAction } from '@linode/api-v4/lib/account';

export const getEngineFromDatabaseEntityURL = (url: string) => {
  return url.match(/databases\/(\w*)\/instances/i)?.[1];
};

export const getRegionFromObjectStorageEntityURL = (url: string) => {
  return url.match(/\/buckets\/([^/]+)/)?.[1];
};

export const getLinkForEvent = (action: EventAction, entity: Entity | null) => {
  const type = entity?.type;
  const id = entity?.id;
  const label = entity?.label;

  if (action.startsWith('community')) {
    return entity?.url;
  }

  if (['disk_delete', 'linode_config_delete'].includes(action)) {
    /**
     * Special cases that are handled here above the deletion logic;
     * although these are deletion events, they refer to a Linode,
     * which still exists; we can therefore provide a link target.
     */
    return `/linodes/${id}/advanced`;
  }

  if (['user_ssh_key_add', 'user_ssh_key_delete'].includes(action)) {
    return `/profile/keys`;
  }

  if (['account_settings_update'].includes(action)) {
    return `/account/settings`;
  }

  /**
   * If we have a deletion event or an event that is marked as referring to a deleted entity
   * we don't want a clickable action.
   */
  if (action.includes('_delete')) {
    return;
  }

  /**
   * Some events have entities etc. but we don't want them to
   * link anywhere.
   */
  if (nonClickEvents.includes(action)) {
    return;
  }

  /** We require these bits of information to provide a link. */
  if (!type || !id) {
    return;
  }

  if (action === 'disk_imagize') {
    return `/images`;
  }

  if (['backups_enable', 'linode_snapshot'].includes(action)) {
    return `/linodes/${id}/backup`;
  }

  switch (type) {
    case 'domain':
      return `/domains/${id}`;

    case 'entity_transfer':
      return `/account/service-transfers`;

    case 'firewall':
      return `/firewalls/${id}`;

    case 'linode':
      return action === 'linode_addip'
        ? `/linodes/${id}/networking`
        : `/linodes/${id}`;

    case 'lkecluster':
      return `/kubernetes/clusters/${id}`;

    case 'nodebalancer':
      // eslint-disable-next-line sonarjs/no-small-switch
      switch (action) {
        case 'nodebalancer_config_create':
          return `/nodebalancers/${id}/configurations`;

        default:
          return `/nodebalancers/${id}/summary`;
      }

    case 'database':
      return `/databases/${getEngineFromDatabaseEntityURL(
        entity?.url
      )}/${id}/summary`;

    case 'placement_group':
      return `/placement-groups/${id}`;

    case 'stackscript':
      return `/stackscripts/${id}`;

    case 'ticket':
      return `/support/tickets/${id}`;

    case 'user':
      return `/account/users/${label}/profile`;

    case 'volume':
      return `/volumes`;

    case 'vpc':
      return `/vpcs/${id}`;

    default:
      return;
  }
};

export const getLinkTargets = (entity: Entity | null) => {
  if (entity === null) {
    return null;
  }

  switch (entity.type) {
    case 'database':
      return `/databases/${getEngineFromDatabaseEntityURL(entity.url)}/${
        entity.id
      }/summary`;
    case 'domain':
      return `/domains/${entity.id}`;
    case 'firewall':
      return `/firewalls/${entity.id}`;
    case 'image':
      return '/images';
    case 'linode':
      return `/linodes/${entity.id}`;
    case 'lkecluster':
      return `/kubernetes/clusters/${entity.id}`;
    case 'longview':
      return '/longview';
    case 'nodebalancer':
      return `/nodebalancers/${entity.id}`;
    case 'object_storage_bucket':
      return `/object-storage/buckets/${getRegionFromObjectStorageEntityURL(
        entity.url
      )}/${entity.label}`;
    case 'placement_group':
      return `/placement-groups/${entity.id}`;
    case 'stackscript':
      return `/stackscripts/${entity.id}`;
    case 'volume':
      return '/volumes';
    case 'vpc':
      return `/vpcs/${entity.id}`;
    default:
      return null;
  }
};
