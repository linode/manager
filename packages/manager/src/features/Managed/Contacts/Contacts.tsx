import { Button } from '@linode/ui';
import { useMatch, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Hidden } from 'src/components/Hidden';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import {
  useAllManagedContactsQuery,
  useDeleteContactMutation,
  useManagedContactQuery,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

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
  const match = useMatch({ strict: false });
  const { enqueueSnackbar } = useSnackbar();

  const { data, dataUpdatedAt, error, isLoading } =
    useAllManagedContactsQuery();

  const contacts = data || [];

  const { data: selectedContact, isFetching: isSelectedContactFetching } =
    useDialogData({
      enabled:
        match.routeId === '/managed/contacts/$contactId/edit' ||
        match.routeId === '/managed/contacts/$contactId/delete',
      paramKey: 'contactId',
      queryHook: useManagedContactQuery,
      redirectToOnNotFound: '/managed/contacts',
    });

  const [deleteError, setDeleteError] = React.useState<string | undefined>(
    undefined
  );
  const { mutateAsync: deleteContact } = useDeleteContactMutation();

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
    deleteContact({ id: selectedContact?.id || -1 })
      .then(() => {
        enqueueSnackbar('Contact deleted successfully.', {
          variant: 'success',
        });
      })
      .catch((e) => {
        setDeleteError(
          getAPIErrorOrDefault(e, 'Error deleting this contact.')[0].reason
        );
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
      <DeletionDialog
        entity="contact"
        error={deleteError}
        label={selectedContact?.name || ''}
        loading={isSelectedContactFetching}
        onClose={() => {
          setDeleteError(undefined);
          navigate({
            to: '/managed/contacts',
          });
        }}
        onDelete={handleDelete}
        open={isDeleteContactDialogOpen}
      />
      <ContactDrawer
        contact={selectedContact}
        groups={groups}
        isFetching={isSelectedContactFetching}
        isOpen={isEditContactDialogOpen || isCreateContactDialogOpen}
      />
    </>
  );
};
