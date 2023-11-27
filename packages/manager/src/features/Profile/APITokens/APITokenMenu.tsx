import { Token } from '@linode/api-v4/lib/profile';
import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface Props {
  isThirdPartyAccessToken: boolean;
  openEditDrawer: (token: Token) => void;
  openRevokeDialog: (token: Token, type: string) => void;
  openViewDrawer: (token: Token) => void;
  token: Token;
  type: string;
}

export const APITokenMenu = (props: Props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const {
    isThirdPartyAccessToken,
    openEditDrawer,
    openRevokeDialog,
    openViewDrawer,
    token,
    type,
  } = props;

  const actions = [
    {
      onClick: () => {
        openViewDrawer(token);
      },
      title: 'View Scopes',
    },
    !isThirdPartyAccessToken
      ? {
          onClick: () => {
            openEditDrawer(token);
          },
          title: 'Rename',
        }
      : null,
    {
      onClick: () => {
        openRevokeDialog(token, type);
      },
      title: 'Revoke',
    },
  ].filter(Boolean) as Action[];

  if (matchesSmDown) {
    return (
      <ActionMenu
        actionsList={actions}
        ariaLabel={`Action menu for API Token ${props.token.label}`}
      />
    );
  }

  return (
    <>
      {actions.map((action) => (
        <InlineMenuAction
          actionText={action.title}
          key={action.title}
          onClick={action.onClick}
        />
      ))}
    </>
  );
};
