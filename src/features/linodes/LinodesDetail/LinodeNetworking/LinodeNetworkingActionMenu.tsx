import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onView: () => void;
  onEdit?: (ip: Linode.IPAddress) => void;
  onRemove?: (ip: Linode.IPAddress) => void;
  ipType: IPTypes;
  ipAddress?: Linode.IPAddress;
}

export type IPTypes =
  | 'SLAAC'
  | 'Public'
  | 'Private'
  | 'Shared'
  | 'Link Local'
  | 'Range';

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeNetworkingActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const { onView, onEdit, onRemove, ipType, ipAddress } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions = [
        {
          title: 'View',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onView();
            closeMenu();
            e.preventDefault();
          }
        }
      ];

      /**
       * can only edit if we're not dealing with
       * either a private IP or Link Local IP
       */
      if (
        onEdit &&
        ipAddress &&
        ipType !== 'Private' &&
        ipType !== 'Link Local'
      ) {
        actions.push({
          title: 'Edit RDNS',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit(ipAddress);
            closeMenu();
            e.preventDefault();
          }
        });
      }

      if (onRemove && ipAddress && ipType === 'Public') {
        actions.push({
          title: 'Delete IP',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRemove(ipAddress);
            closeMenu();
            e.preventDefault();
          }
        });
      }

      return actions;
    };
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default withRouter(LinodeNetworkingActionMenu);
