import { Config } from '@linode/api-v4/lib/linodes';
import { splitAt } from 'ramda';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { useHistory } from 'react-router-dom';
import Box from 'src/components/core/Box';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  onBoot: () => void;
  config: Config;
  linodeId: number;
  readOnly?: boolean;
  label: string;
}

export const ConfigActionMenu = (props: Props) => {
  const { readOnly, linodeId, config, onEdit, onBoot, onDelete } = props;
  const history = useHistory();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const tooltip = readOnly
    ? "You don't have permission to perform this action"
    : undefined;

  const actions: Action[] = [
    {
      title: 'Boot',
      onClick: onBoot,
    },
    {
      title: 'Edit',
      onClick: onEdit,
    },
    {
      title: 'Clone',
      onClick: () => {
        history.push(
          `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
        );
      },
      disabled: readOnly,
    },
    {
      title: 'Delete',
      onClick: onDelete,
      disabled: readOnly,
      tooltip,
    },
  ];

  const splitActionsArrayIndex = matchesSmDown ? 0 : 2;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
              disabled={action.disabled}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Linode Config ${props.label}`}
      />
    </Box>
  );
};
