import { path } from 'ramda';

export default (
  action: Linode.EventAction,
  entity: null | Linode.Entity,
  deleted: undefined | string | boolean,
  onClick: (path: string) => void
) => {
  const type = path(['type'], entity);
  const id = path(['id'], entity);

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

  /** We require these bits of information to provide a link. */
  if (!type || !id) {
    return;
  }

  switch (type) {
    case 'linode':
      return (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onClick(`/linodes/${id}`);
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

    default:
      return;
  }
};

export const getLinkTargets = (entity: Linode.Entity | null) => {
  if (entity === null) {
    return '';
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
