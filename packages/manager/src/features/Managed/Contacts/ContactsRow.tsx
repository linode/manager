import { ManagedContact } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import { makeStyles } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ActionMenu from './ContactsActionMenu';

const useStyles = makeStyles(() => ({
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0,
  },
}));

interface Props {
  contact: ManagedContact;
  updateOrAdd: (contact: ManagedContact) => void;
  openDrawer: (linodeId: number) => void;
  openDialog: (contactId: number) => void;
}

export const ContactsRow: React.FunctionComponent<Props> = props => {
  const classes = useStyles();

  const { contact, updateOrAdd, openDrawer, openDialog } = props;

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
      <TableCell className={classes.actionCell}>
        <ActionMenu
          contactId={contact.id}
          updateOrAdd={updateOrAdd}
          openDrawer={openDrawer}
          openDialog={openDialog}
          contactName={contact.name}
        />
      </TableCell>
    </TableRow>
  );
};

export default ContactsRow;
