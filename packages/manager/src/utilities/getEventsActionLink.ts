import { Entity, EventAction } from '@linode/api-v4/lib/account';
import { nonClickEvents } from 'src/constants';
import {
  EntityType,
  getEntityByIDFromStore,
} from 'src/utilities/getEntityByIDFromStore';

export const getEngineFromDatabaseEntityURL = (url: string) => {
  return url.match(/databases\/(\w*)\/instances/i)?.[1];
};

export default (
  action: EventAction,
  entity: null | Entity,
  deleted: undefined | string | boolean
) => {
  const type = entity?.type;
  const id = entity?.id;
  const label = entity?.label;

  if (action.match(/community/gi)) {
    return entity!.url;
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
  if (action.includes('_delete') || deleted) {
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

  switch (type) {
    case 'linode':
      return action === 'linode_addip'
        ? `/linodes/${id}/networking`
        : `/linodes/${id}`;

    case 'ticket':
      return `/support/tickets/${id}`;

    case 'domain':
      return `/domains/${id}`;

    case 'entity_transfer':
      return `/account/service-transfers`;

    case 'volume':
      return `/volumes`;

    case 'stackscript':
      return `/stackscripts/${id}`;

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
        entity!.url
      )}/${id}/summary`;

    case 'user':
      return `/account/users/${label}/profile`;

    default:
      return;
  }
};

export const getLinkTargets = (entity: Entity | null) => {
  if (entity === null) {
    return null;
  }

  const entityInStore = getEntityByIDFromStore(
    entity.type as EntityType,
    entity.id
  );
  /**
   * If the entity doesn't exist in the store, don't link to it
   * as it is probably an old ticket re: an entity that
   * has since been deleted.
   */
  if (!entityInStore) {
    return null;
  }

  switch (entity.type) {
    case 'linode':
      return `/linodes/${entity.id}`;
    case 'domain':
      return `/domains/${entity.id}`;
    case 'nodebalancer':
      return `/nodebalancers/${entity.id}`;
    case 'longview':
      return '/longview';
    case 'volume':
      return '/volumes';
    default:
      return '';
  }
};
