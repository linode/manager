import * as React from 'react';

import { Hidden } from '@linode/ui';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import ActionMenu from './ContactsActionMenu';
import { MaskableText } from 'src/components/MaskableText/MaskableText';

import type { ManagedContact } from '@linode/api-v4/lib/managed';

interface ContactsRowProps {
  contact: ManagedContact;
  openDialog: (contactId: number) => void;
  openDrawer: (linodeId: number) => void;
}

export const ContactsRow = (props: ContactsRowProps) => {
  const { contact, openDialog, openDrawer } = props;

  return (
    <TableRow key={contact.id}>
      <TableCell>
        <MaskableText text={contact.name} isToggleable />
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <MaskableText text={contact.group ?? ''} isToggleable />
        </TableCell>
      </Hidden>
      <TableCell>
        <MaskableText text={contact.email} isToggleable />
      </TableCell>
      <Hidden xsDown>
        <TableCell>
          <MaskableText text={contact.phone.primary ?? ''} isToggleable />
        </TableCell>
        <TableCell>
          <MaskableText text={contact.phone.secondary ?? ''} isToggleable />
        </TableCell>
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
