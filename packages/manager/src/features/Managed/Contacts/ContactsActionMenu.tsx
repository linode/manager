import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  contactId: number;
  updateOrAdd: (contact: Linode.ManagedContact) => void;
  openDialog: (id: number) => void;
  openDrawer: (contactId: number) => void;
}

export type CombinedProps = Props;

export const ContactsActionMenu: React.FC<CombinedProps> = props => {
  const { contactId, openDrawer, openDialog } = props;

  const createActions = (closeMenu: Function): Action[] => {
    const actions = [
      {
        title: 'Edit',
        onClick: () => {
          closeMenu();
          openDrawer(contactId);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          openDialog(contactId);
          closeMenu();
        }
      }
    ];
    return actions;
  };

  return <ActionMenu createActions={createActions} />;
};

export default ContactsActionMenu;
