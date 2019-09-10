import { deleteContact } from 'linode-js-sdk/lib/managed';
import { ManagedContact } from 'linode-js-sdk/lib/managed/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import RootRef from 'src/components/core/RootRef';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { useDialog } from 'src/hooks/useDialog';
import useOpenClose from 'src/hooks/useOpenClose';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { ManagedContactGroup, Mode } from './common';
import ContactDrawer from './ContactsDrawer';
import ContactTableContact from './ContactsTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
    '&:before': {
      display: 'none'
    }
  },
  copy: {
    marginTop: theme.spacing(1)
  },
  contactsTable: {
    marginTop: theme.spacing(4)
  },
  name: {
    width: '20%'
  }
}));

interface Props {
  contacts: ManagedContact[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
  lastUpdated: number;
  transformData: (fn: (contacts: ManagedContact[]) => void) => void;
  update: () => void;
}

type CombinedProps = Props & WithSnackbarProps;

const Contacts: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    contacts,
    loading,
    error,
    lastUpdated,
    transformData,
    update,
    enqueueSnackbar
  } = props;

  const updateOrAdd = (contact: ManagedContact) => {
    transformData(draft => {
      const idx = draft.findIndex(l => l.id === contact.id);
      // Add the contact if we don't already have it.
      if (idx === -1) {
        draft.push(contact);
      } else {
        // Otherwise just update it.
        draft[idx] = contact;
      }
    });
  };

  const [selectedContactId, setSelectedContactId] = React.useState<
    number | null
  >(null);

  const [contactDrawerMode, setContactDrawerMode] = React.useState<Mode>(
    'create'
  );

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError
  } = useDialog<number>(deleteContact);

  const handleDelete = () => {
    submitDialog(dialog.entityID)
      .then(() => {
        update();
        enqueueSnackbar('Contact deleted successfully.', {
          variant: 'success'
        });
      })
      .catch(e =>
        handleError(
          getAPIErrorOrDefault(e, 'Error deleting this contact.')[0].reason
        )
      );
  };

  const contactDrawer = useOpenClose();

  // Ref for handling "scrollTo" on Paginated component.
  const contactsTableRef = React.createRef();

  const groups = generateGroupsFromContacts(contacts);

  return (
    <>
      <DocumentTitleSegment segment="Contacts" />
      <Typography variant="subtitle1" className={classes.copy}>
        You can assign contact groups to monitors so we know who to talk to in
        the event of a support issue. Create contacts and assign them to a
        group, then assign the group to the appropriate monitor(s).
      </Typography>
      <div className={classes.contactsTable}>
        <RootRef rootRef={contactsTableRef}>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h2">Contacts</Typography>
            <AddNewLink
              onClick={() => {
                setContactDrawerMode('create');
                contactDrawer.open();
              }}
              label="Add a Contact"
            />
          </Box>
        </RootRef>
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
                  pageSize
                }) => {
                  return (
                    <>
                      <Paper className={classes.root}>
                        <Table aria-label="List of Your Managed Contacts">
                          <TableHead>
                            <TableRow>
                              <TableSortCell
                                active={orderBy === 'name'}
                                label={'name'}
                                direction={order}
                                handleClick={handleOrderChange}
                                className={classes.name}
                              >
                                Name
                              </TableSortCell>
                              <TableSortCell
                                active={orderBy === 'group'}
                                label={'group'}
                                direction={order}
                                handleClick={handleOrderChange}
                              >
                                Group
                              </TableSortCell>
                              <TableSortCell
                                active={orderBy === 'email'}
                                label={'email'}
                                direction={order}
                                handleClick={handleOrderChange}
                              >
                                E-mail
                              </TableSortCell>
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
                              {/* Empty TableCell for action menu */}
                              <TableCell />
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <ContactTableContact
                              contacts={paginatedData}
                              loading={loading}
                              lastUpdated={lastUpdated}
                              updateOrAdd={updateOrAdd}
                              openDrawer={(contactId: number) => {
                                setSelectedContactId(contactId);
                                setContactDrawerMode('edit');
                                contactDrawer.open();
                              }}
                              openDialog={(contactId: number) => {
                                const selectedContact = contacts.find(
                                  thisContact => thisContact.id === contactId
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
                      </Paper>
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
          loading={dialog.isLoading}
          error={dialog.error}
          onClose={closeDialog}
          onDelete={handleDelete}
        />
      </div>
      <ContactDrawer
        mode={contactDrawerMode}
        isOpen={contactDrawer.isOpen}
        closeDrawer={contactDrawer.close}
        updateOrAdd={updateOrAdd}
        contact={contacts.find(contact => contact.id === selectedContactId)}
        groups={groups}
      />
    </>
  );
};

export default withSnackbar(Contacts);

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

  contacts.forEach(contact => {
    // If the contact doesn't have a group, don't do anything. Otherwise we'd have `null` groups.
    if (typeof contact.group !== 'string') {
      return;
    }

    // Have we tracked this group yet?
    const idx = groups.findIndex(group => group.groupName === contact.group);

    // If not, add a new group.
    if (idx === -1) {
      groups.push({
        groupName: contact.group,
        contactNames: [contact.name]
      });
    } else {
      // If we've already tracked the group, just add this contact's name.
      groups[idx].contactNames.push(contact.name);
    }
  });

  return groups;
};
