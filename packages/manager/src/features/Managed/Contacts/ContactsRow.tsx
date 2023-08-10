import { ManagedContact } from '@linode/api-v4/lib/managed';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ActionMenu from './ContactsActionMenu';

interface ContactsRowProps {
  contact: ManagedContact;
  openDialog: (contactId: number) => void;
  openDrawer: (linodeId: number) => void;
}

export const ContactsRow = (props: ContactsRowProps) => {
  const { contact, openDialog, openDrawer } = props;

  return (
    <TableRow ariaLabel={`Contact ${contact.id}`} key={contact.id}>
      <TableCell>{contact.name}</TableCell>
      <Hidden mdDown>
        <TableCell>{contact.group}</TableCell>
      </Hidden>
      <TableCell>{contact.email}</TableCell>
      <Hidden smDown>
        <TableCell>{contact.phone.primary}</TableCell>
        <TableCell>{contact.phone.secondary}</TableCell>
      </Hidden>
      <TableCell actionCell>
        <ActionMenu
          contactId={contact.id}
          contactName={contact.name}
          openDialog={openDialog}
          openDrawer={openDrawer}
        />
      </TableCell>
    </TableRow>
  );
};

export default ContactsRow;
