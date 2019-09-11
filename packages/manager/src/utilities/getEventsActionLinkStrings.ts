import { Entity, EventAction } from 'linode-js-sdk/lib/account';
import { path } from 'ramda';
import { nonClickEvents } from 'src/constants';

export default (
  action: EventAction,
  entity: null | Entity,
  deleted: undefined | string | boolean
) => {
  const type = path(['type'], entity);
  const id = path(['id'], entity);
  const label = path(['label'], entity);

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

  if (action === 'linode_addip') {
    return `/linodes/${id}/networking`;
  }

  /**
   * Some events have entities etc. but we don't want them to
   * link anywhere.
   */
  if (nonClickEvents.includes(action)) {
    return;
  }

  /**
   * If we have a deletion event or an event that is marked as referring to a deleted entity
   * we don't want a clickable action.
   */
  if (action.includes('_delete') || deleted) {
    return;
  }

  /** We require these bits of information to provide a link. */
  if (!type || !id) {
    return;
  }

  /**
   * Images and their events are the bane of our existence.
   * If these events ever start returning the ID of the actual
   * Image, we can link to it. But linking to the Linode that
   * the imagized disk was imagized from, which is what we
   * would do by default, is too confusing. Just don't link.
   */

  if (action === 'disk_imagize') {
    return;
  }

  switch (type) {
    case 'linode':
      return `/linodes/${id}`;

    case 'ticket':
      return `/support/tickets/${id}`;

    case 'domain':
      return `/domains/${id}`;

    case 'volume':
      return `/volumes`;

    case 'stackscript':
      return `/stackscripts/${id}`;

    case 'nodebalancer':
      switch (action) {
        case 'nodebalancer_config_create':
          return `/nodebalancers/${id}/configurations`;

        default:
          return `/nodebalancers/${id}/summary`;
      }

    case 'user':
      return `/account/users/${label}/profile`;

    default:
      return;
  }
};
