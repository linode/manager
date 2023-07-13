import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import type { Route } from '@linode/api-v4/lib/aglb/types';

export interface RouteActionHandlers {
  onEdit: (route: Route) => void;
  onDelete: (route: Route) => void;
}

interface Props extends RouteActionHandlers {
  route: Route;
}

interface ExtendedAction extends Action {
  className?: string;
}

type CombinedProps = Props & RouteActionHandlers;

export const RouteActionMenu = React.memo((props: CombinedProps) => {
  const { route, onEdit, onDelete } = props;

  const actions = [
    {
      title: 'Edit',
      onClick: () => {
        onEdit(route);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        onDelete(route);
      },
    },
  ] as ExtendedAction[];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Route ${route.label}`}
    />
  );
});
