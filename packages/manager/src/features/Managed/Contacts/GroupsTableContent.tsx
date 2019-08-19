import { equals } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { shallowCompareProps } from 'src/utilities/shallowCompareProps';
import GroupsRow from './GroupsRow';

interface Props {
  groupNames: string[];
  contacts: Linode.ManagedContact[];
  loading: boolean;
  lastUpdated: number;
  error?: Linode.ApiFieldError[];
  openDrawer: (groupName: string) => void;
}

export type CombinedProps = Props;

export const GroupsTableContent: React.FC<CombinedProps> = props => {
  const {
    groupNames,
    contacts,
    loading,
    lastUpdated,
    error,
    openDrawer
  } = props;

  if (loading && lastUpdated === 0) {
    return <TableRowLoading colSpan={12} />;
  }

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return <TableRowError colSpan={12} message={errorMessage} />;
  }

  if (groupNames.length === 0 && lastUpdated !== 0) {
    return (
      <TableRowEmpty
        colSpan={12}
        message={"You don't have any Groups on your account."}
      />
    );
  }

  return (
    <>
      {groupNames.map((groupName, idx) => (
        <GroupsRow
          key={`managed-contact-row-${idx}`}
          groupName={groupName}
          contacts={contacts
            // Find the contacts that belong to this group
            .filter(contact => contact.group === groupName)
            // <GroupsRow /> needs the `name`s only
            .map(contact => contact.name)}
          openDrawer={openDrawer}
        />
      ))}
    </>
  );
};

const memoized = (component: React.FC<CombinedProps>) =>
  React.memo(component, (prevProps, nextProps) => {
    return (
      // This is to prevent a slow-down that occurs
      // when opening the GroupDrawer or ContactsDrawer
      // when there are a large number of contacts.
      equals(prevProps.contacts, nextProps.contacts) &&
      // JSON.stringify is faster than Ramda equals() on flat lists.
      JSON.stringify(prevProps.groupNames) ===
        JSON.stringify(nextProps.groupNames) &&
      shallowCompareProps<CombinedProps>(
        ['lastUpdated', 'loading', 'error'],
        prevProps,
        nextProps
      )
    );
  });

const enhanced = compose<CombinedProps, Props>(memoized);

export default enhanced(GroupsTableContent);
