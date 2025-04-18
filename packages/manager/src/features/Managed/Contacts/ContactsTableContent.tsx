import { arePropsEqual } from '@linode/utilities';
import { useMediaQuery } from '@mui/material';
import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { ContactsRow } from './ContactsRow';

import type { ManagedContact } from '@linode/api-v4/lib/managed';
import type { APIError } from '@linode/api-v4/lib/types';
import type { Theme } from '@mui/material';

interface ContactsTableContentProps {
  contacts: ManagedContact[];
  error?: APIError[] | null;
  lastUpdated: number;
  loading: boolean;
}

const memoized = (
  component: (props: ContactsTableContentProps) => JSX.Element
) =>
  React.memo(
    component,
    (prevProps, nextProps) =>
      // This is to prevent a slow-down that occurs
      // when opening the GroupDrawer or ContactsDrawer
      // when there are a large number of contacts.
      JSON.stringify(prevProps.contacts) ===
        JSON.stringify(nextProps.contacts) &&
      arePropsEqual<ContactsTableContentProps>(
        ['lastUpdated', 'loading', 'error'],
        prevProps,
        nextProps
      )
  );

export const ContactsTableContent = memoized(
  (props: ContactsTableContentProps) => {
    const { contacts, error, lastUpdated, loading } = props;

    const matchesMdDownBreakpoint = useMediaQuery((theme: Theme) =>
      theme.breakpoints.down('md')
    );

    const NUM_COLUMNS = matchesMdDownBreakpoint ? 5 : 6;

    if (loading && lastUpdated === 0) {
      return <TableRowLoading columns={NUM_COLUMNS} />;
    }

    if (error) {
      const errorMessage = getErrorStringOrDefault(error);
      return <TableRowError colSpan={NUM_COLUMNS} message={errorMessage} />;
    }

    if (contacts.length === 0 && lastUpdated !== 0) {
      return (
        <TableRowEmpty
          colSpan={NUM_COLUMNS}
          message={"You don't have any Contacts on your account."}
        />
      );
    }

    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {contacts.map((contact: ManagedContact, idx: number) => (
          <ContactsRow contact={contact} key={`managed-contact-row-${idx}`} />
        ))}
      </>
    );
  }
);
