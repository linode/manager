import { Token } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  token: Token;
  type: string;
  isThirdPartyAccessToken: boolean;
  openViewDrawer: (token: Token) => void;
  openEditDrawer: (token: Token) => void;
  openRevokeDialog: (token: Token, type: string) => void;
}

type CombinedProps = Props;

export const APITokenMenu: React.FC<CombinedProps> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    isThirdPartyAccessToken,
    openViewDrawer,
    openEditDrawer,
    openRevokeDialog,
    token,
    type
  } = props;

  const baseActions: Action[] = [
    {
      title: 'View Scopes',
      onClick: () => {
        openViewDrawer(token);
      }
    },
    {
      title: 'Rename',
      onClick: () => {
        openEditDrawer(token);
      }
    },
    {
      title: 'Revoke',
      onClick: () => {
        openRevokeDialog(token, type);
      }
    }
  ];

  const actions = isThirdPartyAccessToken
    ? baseActions.filter(action => action.title !== 'Rename')
    : baseActions;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for API Token ${props.token.label}`}
        />
      ) : (
        actions.map(action => {
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

export default APITokenMenu;
