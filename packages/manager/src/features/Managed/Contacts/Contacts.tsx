import { Button, Hidden, Notice, Typography } from '@linode/ui';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import {
  useAllManagedContactsQuery,
  useDeleteContactMutation,
  useManagedContactQuery,
} from 'src/queries/managed/managed';

import { generateGroupsFromContacts } from '../utils';
import {
  StyledHeaderGrid,
  StyledTypography,
  StyledWrapperGrid,
} from './Contacts.styles';
import ContactDrawer from './ContactsDrawer';
import { ContactsTableContent } from './ContactsTableContent';

export const Contacts = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const match = useMatch({ strict: false });
  const { enqueueSnackbar } = useSnackbar();

  const { data, dataUpdatedAt, error, isLoading } =
    useAllManagedContactsQuery();

  const contacts = data || [];

  const {
    data: selectedContact,
    isFetching: isSelectedContactFetching,
    error: selectedContactError,
  } = useManagedContactQuery(
    params.contactId ?? -1,
    match.routeId === '/managed/contacts/$contactId/edit' ||
      match.routeId === '/managed/contacts/$contactId/delete'
  );

  const {
    mutateAsync: deleteContact,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteContactMutation();

  const {
    handleOrderChange,
    order,
    orderBy,
    sortedData: sortedContacts,
  } = useOrderV2({
    data: contacts,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'name',
      },
      from: '/managed/contacts',
    },
    preferenceKey: 'managed-contacts',
  });

  const handleDelete = () => {
    deleteContact({ id: selectedContact?.id || -1 }).then(() => {
      enqueueSnackbar('Contact deleted successfully.', {
        variant: 'success',
      });
      navigate({
        to: '/managed/contacts',
      });
    });
  };

  // Ref for handling "scrollTo" on Paginated component.
  const contactsTableRef = React.createRef<HTMLDivElement>();

  const groups = generateGroupsFromContacts(contacts);

  const isCreateContactDialogOpen = match.routeId === '/managed/contacts/add';
  const isDeleteContactDialogOpen =
    match.routeId === '/managed/contacts/$contactId/delete';
  const isEditContactDialogOpen =
    match.routeId === '/managed/contacts/$contactId/edit';

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
            buttonType="primary"
            onClick={() => {
              navigate({
                to: '/managed/contacts/add',
              });
            }}
            sx={{ mb: 1 }}
          >
            Add Contact
          </Button>
        </StyledWrapperGrid>
      </StyledHeaderGrid>
      <Paginate data={sortedContacts || []} scrollToRef={contactsTableRef}>
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
                  <ContactsTableContent
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
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          error: selectedContactError,
          name: selectedContact?.name || 'Unknown',
          primaryBtnText: 'Delete Contact',
          type: 'Managed Contact',
        }}
        errors={deleteError}
        isFetching={isSelectedContactFetching}
        label="Contact Name"
        loading={isDeleting}
        onClick={handleDelete}
        onClose={() => {
          navigate({
            to: '/managed/contacts',
          });
        }}
        open={isDeleteContactDialogOpen}
        title={`Delete ${selectedContact?.name || 'Unknown'}?`}
      >
        <Notice variant="warning">
          <Typography>
            <strong>Warning:</strong> Deleting this contact is permanent and
            can’t be undone.
          </Typography>
        </Notice>
      </TypeToConfirmDialog>
      <ContactDrawer
        contact={selectedContact}
        contactError={selectedContactError}
        groups={groups}
        isFetching={isSelectedContactFetching}
        isOpen={isEditContactDialogOpen || isCreateContactDialogOpen}
      />
    </>
  );
};
