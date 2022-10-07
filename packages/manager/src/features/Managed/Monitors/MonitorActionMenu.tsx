import { MonitorStatus } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { useSnackbar } from 'notistack';
import { splitAt } from 'ramda';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';
import {
  useDisableMonitorMutation,
  useEnableMonitorMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export interface Props {
  monitorID: number;
  status: MonitorStatus;
  label: string;
  openDialog: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
}

export const MonitorActionMenu: React.FC<Props> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));
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
      title: 'View Issue History',
      onClick: () => {
        openHistoryDrawer(monitorID, label);
      },
    },
    {
      title: 'Edit',
      onClick: () => {
        openMonitorDrawer(monitorID, 'edit');
      },
    },
    status === 'disabled'
      ? {
          title: 'Enable',
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
        }
      : {
          title: 'Disable',
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
        },
    {
      title: 'Delete',
      onClick: () => {
        openDialog(monitorID, label);
      },
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
              key={action.title}
              actionText={action.title}
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
