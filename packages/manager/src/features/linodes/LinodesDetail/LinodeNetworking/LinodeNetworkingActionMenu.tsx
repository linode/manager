import { IPAddress } from 'linode-js-sdk/lib/networking';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onView: () => void;
  onEdit?: (ip: IPAddress) => void;
  onRemove?: (ip: IPAddress) => void;
  ipType: IPTypes;
  ipAddress?: IPAddress;
  readOnly?: boolean;
}

export type IPTypes =
  | 'SLAAC'
  | 'Public'
  | 'Public Reserved'
  | 'Private Reserved'
  | 'Private'
  | 'Shared'
  | 'Link Local'
  | 'Range';

type CombinedProps = Props & RouteComponentProps<{}>;

class LinodeNetworkingActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onView,
      onEdit,
      onRemove,
      ipType,
      ipAddress,
      readOnly
    } = this.props;

    return (closeMenu: Function): Action[] => {
      const actions: Action[] = [
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
       * can only edit if we're not dealing with private IPs, link local, or reserved IPs
       */
      if (
        onEdit &&
        ipAddress &&
        ipType !== 'Private' &&
        ipType !== 'Link Local' &&
        ipType !== 'Public Reserved' &&
        ipType !== 'Private Reserved'
      ) {
        actions.push({
          title: 'Edit RDNS',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit(ipAddress);
            closeMenu();
            e.preventDefault();
          },
          disabled: readOnly,
          tooltip: readOnly
            ? "You don't have permissions to modify this Linode"
            : undefined
        });
      }

      if (onRemove && ipAddress && ipType === 'Public') {
        actions.push({
          title: 'Delete IP',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onRemove(ipAddress);
            closeMenu();
            e.preventDefault();
          },
          disabled: readOnly,
          tooltip: readOnly
            ? "You don't have permissions to modify this Linode"
            : undefined
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
