import { Box } from '@linode/ui';
import { splitAt } from '@linode/utilities';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Config } from '@linode/api-v4/lib/linodes';
import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

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
      disabled: readOnly,
      onClick: onBoot,
      title: 'Boot',
    },
    {
      disabled: readOnly,
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
