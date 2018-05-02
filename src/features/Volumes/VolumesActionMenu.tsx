import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onShowConfig: () => void;
  onEdit: () => void;
  onResize: () => void;
  attached: boolean;
  onAttachment: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class VolumesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onShowConfig,
      onEdit,
      onResize,
      attached,
      onAttachment,
    } = this.props;

    return function (closeMenu: Function): Action[] {
      const actions = [
        {
          title: 'Show Configuration',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onShowConfig();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Edit Label',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onEdit();
            closeMenu();
            e.preventDefault();
          },
        },
        {
          title: 'Resize',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onResize();
            closeMenu();
            e.preventDefault();
          },
        },
      ];

      if (!attached) {
        actions.push({
          title: 'Attachment',
          onClick: (e: React.MouseEvent<HTMLElement>) => {
            onAttachment();
            closeMenu();
            e.preventDefault();
          },
        });
      }


      return actions;
    };
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(VolumesActionMenu);
