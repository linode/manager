import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  label: string;
  onOpenResetDialog: () => void;
  onOpenDeleteDialog: () => void;
  onOpenEditDrawer: () => void;
}

export const OAuthClientActionMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const actions: Action[] = [
    {
      onClick: props.onOpenEditDrawer,
      title: 'Edit',
    },
    {
      onClick: props.onOpenResetDialog,
      title: 'Reset',
    },
    {
      onClick: props.onOpenDeleteDialog,
      title: 'Delete',
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for OAuth Client ${props.label}`}
        />
      ) : (
        actions.map((action) => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default OAuthClientActionMenu;
