import { useMediaQuery } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Theme } from '@mui/material';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface ContactsActionMenuProps {
  contactId: number;
  contactName: string;
}

export const ContactsActionMenu = (props: ContactsActionMenuProps) => {
  const { contactId, contactName } = props;
  const navigate = useNavigate();
  const matchesSmDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );

  const actions: Action[] = [
    {
      onClick: () => {
        navigate({
          params: {
            contactId,
          },
          to: '/managed/contacts/$contactId/edit',
        });
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        navigate({
          params: {
            contactId,
          },
          to: '/managed/contacts/$contactId/delete',
        });
      },
      title: 'Delete',
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Managed Contacts for ${contactName}`}
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
