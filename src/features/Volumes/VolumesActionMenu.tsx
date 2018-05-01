import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onShowConfig: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class VolumesActionMenu extends React.Component<CombinedProps> {
  createActions = () => {
    const {
      onShowConfig,
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
      ];
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
