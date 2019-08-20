import { pluck, uniq } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import RootRef from 'src/components/core/RootRef';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import useOpenClose from 'src/hooks/useOpenClose';
import ContactDrawer from './ContactsDrawer';
import ContactTableContact from './ContactsTableContent';
import GroupDrawer from './GroupDrawer';
import GroupsTableContent from './GroupsTableContent';

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
  groupsTable: {
    marginTop: theme.spacing(3)
  },
  contactsTable: {
    marginTop: theme.spacing(4)
  },
  name: {
    width: '20%'
  }
}));

interface Props {
  contacts: Linode.ManagedContact[];
  loading: boolean;
  error?: Linode.ApiFieldError[];
  lastUpdated: number;
  transformData: (fn: (contacts: Linode.ManagedContact[]) => void) => void;
}

const Contacts: React.FC<Props> = props => {
  const classes = useStyles();

  const { contacts, loading, error, lastUpdated, transformData } = props;

  const updateOne = (contact: Linode.ManagedContact) => {
    transformData(draft => {
      const idx = draft.findIndex(l => l.id === contact.id);
      draft[idx] = contact;
    });
  };

  const [selectedContactId, setSelectedContactId] = React.useState<
    number | null
  >(null);

  const [selectedGroupName, setSelectedGroupName] = React.useState<
    string | null
  >(null);

  const contactDrawer = useOpenClose();
  const groupDrawer = useOpenClose();

  // Refs for handling "scrollTo" on Paginated components.
  const groupsTableRef = React.createRef();
  const contactsTableRef = React.createRef();

  return (
    <>
      <Typography variant="subtitle1" className={classes.copy}>
        You can assign contact groups to monitors so we know who to talk to in
        the event of a support issue. Create contacts and assign them to a
        group, then assign the group to the appropriate monitor(s).
      </Typography>
      {/* The "Groups" table works by ordering ALL contacts, then taking a list of
      unique group names and paginating on that. The <GroupsTableContent /> component
      receives ALL contacts, and uses each value from the group name list to generate
      the rows. */}
      <OrderBy data={contacts}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          // Array of group names to generate table from.
          const allGroups = pluck('group')(orderedData);
          // Only keep unique values and remove `null`s.
          const uniqueGroups = uniq(allGroups).filter(group => !!group);

          return (
            <Paginate data={uniqueGroups} scrollToRef={groupsTableRef}>
              {({
                count,
                data: paginatedData,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize
              }) => {
                return (
                  <div className={classes.groupsTable}>
                    <RootRef rootRef={groupsTableRef}>
                      <Typography variant="h2">Groups</Typography>
                    </RootRef>
                    <Paper className={classes.root}>
                      <Table aria-label="List of Your Managed Contact Groups">
                        <TableHead>
                          <TableRow>
                            <TableSortCell
                              active={orderBy === 'group'}
                              label={'group'}
                              direction={order}
                              handleClick={handleOrderChange}
                              className={classes.name}
                            >
                              Group Name
                            </TableSortCell>
                            <TableCell>Contacts</TableCell>
                            {/* Empty TableCell for action menu */}
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <GroupsTableContent
                            groupNames={paginatedData}
                            contacts={contacts}
                            loading={loading}
                            lastUpdated={lastUpdated}
                            error={error}
                            openDrawer={(groupName: string) => {
                              setSelectedGroupName(groupName);
                              groupDrawer.open();
                            }}
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
                      eventCategory="managed contact groups"
                    />
                  </div>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <OrderBy data={contacts}>
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
                  <div className={classes.contactsTable}>
                    <RootRef rootRef={contactsTableRef}>
                      <Typography variant="h2">Contacts</Typography>
                    </RootRef>
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
                            updateOne={updateOne}
                            openDrawer={(contactId: number) => {
                              setSelectedContactId(contactId);
                              contactDrawer.open();
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
                  </div>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <GroupDrawer
        isOpen={groupDrawer.isOpen}
        closeDrawer={groupDrawer.close}
        groupName={selectedGroupName || ''}
        contacts={contacts}
      />
      <ContactDrawer
        isOpen={contactDrawer.isOpen}
        closeDrawer={contactDrawer.close}
        contact={contacts.find(contact => contact.id === selectedContactId)}
      />
    </>
  );
};

export default Contacts;
