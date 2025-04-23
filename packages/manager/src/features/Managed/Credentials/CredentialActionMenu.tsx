import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';

import type { Theme } from '@mui/material/styles';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface CredentialActionMenuProps {
  credentialId: number;
  label: string;
}

export const CredentialActionMenu = (props: CredentialActionMenuProps) => {
  const navigate = useNavigate();
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { credentialId, label } = props;

  const onClickForEdit = () => {
    navigate({
      params: { credentialId },
      to: '/managed/credentials/$credentialId/edit',
    });
  };

  const onClickForDelete = () => {
    navigate({
      params: { credentialId },
      to: '/managed/credentials/$credentialId/delete',
    });
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
