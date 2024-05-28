import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { splitAt } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { Box } from 'src/components/Box';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { sendEvent } from 'src/utilities/analytics/utils';

interface Props {
  diskId?: number;
  label: string;
  linodeId?: number;
  linodeStatus: string;
  onDelete: () => void;
  onImagize: () => void;
  onRename: () => void;
  onResize: () => void;
  readOnly?: boolean;
}

export const LinodeDiskActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const history = useHistory();

  const {
    diskId,
    linodeId,
    linodeStatus,
    onDelete,
    onImagize,
    onRename,
    onResize,
    readOnly,
  } = props;

  const tooltip =
    linodeStatus !== 'offline'
      ? 'Your Linode must be fully powered down in order to perform this action'
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
      tooltip,
    },
    {
      disabled: readOnly,
      onClick: onImagize,
      title: 'Imagize',
    },
    {
      disabled: readOnly,
      onClick: () => {
        history.push(`/linodes/${linodeId}/clone/disks?selectedDisk=${diskId}`);
      },
      title: 'Clone',
    },
    {
      disabled: linodeStatus !== 'offline' || readOnly,
      onClick: onDelete,
      title: 'Delete',
      tooltip,
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
        ariaLabel={`Action menu for Disk ${props.label}`}
      />
    </Box>
  );
};
