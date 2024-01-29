import * as React from 'react';

import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { PlacementGroupsLinodesTableRow } from './PlacementGroupsLinodesTableRow';

import type { APIError, Linode } from '@linode/api-v4';

export interface Props {
  error?: APIError[];
  linodes: Linode[];
}

export const PlacementGroupsLinodesTable = React.memo((props: Props) => {
  const { error, linodes } = props;

  const _error = error
    ? getAPIErrorOrDefault(
        error,
        'Unable to retrieve Linodes for this Placement Group'
      )
    : undefined;

  const orderKey = 'linode:label';

  return (
    <OrderBy data={linodes} order={'asc'} orderBy={orderKey}>
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
                      active={orderBy === orderKey}
                      colSpan={2}
                      data-qa-placement-group-linode-header
                      direction={order}
                      handleClick={handleOrderChange}
                      label={orderKey}
                    >
                      Linode
                    </TableSortCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableContentWrapper
                    error={_error}
                    length={paginatedAndOrderedLinodes.length}
                    loading={false}
                  >
                    {paginatedAndOrderedLinodes.map((linode) => (
                      <PlacementGroupsLinodesTableRow
                        key={`placement-group-linode-${linode.id}`}
                        linode={linode}
                      />
                    ))}
                  </TableContentWrapper>
                </TableBody>
              </Table>
              <PaginationFooter
                count={count}
                eventCategory="Firewall Devices Table"
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
