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

class LinodeActionMenu extends React.Component<CombinedProps> {
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
    if (this.props.type === 'slave') {
      return [
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
          disabled: true,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Zone File',
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
          title: 'Remove',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleRemove();
            closeMenu();
            e.preventDefault();
          }
        }
      ];
    } else {
      return [
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.handleEdit();
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Edit DNS Records',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            this.goToDomain();
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Check Zone',
          disabled: true,
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Zone File',
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
    }
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default withRouter(LinodeActionMenu);
