import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onRemove: (domain: string, id: number) => void;
  onClone: (domain: string, id: number) => void;
  onEdit: (domain: string, id: number) => void;
  type: 'master' | 'slave';
  domain: string;
  id: number;
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
