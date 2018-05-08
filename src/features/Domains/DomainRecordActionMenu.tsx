import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onEdit: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class DomainRecordActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => {
    return [
      {
        title: 'Edit',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.props.onEdit();
          closeMenu();
          e.preventDefault();
        },
      },
    ];
  }

  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(DomainRecordActionMenu);
