import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  linodeStatus: string;
  linodeId?: number;
  readOnly?: boolean;
  onRename: () => void;
  onResize: () => void;
  onImagize: () => void;
  onDelete: () => void;
}

type CombinedProps = Props & RouteComponentProps;

class DiskActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    const { linodeStatus, linodeId, readOnly, history } = this.props;
    let tooltip;
    tooltip =
      linodeStatus === 'offline'
        ? undefined
        : 'Your Linode must be fully powered down in order to perform this action';
    tooltip = readOnly
      ? "You don't have permissions to perform this action"
      : tooltip;
    const disabledProps = tooltip
      ? {
          tooltip,
          disabled: true
        }
      : {};
    const actions = [
      {
        title: 'Rename',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onRename();
          closeMenu();
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Resize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onResize();
          closeMenu();
        },
        ...disabledProps
      },
      {
        title: 'Imagize',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onImagize();
          closeMenu();
        },
        ...(readOnly ? disabledProps : {})
      },
      {
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          this.props.onDelete();
          closeMenu();
        },
        ...disabledProps
      },
      {
        title: 'Clone',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          e.preventDefault();
          closeMenu();
          history.push(`/linodes/${linodeId}/clone/disks`);
        },
        disabled: readOnly,
        tooltip
      }
    ];

    return actions;
  };

  render() {
    return <ActionMenu createActions={this.createActions()} />;
  }
}

export default withRouter(DiskActionMenu);
