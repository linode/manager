import { path } from 'ramda';
import { nonClickEvents } from 'src/constants';
import {
  EntityType,
  getEntityByIDFromStore
} from 'src/utilities/getEntityByIDFromStore';

export default (
  action: Linode.EventAction,
  entity: null | Linode.Entity,
  deleted: undefined | string | boolean,
  onClick: (path: string) => void
) => {
  const type = path(['type'], entity);
  const id = path(['id'], entity);
  const label = path(['label'], entity);

  if (['disk_delete', 'linode_config_delete'].includes(action)) {
    /**
     * Special cases that are handled here above the deletion logic;
     * although these are deletion events, they refer to a Linode,
     * which still exists; we can therefore provide a link target.
     */
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClick(`/linodes/${id}/advanced`);
    };
  }

  if (['user_ssh_key_add', 'user_ssh_key_delete'].includes(action)) {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClick(`/profile/keys`);
    };
  }

  if (['account_settings_update'].includes(action)) {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onClick(`/account/settings`);
    };
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

  switch (type) {
    case 'linode':
      const link =
        action === 'linode_addip'
          ? `/linodes/${id}/networking`
          : `/linodes/${id}`;
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(link);
      };

    case 'ticket':
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(`/support/tickets/${id}`);
      };

    case 'domain':
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(`/domains/${id}`);
      };

    case 'volume':
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(`/volumes`);
      };

    case 'stackscript':
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(`/stackscripts/${id}`);
      };

    case 'nodebalancer':
      switch (action) {
        case 'nodebalancer_config_create':
          return (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            onClick(`/nodebalancers/${id}/configurations`);
          };

        default:
          return (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            onClick(`/nodebalancers/${id}/summary`);
          };
      }

    case 'community_question':
      return () => {
        window.open(entity!.url, '_blank');
      };

    case 'community_like':
      return () => {
        window.open(entity!.url, '_blank');
      };

    case 'user':
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(`/account/users/${label}/profile`);
      };

    default:
      return;
  }
};

export const getLinkTargets = (entity: Linode.Entity | null) => {
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
