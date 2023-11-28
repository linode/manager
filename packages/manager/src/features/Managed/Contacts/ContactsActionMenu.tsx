import * as React from 'react';

import { Action } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

interface ContactsActionMenuProps {
  contactId: number;
  contactName: string;
  openDialog: (id: number) => void;
  openDrawer: (contactId: number) => void;
}

export const ContactsActionMenu = (props: ContactsActionMenuProps) => {
  const { contactId, openDialog, openDrawer } = props;

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
    <>
      {actions.map((action) => {
        return (
          <InlineMenuAction
            actionText={action.title}
            key={action.title}
            onClick={action.onClick}
          />
        );
      })}
    </>
  );
};

export default ContactsActionMenu;
