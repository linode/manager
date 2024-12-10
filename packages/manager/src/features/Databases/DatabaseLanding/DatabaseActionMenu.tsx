import { enqueueSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { useResumeDatabaseMutation } from 'src/queries/databases/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { useIsDatabasesEnabled } from '../utilities';

import type { DatabaseStatus, Engine } from '@linode/api-v4';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  databaseEngine: Engine;
  databaseId: number;
  databaseLabel: string;
  databaseStatus: DatabaseStatus;
  handlers: ActionHandlers;
}

export interface ActionHandlers {
  handleDelete: () => void;
  handleManageAccessControls: () => void;
  handleResetPassword: () => void;
  handleSuspend: () => void;
}

export const DatabaseActionMenu = (props: Props) => {
  const {
    databaseEngine,
    databaseId,
    databaseLabel,
    databaseStatus,
    handlers,
  } = props;

  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  const { mutateAsync: resumeDatabase } = useResumeDatabaseMutation(
    databaseEngine,
    databaseId
  );

  const status = 'running';
  const isDatabaseNotRunning = status !== 'running';
  const isDatabaseSuspended =
    databaseStatus === 'suspended' || databaseStatus === 'suspending';

  const history = useHistory();

  const handleResume = async () => {
    try {
      await resumeDatabase();
      return enqueueSnackbar('Database Cluster resumed successfully.', {
        variant: 'success',
      });
    } catch (e: any) {
      const error = getAPIErrorOrDefault(
        e,
        'There was an error resuming this Database Cluster.'
      )[0].reason;
      return enqueueSnackbar(error, { variant: 'error' });
    }
  };

  const actions: Action[] = [
    {
      disabled: isDatabaseNotRunning || isDatabaseSuspended,
      onClick: handlers.handleManageAccessControls,
      title: 'Manage Access Controls',
    },
    {
      disabled: isDatabaseNotRunning || isDatabaseSuspended,
      onClick: handlers.handleResetPassword,
      title: 'Reset Root Password',
    },
    {
      disabled: isDatabaseNotRunning || isDatabaseSuspended,
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

  if (isDatabasesV2GA) {
    actions.unshift({
      disabled: databaseStatus !== 'active',
      onClick: () => {
        handlers.handleSuspend();
      },
      title: 'Suspend',
    });

    actions.splice(4, 0, {
      disabled: !isDatabaseSuspended,
      onClick: () => {
        handleResume();
      },
      title: 'Resume',
    });
  }

  return (
    <ActionMenu
      actionsList={actions}
      ariaLabel={`Action menu for Database ${databaseLabel}`}
    />
  );
};
