import { toast } from '@akamai/cds-components/notification-toast';
import { Icon, Menu, MenuItem, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useResumeDatabaseMutation } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';

import { useIsDatabasesEnabled } from '../utilities';

import type { Action } from '../shared/types';
import type { DatabaseStatus, Engine } from '@linode/api-v4';
import type { ActionType } from 'src/features/Account/utils';

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

  const navigate = useNavigate();

  const handleResume = async () => {
    try {
      await resumeDatabase();
      return toast.open({
        text: 'Database Cluster resumed successfully.',
        type: 'success',
      });
    } catch (e: any) {
      const error = getAPIErrorOrDefault(
        e,
        'There was an error resuming this Database Cluster.'
      )[0].reason;
      return toast.open({ text: error, type: 'error' });
    }
  };

  const isDatabaseReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'database',
    id: databaseId,
  });

  const getTooltipText = (action: ActionType) => {
    return isDatabaseReadOnly
      ? getRestrictedResourceText({
          action,
          isSingular: true,
          resourceType: 'Databases',
        })
      : undefined;
  };

  const actions: Action[] = [
    {
      disabled:
        isDatabaseNotRunning || isDatabaseSuspended || isDatabaseReadOnly,
      onClick: handlers.handleManageAccessControls,
      title: 'Manage Access Controls',
      tooltip: getTooltipText('edit'),
    },
    {
      disabled:
        isDatabaseNotRunning || isDatabaseSuspended || isDatabaseReadOnly,
      onClick: handlers.handleResetPassword,
      title: 'Reset Root Password',
      tooltip: getTooltipText('edit'),
    },
    {
      disabled:
        isDatabaseNotRunning || isDatabaseSuspended || isDatabaseReadOnly,
      onClick: () => {
        navigate({
          to: `/databases/$engine/$databaseId/resize`,
          params: {
            engine: databaseEngine,
            databaseId,
          },
        });
      },
      title: 'Resize',
      tooltip: getTooltipText('resize'),
    },
    {
      disabled: isDatabaseNotRunning || isDatabaseReadOnly,
      onClick: handlers.handleDelete,
      title: 'Delete',
      tooltip: getTooltipText('delete'),
    },
  ];

  if (isDatabasesV2GA) {
    actions.unshift({
      disabled: databaseStatus !== 'active' || isDatabaseReadOnly,
      onClick: () => {
        handlers.handleSuspend();
      },
      title: 'Suspend',
      tooltip: getTooltipText('suspend'),
    });

    actions.splice(4, 0, {
      disabled: !isDatabaseSuspended || isDatabaseReadOnly,
      onClick: () => {
        handleResume();
      },
      title: 'Resume',
      tooltip: getTooltipText('resume'),
    });
  }

  return (
    <Menu
      aria-label={`Action menu for Database ${databaseLabel}`}
      data-testid="database-action-menu"
      icon="actions"
      position="bottom-right"
    >
      {actions.map((action) => (
        <MenuItem
          data-testid={action.title}
          disabled={action.disabled}
          key={action.title}
          onSelect={action.onClick}
          style={{
            minWidth: '210px',
            paddingRight: Spacing.S4,
          }}
          title={action.title}
          value={action.title}
        >
          <span
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              minWidth: '210px',
            }}
          >
            {action.title}
            {action.disabled && action.tooltip ? (
              <Tooltip
                disabled={!action.disabled}
                key={action.title}
                noArrow={true}
                style={{ textAlign: 'left', whiteSpace: 'normal' }}
                tooltipPlacement="left"
                tooltipText={action.tooltip}
              >
                <Icon icon="info-outline" size="m" />
              </Tooltip>
            ) : null}
          </span>
        </MenuItem>
      ))}
    </Menu>
  );
};
