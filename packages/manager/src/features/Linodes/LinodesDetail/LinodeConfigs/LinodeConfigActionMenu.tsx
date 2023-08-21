import { Config } from '@linode/api-v4/lib/linodes';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import { splitAt } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu, Action } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  config: Config;
  label: string;
  linodeId: number;
  onBoot: () => void;
  onDelete: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

export const ConfigActionMenu = (props: Props) => {
  const { config, linodeId, onBoot, onDelete, onEdit, readOnly } = props;
  const history = useHistory();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const tooltip = readOnly
    ? "You don't have permission to perform this action"
    : undefined;

  const actions: Action[] = [
    {
      onClick: onBoot,
      title: 'Boot',
    },
    {
      onClick: onEdit,
      title: 'Edit',
    },
    {
      disabled: readOnly,
      onClick: () => {
        history.push(
          `/linodes/${linodeId}/clone/configs?selectedConfig=${config.id}`
        );
      },
      title: 'Clone',
    },
    {
      disabled: readOnly,
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
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
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
