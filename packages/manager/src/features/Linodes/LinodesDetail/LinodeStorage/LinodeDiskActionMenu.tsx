import { splitAt } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import Box from 'src/components/core/Box';
import { sendEvent } from 'src/utilities/analytics';

interface Props {
  linodeStatus: string;
  linodeId?: number;
  diskId?: number;
  label: string;
  readOnly?: boolean;
  onRename: () => void;
  onResize: () => void;
  onImagize: () => void;
  onDelete: () => void;
}

export const LinodeDiskActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));
  const history = useHistory();

  const {
    linodeStatus,
    readOnly,
    linodeId,
    diskId,
    onRename,
    onDelete,
    onResize,
    onImagize,
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
        tooltip: _tooltip,
        disabled: true,
      }
    : {};

  const actions: Action[] = [
    {
      title: 'Rename',
      onClick: onRename,
      disabled: readOnly,
      tooltip: readOnly ? _tooltip : '',
    },
    {
      title: 'Resize',
      onClick: onResize,
      ...disabledProps,
    },
    {
      title: 'Imagize',
      onClick: onImagize,
      ...(readOnly ? disabledProps : {}),
    },
    {
      title: 'Clone',
      onClick: () => {
        history.push(`/linodes/${linodeId}/clone/disks?selectedDisk=${diskId}`);
      },
      ...(readOnly ? disabledProps : {}),
    },
    {
      title: 'Delete',
      onClick: onDelete,
      ...disabledProps,
    },
  ];

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      {!matchesSmDown &&
        inlineActions.map((action) => (
          <InlineMenuAction
            key={action.title}
            actionText={action.title}
            onClick={action.onClick}
            disabled={action.disabled}
            tooltip={action.tooltip}
            tooltipAnalyticsEvent={
              action.title === 'Resize'
                ? () =>
                    sendEvent({
                      category: `Disk ${action.title} Flow`,
                      action: `Open:tooltip`,
                      label: `${action.title} help icon tooltip`,
                    })
                : undefined
            }
          />
        ))}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Disk ${props.label}`}
      />
    </Box>
  );
};
