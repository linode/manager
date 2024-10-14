import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Engine } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  databaseEngine: Engine;
  databaseId: number;
  databaseLabel: string;
  handlers: ActionHandlers;
}

export interface ActionHandlers {
  handleDelete: () => void;
  handleManageAccessControls: () => void;
  handleResetPassword: () => void;
}

export const DatabaseActionMenu = (props: Props) => {
  const { databaseEngine, databaseId, databaseLabel, handlers } = props;

  const databaseStatus = 'running';
  const isDatabaseNotRunning = databaseStatus !== 'running';

  const history = useHistory();

  const actions: Action[] = [
    // TODO: add suspend action menu item once it's ready
    // {
    //   onClick: () => {},
    //   title: databaseStatus === 'running' ? 'Suspend' : 'Power On',
    // },
    {
      disabled: isDatabaseNotRunning,
      onClick: handlers.handleManageAccessControls,
      title: 'Manage Access Controls',
    },
    {
      disabled: isDatabaseNotRunning,
      onClick: handlers.handleResetPassword,
      title: 'Reset Root Password',
    },
    {
      disabled: isDatabaseNotRunning,
      onClick: () => {
        history.push({
          pathname: `/databases/${databaseEngine}/${databaseId}/resize`,
        });
      },
      title: 'Resize',
    },
    {
      disabled: isDatabaseNotRunning,
      onClick: handlers.handleDelete,
      title: 'Delete',
    },
  ];

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Database ${databaseLabel}`}
    />
  );
};
