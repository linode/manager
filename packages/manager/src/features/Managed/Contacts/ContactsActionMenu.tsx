import { ManagedContact } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import ActionMenu, { Action } from 'src/components/ActionMenu/ActionMenu';

interface Props {
  contactId: number;
  contactName: string;
  updateOrAdd: (contact: ManagedContact) => void;
  openDialog: (id: number) => void;
  openDrawer: (contactId: number) => void;
}

export type CombinedProps = Props;

export const ContactsActionMenu: React.FC<CombinedProps> = props => {
  const { contactId, openDrawer, openDialog } = props;

  const createActions = (): Action[] => {
    const actions = [
      {
        title: 'Edit',
        onClick: () => {
          openDrawer(contactId);
        }
      },
      {
        title: 'Delete',
        onClick: () => {
          openDialog(contactId);
        }
      }
    ];
    return actions;
  };

  return (
    <ActionMenu
      createActions={createActions}
      ariaLabel={`Action menu for Contact ${props.contactName}`}
    />
  );
};

export default ContactsActionMenu;
