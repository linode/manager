import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  credentialID: number;
  label: string;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

const CredentialActionMenu: React.FC<Props> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { label, credentialID, openDialog, openForEdit } = props;

  const onClickForEdit = () => {
    openForEdit(credentialID);
  };

  const onClickForDelete = () => {
    openDialog(credentialID, label);
  };

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: onClickForEdit,
    },
    {
      title: 'Delete',
      onClick: onClickForDelete,
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Managed Credentials for ${label}`}
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

export default CredentialActionMenu;
