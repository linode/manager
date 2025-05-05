import { useLinodeQuery } from '@linode/queries';
import { Hidden } from '@linode/ui';
import { useMatch } from '@tanstack/react-router';
import produce from 'immer';
import * as React from 'react';

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
import { useAllLinodeSettingsQuery } from 'src/queries/managed/managed';

import { DEFAULTS } from './common';
import { EditSSHAccessDrawer } from './EditSSHAccessDrawer';
import { StyledDiv } from './SSHAccessTable.styles';
import { SSHAccessTableContent } from './SSHAccessTableContent';

import type { ManagedLinodeSetting } from '@linode/api-v4/lib/managed';

export const SSHAccessTable = () => {
  const match = useMatch({ strict: false });
  const { data: settings, error, isLoading } = useAllLinodeSettingsQuery();

  const data = settings || [];

  const { data: selectedLinode, isFetching } = useDialogData({
    enabled: match.routeId === '/managed/ssh-access/$linodeId/edit',
    paramKey: 'linodeId',
    queryHook: useLinodeQuery,
    redirectToOnNotFound: '/managed/ssh-access',
  });

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

  const {
    handleOrderChange,
    order,
    orderBy,
    sortedData: sortedLinodeSettings,
  } = useOrderV2({
    data: normalizedData,
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/managed/ssh-access',
    },
    preferenceKey: 'managed-ssh-access',
  });

  const isDeleteDialogOpen =
    match.routeId === '/managed/ssh-access/$linodeId/edit';

  return (
    <>
      <Paginate data={sortedLinodeSettings || []}>
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
      <EditSSHAccessDrawer
        isFetching={isFetching}
        isOpen={isDeleteDialogOpen}
        linodeSetting={normalizedData.find((l) => l.id === selectedLinode?.id)}
      />
    </>
  );
};
