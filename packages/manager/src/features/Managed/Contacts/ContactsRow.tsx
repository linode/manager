import { Hidden } from '@linode/ui';
import * as React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { ContactsActionMenu } from './ContactsActionMenu';

import type { ManagedContact } from '@linode/api-v4/lib/managed';

interface ContactsRowProps {
  contact: ManagedContact;
}

export const ContactsRow = (props: ContactsRowProps) => {
  const { contact } = props;

  return (
    <TableRow key={contact.id}>
      <TableCell>
        <MaskableText isToggleable text={contact.name} />
      </TableCell>
      <Hidden mdDown>
        <TableCell>
          <MaskableText isToggleable text={contact.group ?? ''} />
        </TableCell>
      </Hidden>
      <TableCell>
        <MaskableText isToggleable text={contact.email} />
      </TableCell>
      <Hidden xsDown>
        <TableCell>
          <MaskableText isToggleable text={contact.phone.primary ?? ''} />
        </TableCell>
        <TableCell>
          <MaskableText isToggleable text={contact.phone.secondary ?? ''} />
        </TableCell>
      </Hidden>
      <TableCell actionCell>
        <ContactsActionMenu contactId={contact.id} contactName={contact.name} />
      </TableCell>
    </TableRow>
  );
};
