import { splitAt } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { sendEvent } from 'src/utilities/analytics/utils';

import type { Disk, Linode } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  disk: Disk;
  linodeId: number;
  linodeStatus: Linode['status'];
  onDelete: () => void;
  onRename: () => void;
  onResize: () => void;
  readOnly?: boolean;
}

export const LinodeDiskActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const {
    disk,
    linodeId,
    linodeStatus,
    onDelete,
    onRename,
    onResize,
    readOnly,
  } = props;

  const poweredOnTooltip =
    linodeStatus !== 'offline'
      ? 'Your Linode must be fully powered down in order to perform this action'
      : undefined;

  const swapTooltip =
    disk.filesystem == 'swap'
      ? 'You cannot create images from Swap images.'
      : undefined;

  const actions: Action[] = [
    {
      disabled: readOnly,
      onClick: onRename,
      title: 'Rename',
    },
    {
      disabled: linodeStatus !== 'offline' || readOnly,
      onClick: onResize,
      title: 'Resize',
      tooltip: poweredOnTooltip,
    },
    {
      disabled: readOnly || !!swapTooltip,
      onClick: () =>
        navigate({
          to: `/images/create/disk`,
          search: {
            selectedLinode: String(linodeId),
            selectedDisk: String(disk.id),
          },
        }),
      title: 'Create Disk Image',
      tooltip: swapTooltip,
    },
    {
      disabled: readOnly,
      onClick: () => {
        navigate({
          to: `/linodes/${linodeId}/clone/disks`,
          search: {
            selectedDisk: String(disk.id),
          },
        });
      },
      title: 'Clone',
    },
    {
      disabled: linodeStatus !== 'offline' || readOnly,
      onClick: onDelete,
      title: 'Delete',
      tooltip: poweredOnTooltip,
    },
  ];

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => (
          <InlineMenuAction
            actionText={action.title}
            disabled={action.disabled}
            key={action.title}
            onClick={action.onClick}
            tooltip={action.tooltip}
            tooltipAnalyticsEvent={
              action.title === 'Resize'
                ? () =>
                    sendEvent({
                      action: `Open:tooltip`,
                      category: `Disk ${action.title} Flow`,
                      label: `${action.title} help icon tooltip`,
                    })
                : undefined
            }
          />
        ))}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Disk ${disk.label}`}
      />
    </>
  );
};
