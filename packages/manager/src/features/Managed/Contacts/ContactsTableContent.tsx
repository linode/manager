import { ManagedContact } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import { equals } from 'ramda';
import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { arePropsEqual } from 'src/utilities/arePropsEqual';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import ContactsRow from './ContactsRow';

interface ContactsTableContentProps {
  contacts: ManagedContact[];
  error?: APIError[] | null;
  lastUpdated: number;
  loading: boolean;
  openDialog: (contactId: number) => void;
  openDrawer: (linodeId: number) => void;
}

export const ContactsTableContent = (props: ContactsTableContentProps) => {
  const {
    contacts,
    error,
    lastUpdated,
    loading,
    openDialog,
    openDrawer,
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
          contact={contact}
          key={`managed-contact-row-${idx}`}
          openDialog={openDialog}
          openDrawer={openDrawer}
        />
      ))}
    </>
  );
};

const memoized = (component: React.FC<ContactsTableContentProps>) =>
  React.memo(
    component,
    (prevProps, nextProps) =>
      // This is to prevent a slow-down that occurs
      // when opening the GroupDrawer or ContactsDrawer
      // when there are a large number of contacts.
      equals(prevProps.contacts, nextProps.contacts) &&
      arePropsEqual<ContactsTableContentProps>(
        ['lastUpdated', 'loading', 'error'],
        prevProps,
        nextProps
      )
  );

export default memoized(ContactsTableContent);
