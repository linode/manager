import { Button } from '@linode/ui';
import { useDialog, useOpenClose } from '@linode/utilities';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Hidden } from 'src/components/Hidden';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import {
  useAllManagedContactsQuery,
  useDeleteContactMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  StyledHeaderGrid,
  StyledTypography,
  StyledWrapperGrid,
} from './Contacts.styles';
import ContactDrawer from './ContactsDrawer';
import ContactTableContact from './ContactsTableContent';

import type { ManagedContactGroup, Mode } from './common';
import type { ManagedContact } from '@linode/api-v4/lib/managed';

export const Contacts = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    data,
    dataUpdatedAt,
    error,
    isLoading,
  } = useAllManagedContactsQuery();

  const contacts = data || [];

  const [selectedContactId, setSelectedContactId] = React.useState<
    null | number
  >(null);

  const [contactDrawerMode, setContactDrawerMode] = React.useState<Mode>(
    'create'
  );

  const { mutateAsync: deleteContact } = useDeleteContactMutation();

  const {
    closeDialog,
    dialog,
    handleError,
    openDialog,
    submitDialog,
  } = useDialog<number>((id) => deleteContact({ id: id || -1 }));

  const handleDelete = () => {
    submitDialog(dialog.entityID)
      .then(() => {
        enqueueSnackbar('Contact deleted successfully.', {
          variant: 'success',
        });
      })
      .catch((e) =>
        handleError(
          getAPIErrorOrDefault(e, 'Error deleting this contact.')[0].reason
        )
      );
  };

  const contactDrawer = useOpenClose();

  // Ref for handling "scrollTo" on Paginated component.
  const contactsTableRef = React.createRef<HTMLDivElement>();

  const groups = generateGroupsFromContacts(contacts);

  return (
    <>
      <DocumentTitleSegment segment="Contacts" />
      <StyledTypography>
        You can assign contact groups to monitors so we know who to talk to in
        the event of a support issue. Create contacts and assign them to a
        group, then assign the group to the appropriate monitor(s).
      </StyledTypography>
      <StyledHeaderGrid
        alignItems="center"
        container
        justifyContent="flex-end"
        ref={contactsTableRef}
        spacing={2}
      >
        <StyledWrapperGrid>
          <Button
            onClick={() => {
              setContactDrawerMode('create');
              contactDrawer.open();
            }}
            buttonType="primary"
          >
            Add Contact
          </Button>
        </StyledWrapperGrid>
      </StyledHeaderGrid>
      <OrderBy data={contacts} order="asc" orderBy="name">
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Paginate data={orderedData} scrollToRef={contactsTableRef}>
              {({
                count,
                data: paginatedData,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize,
              }) => {
                return (
                  <>
                    <Table aria-label="List of Your Managed Contacts">
                      <TableHead>
                        <TableRow>
                          <TableSortCell
                            active={orderBy === 'name'}
                            direction={order}
                            handleClick={handleOrderChange}
                            label="name"
                          >
                            Name
                          </TableSortCell>
                          <Hidden mdDown>
                            <TableSortCell
                              active={orderBy === 'group'}
                              direction={order}
                              handleClick={handleOrderChange}
                              label="group"
                            >
                              Group
                            </TableSortCell>
                          </Hidden>
                          <TableSortCell
                            active={orderBy === 'email'}
                            direction={order}
                            handleClick={handleOrderChange}
                            label="email"
                          >
                            E-mail
                          </TableSortCell>
                          <Hidden xsDown>
                            <TableSortCell
                              active={orderBy === 'phone:primary'}
                              direction={order}
                              handleClick={handleOrderChange}
                              label="phone:primary"
                            >
                              Primary Phone
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'phone:secondary'}
                              direction={order}
                              handleClick={handleOrderChange}
                              label="phone:secondary"
                            >
                              Secondary Phone
                            </TableSortCell>
                          </Hidden>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <ContactTableContact
                          openDialog={(contactId: number) => {
                            const selectedContact = contacts.find(
                              (thisContact) => thisContact.id === contactId
                            );
                            const label = selectedContact
                              ? selectedContact.name
                              : '';
                            openDialog(contactId, label);
                          }}
                          openDrawer={(contactId: number) => {
                            setSelectedContactId(contactId);
                            setContactDrawerMode('edit');
                            contactDrawer.open();
                          }}
                          contacts={paginatedData}
                          error={error}
                          lastUpdated={dataUpdatedAt}
                          loading={isLoading}
                        />
                      </TableBody>
                    </Table>
                    <PaginationFooter
                      count={count}
                      eventCategory="managed contacts"
                      handlePageChange={handlePageChange}
                      handleSizeChange={handlePageSizeChange}
                      page={page}
                      pageSize={pageSize}
                    />
                  </>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <DeletionDialog
        entity="contact"
        error={dialog.error}
        label={dialog.entityLabel || ''}
        loading={dialog.isLoading}
        onClose={closeDialog}
        onDelete={handleDelete}
        open={dialog.isOpen}
      />
      <ContactDrawer
        closeDrawer={contactDrawer.close}
        contact={contacts.find((contact) => contact.id === selectedContactId)}
        groups={groups}
        isOpen={contactDrawer.isOpen}
        mode={contactDrawerMode}
      />
    </>
  );
};

/**
 * Generate groups from a list of Managed Contacts.
 *
 * @param contacts: Linode.ManagedContact[]
 * A list of contacts to generate groups from.
 */
export const generateGroupsFromContacts = (
  contacts: ManagedContact[]
): ManagedContactGroup[] => {
  const groups: ManagedContactGroup[] = [];

  contacts.forEach((contact) => {
    // If the contact doesn't have a group, don't do anything. Otherwise we'd have `null` groups.
    if (typeof contact.group !== 'string') {
      return;
    }

    // Have we tracked this group yet?
    const idx = groups.findIndex((group) => group.groupName === contact.group);

    // If not, add a new group.
    if (idx === -1) {
      groups.push({
        contactNames: [contact.name],
        groupName: contact.group,
      });
    } else {
      // If we've already tracked the group, just add this contact's name.
      groups[idx].contactNames.push(contact.name);
    }
  });

  return groups;
};
