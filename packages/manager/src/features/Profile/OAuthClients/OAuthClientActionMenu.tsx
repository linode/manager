import * as React from 'react';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  openSecretModal: (id: string, label: string) => void;
  openDeleteModal: (id: string, label: string) => void;
  openEditDrawer: (
    isPublic: boolean,
    redirectUri: string,
    label: string,
    clientID?: string
  ) => void;
  label: string;
  redirectUri: string;
  isPublic: boolean;
  clientID: string;
}

type CombinedProps = Props;

export const OAuthClientActionMenu: React.FC<CombinedProps> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const { label, redirectUri, isPublic, clientID } = props;

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: () => {
        props.openEditDrawer(isPublic, redirectUri, label, clientID);
      },
    },
    {
      title: 'Reset',
      onClick: () => {
        props.openSecretModal(clientID, label);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        props.openDeleteModal(clientID, label);
      },
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

export default OAuthClientActionMenu;
