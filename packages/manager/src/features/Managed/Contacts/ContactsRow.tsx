import { ManagedContact } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu from './ContactsActionMenu';

interface Props {
  contact: ManagedContact;
  openDrawer: (linodeId: number) => void;
  openDialog: (contactId: number) => void;
}

export const ContactsRow: React.FunctionComponent<Props> = (props) => {
  const { contact, openDrawer, openDialog } = props;

  return (
    <TableRow ariaLabel={`Contact ${contact.id}`} key={contact.id}>
      <TableCell>{contact.name}</TableCell>
      <Hidden smDown>
        <TableCell>{contact.group}</TableCell>
      </Hidden>
      <TableCell>{contact.email}</TableCell>
      <Hidden xsDown>
        <TableCell>{contact.phone.primary}</TableCell>
        <TableCell>{contact.phone.secondary}</TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          contactId={contact.id}
          openDrawer={openDrawer}
          openDialog={openDialog}
          contactName={contact.name}
        />
      </TableCell>
    </TableRow>
  );
};

export default ContactsRow;
