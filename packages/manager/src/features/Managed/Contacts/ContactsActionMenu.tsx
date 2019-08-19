import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  contactId: number;
  updateOne: (contact: Linode.ManagedContact) => void;
  openDrawer: (contactId: number) => void;
}

export type CombinedProps = Props;

export const ContactsActionMenu: React.FC<CombinedProps> = props => {
  const { contactId, openDrawer } = props;

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
          alert('delete contact');
        }
      }
    ];
    return actions;
  };

  return <ActionMenu createActions={createActions} />;
};

export default ContactsActionMenu;
