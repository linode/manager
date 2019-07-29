import { path } from 'ramda';
import { nonClickEvents } from 'src/constants';
import {
  EntityType,
  getEntityByIDFromStore
} from 'src/utilities/getEntityByIDFromStore';

const emptyHandler = { href: undefined, onClick: undefined };
export interface EventHandler {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  href?: string;
}

const generateOnClick = (url: string, fn: (e: any) => void) => {
  return (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    fn(url);
  };
};

export default (
  action: Linode.EventAction,
  entity: null | Linode.Entity,
  deleted: undefined | string | boolean,
  onClick: (path: string) => void
): EventHandler => {
  let href: string;
  let _onClick: (e: React.MouseEvent<HTMLElement>) => void;

  const type = path(['type'], entity);
  const id = path(['id'], entity);
  const label = path(['label'], entity);

  if (['disk_delete', 'linode_config_delete'].includes(action)) {
    /**
     * Special cases that are handled here above the deletion logic;
     * although these are deletion events, they refer to a Linode,
     * which still exists; we can therefore provide a link target.
     */
    href = `/linodes/${id}/advanced`;
    _onClick = generateOnClick(href, onClick);
    return { href, onClick: _onClick };
  }

  if (['user_ssh_key_add', 'user_ssh_key_delete'].includes(action)) {
    href = `/profile/keys`;
    _onClick = generateOnClick(href, onClick);
    return { href, onClick: _onClick };
  }

  if (['account_settings_update'].includes(action)) {
    href = `/account/settings`;
    _onClick = generateOnClick(href, onClick);
    return { href, onClick: _onClick };
  }

  /**
   * If we have a deletion event or an event that is marked as referring to a deleted entity
   * we don't want a clickable action.
   */
  if (action.includes('_delete') || deleted) {
    return emptyHandler;
  }

  /**
   * Some events have entities etc. but we don't want them to
   * link anywhere.
   */
  if (nonClickEvents.includes(action)) {
    return emptyHandler;
  }

  /** We require these bits of information to provide a link. */
  if (!type || !id) {
    return emptyHandler;
  }

  /**
   * Images and their events are the bane of our existence.
   * If these events ever start returning the ID of the actual
   * Image, we can link to it. But linking to the Linode that
   * the imagized disk was imagized from, which is what we
   * would do by default, is too confusing. Just don't link.
   */

  if (action === 'disk_imagize') {
    return emptyHandler;
  }

  switch (type) {
    case 'linode':
      href =
        action === 'linode_addip'
          ? `/linodes/${id}/networking`
          : `/linodes/${id}`;
      _onClick = generateOnClick(href, onClick);
      return { href, onClick: _onClick };

    case 'ticket':
      href = `/support/tickets/${id}`;
      _onClick = generateOnClick(href, onClick);
      return { href, onClick: _onClick };

    case 'domain':
      href = `/domains/${id}`;
      _onClick = generateOnClick(href, onClick);
      return { href, onClick: _onClick };

    case 'volume':
      href = `/volumes`;
      _onClick = generateOnClick(href, onClick);
      return { href, onClick: _onClick };

    case 'stackscript':
      href = `/stackscripts/${id}`;
      _onClick = generateOnClick(href, onClick);
      return { href, onClick: _onClick };

    case 'nodebalancer':
      switch (action) {
        case 'nodebalancer_config_create':
          href = `/nodebalancers/${id}/configurations`;
          _onClick = generateOnClick(href, onClick);
          return { href, onClick: _onClick };

        default:
          href = `/nodebalancers/${id}/summary`;
          _onClick = generateOnClick(href, onClick);
          return { href, onClick: _onClick };
      }

    case 'community_question':
      _onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        window.open(entity!.url, '_blank');
      };
      return { href: entity!.url, onClick: _onClick };

    case 'community_like':
      _onClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        window.open(entity!.url, '_blank');
      };
      return { href: entity!.url, onClick: _onClick };

    case 'user':
      href = `/account/users/${label}/profile`;
      _onClick = generateOnClick(href, onClick);
      return { href, onClick: _onClick };

    default:
      return emptyHandler;
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
