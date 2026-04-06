import * as React from 'react';

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
import type { Order } from 'src/hooks/useOrderV2';

export interface Props {
  error?: APIError[];
  handleUnassignLinodeModal: (linode: Linode) => void;
  isFetchingLinodes: boolean;
  linodes: Linode[];
  orderByProps: {
    handleOrderChange: (newOrderBy: string, newOrder: Order) => void;
    order: Order;
    orderBy: string;
  };
}

export const PlacementGroupsLinodesTable = React.memo((props: Props) => {
  const {
    error,
    handleUnassignLinodeModal,
    isFetchingLinodes,
    linodes,
    orderByProps,
  } = props;

  const { handleOrderChange, order, orderBy } = orderByProps;

  const orderLinodeKey = 'label';

  const _error = error
    ? getAPIErrorOrDefault(error, PLACEMENT_GROUP_LINODES_ERROR_MESSAGE)
    : undefined;

  return (
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
          <TableCell data-qa-placement-group-linode-status-header>
            Status
          </TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableContentWrapper
          error={_error}
          length={linodes.length}
          loading={isFetchingLinodes}
          loadingProps={{
            columns: 3,
          }}
        >
          {linodes.map((linode) => (
            <PlacementGroupsLinodesTableRow
              handleUnassignLinodeModal={handleUnassignLinodeModal}
              key={`placement-group-linode-${linode.id}`}
              linode={linode}
            />
          ))}
        </TableContentWrapper>
      </TableBody>
    </Table>
  );
});
