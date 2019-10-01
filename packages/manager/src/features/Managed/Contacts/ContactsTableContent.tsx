import { ManagedContact } from 'linode-js-sdk/lib/managed';
import { APIError } from 'linode-js-sdk/lib/types';
import { equals } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
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

export type CombinedProps = Props;

export const ContactsTableContent: React.FC<CombinedProps> = props => {
  const {
    contacts,
    loading,
    lastUpdated,
    updateOrAdd,
    openDrawer,
    openDialog,
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

const memoized = (component: React.FC<CombinedProps>) =>
  React.memo(
    component,
    (prevProps, nextProps) =>
      // This is to prevent a slow-down that occurs
      // when opening the GroupDrawer or ContactsDrawer
      // when there are a large number of contacts.
      equals(prevProps.contacts, nextProps.contacts) &&
      arePropsEqual<CombinedProps>(
        ['lastUpdated', 'loading', 'error'],
        prevProps,
        nextProps
      )
  );

const enhanced = compose<CombinedProps, Props>(memoized);

export default enhanced(ContactsTableContent);
