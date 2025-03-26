import { Box } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { sendEvent } from 'src/utilities/analytics/utils';
import { splitAt } from 'src/utilities/splitAt';

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
  const history = useHistory();

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
        history.push(
          `/images/create/disk?selectedLinode=${linodeId}&selectedDisk=${disk.id}`
        ),
      title: 'Create Disk Image',
      tooltip: swapTooltip,
    },
    {
      disabled: readOnly,
      onClick: () => {
        history.push(
          `/linodes/${linodeId}/clone/disks?selectedDisk=${disk.id}`
        );
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
    <Box alignItems="center" display="flex" justifyContent="flex-end">
      {!matchesSmDown &&
        inlineActions.map((action) => (
          <InlineMenuAction
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
            actionText={action.title}
            disabled={action.disabled}
            key={action.title}
            onClick={action.onClick}
            tooltip={action.tooltip}
          />
        ))}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Disk ${disk.label}`}
      />
    </Box>
  );
};
