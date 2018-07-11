import { append, compose, has, when } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  onEdit: () => void;
  onDelete?: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

class DomainRecordActionMenu extends React.Component<CombinedProps> {
  createActions = () => (closeMenu: Function): Action[] => compose<Action[], Action[], Action[]>(
    when(
      () => has('onDelete', this.props),
      append({
        title: 'Delete',
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          this.props.onDelete!();
          closeMenu();
          e.preventDefault();
        },
      }),
    ),
    append({
      title: 'Edit',
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        this.props.onEdit();
        closeMenu();
        e.preventDefault();
      },
    }),
  )([])
  render() {
    return (
      <ActionMenu createActions={this.createActions()} />
    );
  }
}

export default withRouter(DomainRecordActionMenu);
