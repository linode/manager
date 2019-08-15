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
import { getLinodeSettings } from 'src/services/managed';
import { getAll } from 'src/utilities/getAll';
import SSHAccessTableContent from './SSHAccessTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    '&:before': {
      display: 'none'
    }
  },
  linode: {
    width: '40%'
  }
}));

const request = () =>
  getAll<Linode.ManagedLinodeSetting>(getLinodeSettings)().then(
    res => res.data
  );

const SSHAccessTable: React.FC<{}> = () => {
  const classes = useStyles();

  const { data, loading, lastUpdated, error } = useAPIRequest<
    Linode.ManagedLinodeSetting[]
  >(request, []);

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
                      <Table aria-label="List of Your Managed SSH Access Settings">
                        <TableHead>
                          <TableRow>
                            <TableSortCell
                              active={orderBy === 'label'}
                              label={'label'}
                              direction={order}
                              handleClick={handleOrderChange}
                              className={classes.linode}
                              data-qa-ssh-linode-header
                            >
                              Linode
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'ssh:access'}
                              label={'ssh:access'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-ssh-access-header
                            >
                              SSH Access
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'ssh:user'}
                              label={'ssh:user'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-ssh-user-header
                            >
                              User
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'ssh:ip'}
                              label={'ssh:ip'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-ssh-ip-header
                            >
                              IP
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'ssh:port'}
                              label={'ssh:port'}
                              direction={order}
                              handleClick={handleOrderChange}
                              data-qa-ssh-port-header
                            >
                              Port
                            </TableSortCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <SSHAccessTableContent
                            linodeSettings={paginatedData}
                            loading={loading}
                            lastUpdated={lastUpdated}
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
                      eventCategory="managed ssh access table"
                    />
                  </>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
    </>
  );
};

export default SSHAccessTable;
