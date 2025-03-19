import { useOpenClose } from '@linode/utilities';
import produce from 'immer';
import * as React from 'react';

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
import { useAllLinodeSettingsQuery } from 'src/queries/managed/managed';

import { DEFAULTS } from './common';
import EditSSHAccessDrawer from './EditSSHAccessDrawer';
import { StyledDiv } from './SSHAccessTable.styles';
import SSHAccessTableContent from './SSHAccessTableContent';

import type { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';

const SSHAccessTable = () => {
  const { data: settings, error, isLoading } = useAllLinodeSettingsQuery();

  const data = settings || [];

  const [selectedLinodeId, setSelectedLinodeId] = React.useState<null | number>(
    null
  );

  const drawer = useOpenClose();

  // For all intents and purposes, the default `user` is "root", and the default `port` is 22.
  // Surprisingly, these are returned as `null` from the API. We want to display the defaults
  // to the user, though, so we normalize the data here by exchanging `null` for the defaults.
  const normalizedData: ManagedLinodeSetting[] = produce(data, (draft) => {
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
      <OrderBy data={normalizedData} order="asc" orderBy="label">
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          return (
            <Paginate data={orderedData}>
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
                    <StyledDiv>
                      <Table aria-label="List of Your Managed SSH Access Settings">
                        <TableHead>
                          <TableRow>
                            <TableSortCell
                              active={orderBy === 'label'}
                              data-qa-ssh-linode-header
                              direction={order}
                              handleClick={handleOrderChange}
                              label={'label'}
                            >
                              Linode
                            </TableSortCell>
                            <TableSortCell
                              active={orderBy === 'ssh:access'}
                              data-qa-ssh-access-header
                              direction={order}
                              handleClick={handleOrderChange}
                              label={'ssh:access'}
                            >
                              SSH Access
                            </TableSortCell>
                            <Hidden smDown>
                              <TableSortCell
                                active={orderBy === 'ssh:user'}
                                data-qa-ssh-user-header
                                direction={order}
                                handleClick={handleOrderChange}
                                label={'ssh:user'}
                              >
                                User
                              </TableSortCell>
                              <TableSortCell
                                active={orderBy === 'ssh:ip'}
                                data-qa-ssh-ip-header
                                direction={order}
                                handleClick={handleOrderChange}
                                label={'ssh:ip'}
                              >
                                IP
                              </TableSortCell>
                              <TableSortCell
                                active={orderBy === 'ssh:port'}
                                data-qa-ssh-port-header
                                direction={order}
                                handleClick={handleOrderChange}
                                label={'ssh:port'}
                              >
                                Port
                              </TableSortCell>
                            </Hidden>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <SSHAccessTableContent
                            openDrawer={(linodeId: number) => {
                              setSelectedLinodeId(linodeId);
                              drawer.open();
                            }}
                            error={error}
                            linodeSettings={paginatedData}
                            loading={isLoading}
                          />
                        </TableBody>
                      </Table>
                    </StyledDiv>
                    <PaginationFooter
                      count={count}
                      eventCategory="managed ssh access table"
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
      <EditSSHAccessDrawer
        closeDrawer={drawer.close}
        isOpen={drawer.isOpen}
        linodeSetting={normalizedData.find((l) => l.id === selectedLinodeId)}
      />
    </>
  );
};

export default SSHAccessTable;
