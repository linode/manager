import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import SSHAccessRow from './ContactsAccessRow';

interface Props {
  contacts: Linode.ManagedContact[];
  loading: boolean;
  lastUpdated: number;
  updateOne: (contact: Linode.ManagedContact) => void;
  openDrawer: (linodeId: number) => void;
  error?: Linode.ApiFieldError[];
}

export type CombinedProps = Props;

export const ContactsTable: React.FC<CombinedProps> = props => {
  const {
    contacts,
    loading,
    lastUpdated,
    updateOne,
    openDrawer,
    error
  } = props;

  if (loading && lastUpdated === 0) {
    return <TableRowLoading colSpan={12} />;
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={12} message={errorMessage} />;
  }

  if (contacts.length === 0 && lastUpdated !== 0) {
    return (
      <TableRowEmpty
        colSpan={12}
        message={"You don't have any Contacts on your account."}
      />
    );
  }

  return (
    <>
      {contacts.map((contact: Linode.ManagedContact, idx: number) => (
        <SSHAccessRow
          key={`managed-contact-row-${idx}`}
          updateOne={updateOne}
          contact={contact}
          openDrawer={openDrawer}
        />
      ))}
    </>
  );
};

export default ContactsTable;
