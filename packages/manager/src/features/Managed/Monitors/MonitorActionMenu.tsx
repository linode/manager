import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import {
  useDisableMonitorMutation,
  useEnableMonitorMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { splitAt } from 'src/utilities/splitAt';

import type { MonitorStatus } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface MonitorActionMenuProps {
  label: string;
  monitorID: number;
  openDialog: (id: number, label: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  status: MonitorStatus;
}

export const MonitorActionMenu = (props: MonitorActionMenuProps) => {
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();

  const {
    label,
    monitorID,
    openDialog,
    openHistoryDrawer,
    openMonitorDrawer,
    status,
  } = props;

  const { mutateAsync: enableServiceMonitor } = useEnableMonitorMutation(
    monitorID
  );
  const { mutateAsync: disableServiceMonitor } = useDisableMonitorMutation(
    monitorID
  );

  const handleError = (message: string, error: APIError[]) => {
    const errMessage = getAPIErrorOrDefault(error, message);
    enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
  };

  const actions: Action[] = [
    {
      onClick: () => {
        openHistoryDrawer(monitorID, label);
      },
      title: 'View Issue History',
    },
    {
      onClick: () => {
        openMonitorDrawer(monitorID, 'edit');
      },
      title: 'Edit',
    },
    status === 'disabled'
      ? {
          onClick: () => {
            enableServiceMonitor()
              .then(() => {
                enqueueSnackbar('Monitor enabled successfully.', {
                  variant: 'success',
                });
              })
              .catch((e) => {
                handleError('Error enabling this Service Monitor.', e);
              });
          },
          title: 'Enable',
        }
      : {
          onClick: () => {
            disableServiceMonitor()
              .then(() => {
                enqueueSnackbar('Monitor disabled successfully.', {
                  variant: 'success',
                });
              })
              .catch((e) => {
                handleError('Error disabling this Service Monitor.', e);
              });
          },
          title: 'Disable',
        },
    {
      onClick: () => {
        openDialog(monitorID, label);
      },
      title: 'Delete',
    },
  ];

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Monitor ${props.label}`}
      />
    </>
  );
};

export default MonitorActionMenu;
