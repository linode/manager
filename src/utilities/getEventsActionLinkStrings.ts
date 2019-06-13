import { path } from 'ramda';

export default (
  action: Linode.EventAction,
  entity: null | Linode.Entity,
  deleted: undefined | string | boolean
) => {
  const type = path(['type'], entity);
  const id = path(['id'], entity);

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

  /** We require these bits of information to provide a link. */
  if (!type || !id) {
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

    case 'community_question':
      return entity!.url;

    case 'community_like':
      return entity!.url;

    default:
      return;
  }
};
