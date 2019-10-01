import { DomainStatus } from 'linode-js-sdk/lib/domains';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';
import { sendDomainStatusChangeEvent } from 'src/utilities/ga';

export interface Handlers {
  onRemove: (domain: string, id: number) => void;
  onDisableOrEnable: (
    status: 'enable' | 'disable',
    domain: string,
    id: number
  ) => void;
  onClone: (domain: string, id: number) => void;
  onEdit: (domain: string, id: number) => void;
}

interface Props extends Handlers {
  type: 'master' | 'slave';
  domain: string;
  id: number;
  status: DomainStatus;
}

type CombinedProps = RouteComponentProps<any> & Props;

export class DomainActionMenu extends React.Component<CombinedProps> {
  goToDomain = () => {
    this.props.history.push(`/domains/${this.props.id}`);
  };

  handleRemove = () => {
    const { domain, id, onRemove } = this.props;
    onRemove(domain, id);
  };

  handleEdit = () => {
    const { domain, id, onEdit } = this.props;
    onEdit(domain, id);
  };

  handleClone = () => {
    const { domain, id, onClone } = this.props;
    onClone(domain, id);
  };

  createActions = () => (closeMenu: Function): Action[] => {
    const baseActions = [
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.handleEdit();
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Check Zone',
        tooltip:
          "Currently we don't support this action but will in the future.",
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Zone File',
        tooltip:
          "Currently we don't support this action but will in the future.",
        disabled: true,
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.handleClone();
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: this.props.status === 'active' ? 'Disable' : 'Enable',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          const actionToTake =
            this.props.status === 'active' ? 'disable' : 'enable';
          this.props.onDisableOrEnable(
            actionToTake,
            this.props.domain,
            this.props.id
          );
          if (actionToTake === 'enable') {
            /**
             * disabling opens a dialog modal, so don't send the event
             * for when the user is disabling
             */
            sendDomainStatusChangeEvent('Enable');
          }
          closeMenu();
          e.preventDefault();
        }
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.handleRemove();
          closeMenu();
          e.preventDefault();
        }
      }
    ];

    if (this.props.type === 'master') {
      return [
        {
          title: 'Edit DNS Records',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.goToDomain();
            closeMenu();
            e.preventDefault();
          }
        },
        ...baseActions
      ];
    } else {
      return [...baseActions];
    }
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default withRouter(DomainActionMenu);
