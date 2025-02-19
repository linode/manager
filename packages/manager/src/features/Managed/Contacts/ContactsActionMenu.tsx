import { useMediaQuery } from '@mui/material';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

import type { Theme } from '@mui/material';
import type { Action } from 'src/components/ActionMenu/ActionMenu';

interface ContactsActionMenuProps {
  contactId: number;
  contactName: string;
  openDialog: (id: number) => void;
  openDrawer: (contactId: number) => void;
}

export const ContactsActionMenu = (props: ContactsActionMenuProps) => {
  const { contactId, contactName, openDialog, openDrawer } = props;
  const matchesSmDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md')
  );

  const actions: Action[] = [
    {
      onClick: () => {
        openDrawer(contactId);
      },
      title: 'Edit',
    },
    {
      onClick: () => {
        openDialog(contactId);
      },
      title: 'Delete',
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    (<>
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
    </>)
  );
};

export default ContactsActionMenu;
