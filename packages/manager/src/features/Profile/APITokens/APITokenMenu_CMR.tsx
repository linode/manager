import { Token } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

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

  const inlineActions = [
    {
      actionText: 'Revoke',
      onClick: () => {
        openRevokeDialog(token, type);
      }
    }
  ];
  if (!isThirdPartyAccessToken) {
    inlineActions.unshift({
      actionText: 'Rename Token',
      onClick: () => {
        openEditDrawer(token);
      }
    });
  }
  inlineActions.unshift({
    actionText: 'View Token Scopes',
    onClick: () => {
      openViewDrawer(token);
    }
  });

  const createActions = () => (): Action[] => {
    const actions: Action[] = [
      {
        title: 'Revoke',
        onClick: () => {
          openRevokeDialog(token, type);
        }
      }
    ];
    if (!isThirdPartyAccessToken) {
      actions.unshift({
        title: 'Rename Token',
        onClick: () => {
          openEditDrawer(token);
        }
      });
    }
    actions.unshift({
      title: 'View Token Scopes',
      onClick: () => {
        openViewDrawer(token);
      }
    });

    return actions;
  };

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          createActions={createActions()}
          ariaLabel={`Action menu for API Token ${props.token.label}`}
        />
      ) : (
        inlineActions.map(action => {
          return (
            <InlineMenuAction
              key={action.actionText}
              actionText={action.actionText}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default APITokenMenu;
