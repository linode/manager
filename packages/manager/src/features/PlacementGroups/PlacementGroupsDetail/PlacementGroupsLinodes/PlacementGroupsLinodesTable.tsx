// yeah we're gonna have to get rid of that equals
import { equals } from 'ramda';
import * as React from 'react';

import { sortData } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePrevious } from 'src/hooks/usePrevious';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import {
  PG_LANDING_TABLE_DEFAULT_ORDER,
  PG_LINODES_TABLE_PREFERENCE_KEY,
  PLACEMENT_GROUP_LINODES_ERROR_MESSAGE,
  PLACEMENT_GROUPS_DETAILS_ROUTE,
} from '../../constants';
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

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: PG_LANDING_TABLE_DEFAULT_ORDER,
        orderBy: orderLinodeKey,
      },
      from: PLACEMENT_GROUPS_DETAILS_ROUTE,
    },
    preferenceKey: `${PG_LINODES_TABLE_PREFERENCE_KEY}-order`,
  });

  // definitely gonna look at this but currently trying to see what works
  // -----------
  // Stash a copy of the previous data for equality check.
  const prevData = usePrevious(linodes);

  // Our working copy of the data to be sorted.
  const dataToSort = React.useRef(linodes);

  // If `props.data` has changed, that's the data we should sort.
  //
  // Note: I really don't like this equality check that runs every render, but
  // I have yet to find a another solution.
  if (!equals(linodes, prevData)) {
    dataToSort.current = linodes;
  }

  // SORT THE DATA!
  const sortedData = sortData<Linode>(orderBy, order)(dataToSort.current);

  // Save this – this is what will be sorted next time around, if e.g. the order
  // or orderBy keys change. In that case we don't want to start from scratch
  // and sort `props.data`. That might result in odd UI behavior depending on
  // the data. See: https://github.com/linode/manager/pull/6855.
  dataToSort.current = sortedData;
  // -----------
  const _error = error
    ? getAPIErrorOrDefault(error, PLACEMENT_GROUP_LINODES_ERROR_MESSAGE)
    : undefined;

  return (
    // <OrderBy data={linodes} order="asc" orderBy={orderLinodeKey}>
    //   {({ data: orderedData, handleOrderChange, order, orderBy }) => (
    <Paginate data={sortedData}>
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
    //   )}
    // </OrderBy>
  );
});
