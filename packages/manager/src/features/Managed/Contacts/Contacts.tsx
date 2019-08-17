import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useOpenClose from 'src/hooks/useOpenClose';
import { getManagedContacts } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import ContactDrawer from './ContactsDrawer';
import ContactTableContact from './ContactsTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    '&:before': {
      display: 'none'
    }
  },
  name: {
    width: '20%'
  }
}));

const request = () =>
  getAll<Linode.ManagedContact>(getManagedContacts)().then(res => res.data);

const SSHAccessTable: React.FC<{}> = () => {
  const classes = useStyles();

  const { data, loading, lastUpdated, transformData, error } = useAPIRequest<
    Linode.ManagedContact[]
  >(request, []);

  const updateOne = (contact: Linode.ManagedContact) => {
    transformData(draft => {
      const idx = draft.findIndex(l => l.id === contact.id);
      draft[idx] = contact;
    });
  };

  const [selectedContactId, setSelectedContactId] = React.useState<
    number | null
  >(null);

  const drawer = useOpenClose();

  return (
    <>
      <OrderBy data={data}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Paginate data={orderedData}>
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
                            updateOne={updateOne}
                            openDrawer={(contactId: number) => {
                              setSelectedContactId(contactId);
                              drawer.open();
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
      <ContactDrawer
        isOpen={drawer.isOpen}
        closeDrawer={drawer.close}
        contact={data.find(l => l.id === selectedContactId)}
      />
    </>
  );
};

export default SSHAccessTable;
