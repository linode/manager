import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { splitAt } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu, Action } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { sendEvent } from 'src/utilities/analytics';

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

  let _tooltip =
    linodeStatus === 'offline'
      ? undefined
      : 'Your Linode must be fully powered down in order to perform this action';

  _tooltip = readOnly
    ? "You don't have permissions to perform this action"
    : _tooltip;

  const disabledProps = _tooltip
    ? {
        disabled: true,
        tooltip: _tooltip,
      }
    : {};

  const actions: Action[] = [
    {
      disabled: readOnly,
      onClick: onRename,
      title: 'Rename',
      tooltip: readOnly ? _tooltip : '',
    },
    {
      onClick: onResize,
      title: 'Resize',
      ...disabledProps,
    },
    {
      onClick: onImagize,
      title: 'Imagize',
      ...(readOnly ? disabledProps : {}),
    },
    {
      onClick: () => {
        history.push(`/linodes/${linodeId}/clone/disks?selectedDisk=${diskId}`);
      },
      title: 'Clone',
      ...(readOnly ? disabledProps : {}),
    },
    {
      onClick: onDelete,
      title: 'Delete',
      ...disabledProps,
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
