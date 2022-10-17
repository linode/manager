import { ManagedContact } from '@linode/api-v4/lib/managed';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { useDialog } from 'src/hooks/useDialog';
import useOpenClose from 'src/hooks/useOpenClose';
import {
  useAllManagedContactsQuery,
  useDeleteContactMutation,
} from 'src/queries/managed/managed';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ManagedContactGroup, Mode } from './common';
import ContactDrawer from './ContactsDrawer';
import ContactTableContact from './ContactsTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    fontSize: '0.875rem',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  header: {
    margin: 0,
    width: '100%',
  },
  addNewWrapper: {
    '&.MuiGrid-item': {
      paddingTop: 0,
      paddingRight: 0,
    },
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(),
    },
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data,
    isLoading,
    error,
    dataUpdatedAt,
  } = useAllManagedContactsQuery();

  const contacts = data || [];

  const [selectedContactId, setSelectedContactId] = React.useState<
    number | null
  >(null);

  const [contactDrawerMode, setContactDrawerMode] = React.useState<Mode>(
    'create'
  );

  const { mutateAsync: deleteContact } = useDeleteContactMutation();

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError,
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
      <Typography className={classes.copy}>
        You can assign contact groups to monitors so we know who to talk to in
        the event of a support issue. Create contacts and assign them to a
        group, then assign the group to the appropriate monitor(s).
      </Typography>
      <Grid
        ref={contactsTableRef}
        className={classes.header}
        container
        alignItems="center"
        justifyContent="flex-end"
      >
        <Grid item className={classes.addNewWrapper}>
          <AddNewLink
            onClick={() => {
              setContactDrawerMode('create');
              contactDrawer.open();
            }}
            label="Add Contact"
          />
        </Grid>
      </Grid>
      <OrderBy data={contacts} orderBy="name" order="asc">
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
                            label={'name'}
                            direction={order}
                            handleClick={handleOrderChange}
                          >
                            Name
                          </TableSortCell>
                          <Hidden smDown>
                            <TableSortCell
                              active={orderBy === 'group'}
                              label={'group'}
                              direction={order}
                              handleClick={handleOrderChange}
                            >
                              Group
                            </TableSortCell>
                          </Hidden>
                          <TableSortCell
                            active={orderBy === 'email'}
                            label={'email'}
                            direction={order}
                            handleClick={handleOrderChange}
                          >
                            E-mail
                          </TableSortCell>
                          <Hidden xsDown>
                            <TableSortCell
                              active={orderBy === 'phone:primary'}
                              label={'phone:primary'}
                              direction={order}
                              handleClick={handleOrderChange}
                            >
                              Primary Phone
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'phone:secondary'}
                              label={'phone:secondary'}
                              direction={order}
                              handleClick={handleOrderChange}
                            >
                              Secondary Phone
                            </TableSortCell>
                          </Hidden>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <ContactTableContact
                          contacts={paginatedData}
                          loading={isLoading}
                          lastUpdated={dataUpdatedAt}
                          openDrawer={(contactId: number) => {
                            setSelectedContactId(contactId);
                            setContactDrawerMode('edit');
                            contactDrawer.open();
                          }}
                          openDialog={(contactId: number) => {
                            const selectedContact = contacts.find(
                              (thisContact) => thisContact.id === contactId
                            );
                            const label = selectedContact
                              ? selectedContact.name
                              : '';
                            openDialog(contactId, label);
                          }}
                          error={error}
                        />
                      </TableBody>
                    </Table>
                    <PaginationFooter
                      count={count}
                      handlePageChange={handlePageChange}
                      handleSizeChange={handlePageSizeChange}
                      page={page}
                      pageSize={pageSize}
                      eventCategory="managed contacts"
                    />
                  </>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <DeletionDialog
        open={dialog.isOpen}
        label={dialog.entityLabel || ''}
        entity="contact"
        loading={dialog.isLoading}
        error={dialog.error}
        onClose={closeDialog}
        onDelete={handleDelete}
      />
      <ContactDrawer
        mode={contactDrawerMode}
        isOpen={contactDrawer.isOpen}
        closeDrawer={contactDrawer.close}
        contact={contacts.find((contact) => contact.id === selectedContactId)}
        groups={groups}
      />
    </>
  );
};

export default Contacts;

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
        groupName: contact.group,
        contactNames: [contact.name],
      });
    } else {
      // If we've already tracked the group, just add this contact's name.
      groups[idx].contactNames.push(contact.name);
    }
  });

  return groups;
};
