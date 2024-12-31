import * as React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { PLACEMENT_GROUP_LINODES_ERROR_MESSAGE } from '../../constants';
import { PlacementGroupsLinodesTableRow } from './PlacementGroupsLinodesTableRow';

import type { APIError, Linode } from '@linode/api-v4';

export interface Props {
  error?: APIError[];
  handleUnassignLinodeModal: (linode: Linode) => void;
  isFetchingLinodes: boolean;
  linodes: Linode[];
}

export const PlacementGroupsLinodesTable = React.memo((props: Props) => {
  const {
    error,
    handleUnassignLinodeModal,
    isFetchingLinodes,
    linodes,
  } = props;

  const orderLinodeKey = 'label';
  const orderStatusKey = 'status';

  const _error = error
    ? getAPIErrorOrDefault(error, PLACEMENT_GROUP_LINODES_ERROR_MESSAGE)
    : undefined;

  return (
    <OrderBy data={linodes} order="asc" orderBy={orderLinodeKey}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            count,
            data: paginatedAndOrderedLinodes,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <Table aria-label="List of Linodes in this Placement Group">
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      active={orderBy === orderLinodeKey}
                      data-qa-placement-group-linode-header
                      direction={order}
                      handleClick={handleOrderChange}
                      label={orderLinodeKey}
                      sx={{ width: '30%' }}
                    >
                      Linode
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === orderStatusKey}
                      data-qa-placement-group-linode-status-header
                      direction={order}
                      handleClick={handleOrderChange}
                      label={orderStatusKey}
                    >
                      Status
                    </TableSortCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableContentWrapper
                    loadingProps={{
                      columns: 3,
                    }}
                    error={_error}
                    length={paginatedAndOrderedLinodes.length}
                    loading={isFetchingLinodes}
                  >
                    {paginatedAndOrderedLinodes.map((linode) => (
                      <PlacementGroupsLinodesTableRow
                        handleUnassignLinodeModal={handleUnassignLinodeModal}
                        key={`placement-group-linode-${linode.id}`}
                        linode={linode}
                      />
                    ))}
                  </TableContentWrapper>
                </TableBody>
              </Table>
              <PaginationFooter
                count={count}
                eventCategory="Placement Group Linodes Table"
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
});
