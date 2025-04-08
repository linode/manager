import { splitAt } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import {
  useDisableMonitorMutation,
  useEnableMonitorMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { MonitorStatus } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

export interface MonitorActionMenuProps {
  label: string;
  monitorId: number;
  status: MonitorStatus;
}

export const MonitorActionMenu = (props: MonitorActionMenuProps) => {
  const theme = useTheme();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { monitorId, status } = props;

  const { mutateAsync: enableServiceMonitor } = useEnableMonitorMutation(
    monitorId
  );
  const { mutateAsync: disableServiceMonitor } = useDisableMonitorMutation(
    monitorId
  );

  const handleError = (message: string, error: APIError[]) => {
    const errMessage = getAPIErrorOrDefault(error, message);
    enqueueSnackbar(errMessage[0].reason, { variant: 'error' });
  };

  const actions: Action[] = [
    {
      onClick: () => {
        navigate({
          params: { monitorId },
          to: `/managed/monitors/$monitorId/issues`,
        });
      },
      title: 'View Issue History',
    },
    {
      onClick: () => {
        navigate({
          params: { monitorId },
          to: `/managed/monitors/$monitorId/edit`,
        });
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
        navigate({
          params: { monitorId },
          to: `/managed/monitors/$monitorId/delete`,
        });
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
