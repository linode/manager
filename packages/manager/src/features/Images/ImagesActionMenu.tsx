import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

export interface Handlers {
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (label: string, imageID: string) => void;
  [index: string]: any;
}

interface Props extends Handlers {
  description: string;
  label: string;
  id: string;
  event: Event;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class ImagesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onRestore,
      onDeploy,
      onEdit,
      onDelete,
      id,
      description,
      label
    } = this.props;

    return (closeMenu: Function): Action[] => {
      return [
        {
          title: 'Restore to Existing Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRestore(id);
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Deploy New Linode',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDeploy(id);
            e.preventDefault();
          }
        },
        {
          title: 'Edit',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            const desc = description ?? ' ';
            onEdit(label, desc, id);
            closeMenu();
            e.preventDefault();
          }
        },
        {
          title: 'Delete',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onDelete(label, id);
            closeMenu();
            e.preventDefault();
          }
        }
      ];
    };
  };

  render() {
    return (
      <ActionMenu
        createActions={this.createActions()}
        ariaLabel={`Action menu for Image ${this.props.label}`}
      />
    );
  }
}

export default withRouter(ImagesActionMenu);
