import * as React from 'react';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu from './ContactsActionMenu';

interface Props {
  contact: Linode.ManagedContact;
  updateOrAdd: (contact: Linode.ManagedContact) => void;
  openDrawer: (linodeId: number) => void;
}

export const ContactsRow: React.FunctionComponent<Props> = props => {
  const { contact, updateOrAdd, openDrawer } = props;

  return (
    <TableRow key={contact.id}>
      <TableCell parentColumn="Name">{contact.name}</TableCell>
      <TableCell parentColumn="Group">{contact.group}</TableCell>
      <TableCell parentColumn="E-mail">{contact.email}</TableCell>
      <TableCell parentColumn="Primary Phone">
        {contact.phone.primary}
      </TableCell>
      <TableCell parentColumn="Secondary Phone">
        {contact.phone.secondary}
      </TableCell>
      <TableCell>
        <ActionMenu
          contactId={contact.id}
          updateOrAdd={updateOrAdd}
          openDrawer={openDrawer}
        />
      </TableCell>
    </TableRow>
  );
};

export default ContactsRow;
