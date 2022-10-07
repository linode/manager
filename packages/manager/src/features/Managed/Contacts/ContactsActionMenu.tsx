import * as React from 'react';
import { Action } from 'src/components/ActionMenu';
import InlineMenuAction from 'src/components/InlineMenuAction';

interface Props {
  contactId: number;
  contactName: string;
  openDialog: (id: number) => void;
  openDrawer: (contactId: number) => void;
}

export type CombinedProps = Props;

export const ContactsActionMenu: React.FC<CombinedProps> = (props) => {
  const { contactId, openDrawer, openDialog } = props;

  const actions: Action[] = [
    {
      title: 'Edit',
      onClick: () => {
        openDrawer(contactId);
      },
    },
    {
      title: 'Delete',
      onClick: () => {
        openDialog(contactId);
      },
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {actions.map((action) => {
        return (
          <InlineMenuAction
            key={action.title}
            actionText={action.title}
            onClick={action.onClick}
          />
        );
      })}
    </>
  );
};

export default ContactsActionMenu;
