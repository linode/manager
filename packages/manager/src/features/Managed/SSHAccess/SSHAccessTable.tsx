import produce from 'immer';
import {
  getLinodeSettings,
  ManagedLinodeSetting
} from 'linode-js-sdk/lib/managed';
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
import { getAll } from 'src/utilities/getAll';
import { DEFAULTS } from './common';
import EditSSHAccessDrawer from './EditSSHAccessDrawer';
import SSHAccessTableContent from './SSHAccessTableContent';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    '&:before': {
      display: 'none'
    }
  },
  linode: {
    width: '30%'
  },
  access: {
    width: '15%'
  },
  ip: {
    width: '20%'
  }
}));

const request = () =>
  getAll<ManagedLinodeSetting>(getLinodeSettings)().then(res => res.data);

const SSHAccessTable: React.FC<{}> = () => {
  const classes = useStyles();

  const { data, loading, lastUpdated, transformData, error } = useAPIRequest<
    ManagedLinodeSetting[]
  >(request, []);

  const updateOne = (linodeSetting: ManagedLinodeSetting) => {
    transformData(draft => {
      const idx = draft.findIndex(l => l.id === linodeSetting.id);
      draft[idx] = linodeSetting;
    });
  };

  const [selectedLinodeId, setSelectedLinodeId] = React.useState<number | null>(
    null
  );

  const drawer = useOpenClose();

  // For all intents and purposes, the default `user` is "root", and the default `port` is 22.
  // Surprisingly, these are returned as `null` from the API. We want to display the defaults
  // to the user, though, so we normalize the data here by exchanging `null` for the defaults.
  const normalizedData: ManagedLinodeSetting[] = produce(data, draft => {
    data.forEach((linodeSetting, idx) => {
      if (linodeSetting.ssh.user === null) {
        draft[idx].ssh.user = DEFAULTS.user;
      }

      if (linodeSetting.ssh.port === null) {
        draft[idx].ssh.port = DEFAULTS.port;
      }
    });
  });

  return (
    <>
      <OrderBy data={normalizedData} orderBy="label" order="asc">
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
                              className={classes.access}
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
                              className={classes.ip}
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
                            {/* Empty TableCell for action menu */}
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <SSHAccessTableContent
                            linodeSettings={paginatedData}
                            loading={loading}
                            lastUpdated={lastUpdated}
                            updateOne={updateOne}
                            openDrawer={(linodeId: number) => {
                              setSelectedLinodeId(linodeId);
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
                      eventCategory="managed ssh access table"
                    />
                  </>
                );
              }}
            </Paginate>
          );
        }}
      </OrderBy>
      <EditSSHAccessDrawer
        isOpen={drawer.isOpen}
        closeDrawer={drawer.close}
        linodeSetting={normalizedData.find(l => l.id === selectedLinodeId)}
        updateOne={updateOne}
      />
    </>
  );
};

export default SSHAccessTable;
