import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface CredentialActionMenuProps {
  credentialID: number;
  label: string;
  openDialog: (id: number, label: string) => void;
  openForEdit: (id: number) => void;
}

const CredentialActionMenu = (props: CredentialActionMenuProps) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { credentialID, label, openDialog, openForEdit } = props;

  const onClickForEdit = () => {
    openForEdit(credentialID);
  };

  const onClickForDelete = () => {
    openDialog(credentialID, label);
  };

  const actions: Action[] = [
    {
      onClick: onClickForEdit,
      title: 'Edit',
    },
    {
      onClick: onClickForDelete,
      title: 'Delete',
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
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default CredentialActionMenu;
