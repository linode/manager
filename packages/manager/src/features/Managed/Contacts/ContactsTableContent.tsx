import { ManagedContact } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { equals } from 'ramda';
import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import ContactsRow from './ContactsRow';

interface Props {
  contacts: ManagedContact[];
  loading: boolean;
  lastUpdated: number;
  updateOrAdd: (contact: ManagedContact) => void;
  openDrawer: (linodeId: number) => void;
  openDialog: (contactId: number) => void;
  error?: APIError[];
}

export const ContactsTableContent: React.FC<Props> = (props) => {
  const {
    contacts,
    loading,
    lastUpdated,
    updateOrAdd,
    openDrawer,
    openDialog,
    error,
  } = props;

  if (loading && lastUpdated === 0) {
    return <TableRowLoading columns={6} />;
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={6} message={errorMessage} />;
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
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {contacts.map((contact: ManagedContact, idx: number) => (
        <ContactsRow
          key={`managed-contact-row-${idx}`}
          updateOrAdd={updateOrAdd}
          contact={contact}
          openDrawer={openDrawer}
          openDialog={openDialog}
        />
      ))}
    </>
  );
};

const memoized = (component: React.FC<Props>) =>
  React.memo(
    component,
    (prevProps, nextProps) =>
      // This is to prevent a slow-down that occurs
      // when opening the GroupDrawer or ContactsDrawer
      // when there are a large number of contacts.
      equals(prevProps.contacts, nextProps.contacts) &&
      arePropsEqual<Props>(
        ['lastUpdated', 'loading', 'error'],
        prevProps,
        nextProps
      )
  );

export default memoized(ContactsTableContent);
