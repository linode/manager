import { ServiceTarget } from '@linode/api-v4';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
// import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useServiceTargetsQuery } from 'src/queries/aglb/serviceTargets';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { ServiceTargetRow } from './ServiceTargetRow';

const PREFERENCE_KEY = 'service-targets';

const ServiceTargetLanding = () => {
  const pagination = usePagination(1, PREFERENCE_KEY);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${PREFERENCE_KEY}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data, error, isLoading } = useServiceTargetsQuery(
    1,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const handleDelete = () => {
    // TODO: AGLB - Needs UX clarification
    return;
  };

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your service targets.')[0]
            .reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Service Targets" />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            {/* TODO: AGLB - TBD for Beta, revisit if required for Beta */}
            {/* <TableSortCell
              active={orderBy === 'endpoints'}
              direction={order}
              label="endpoints"
              handleClick={handleOrderChange}
            >
              Endpoints
            </TableSortCell> */}
            {/* TODO: AGLB - Marked Nice to Have for Beta */}
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'load_balancing_algorithm'}
                direction={order}
                handleClick={handleOrderChange}
                label="load_balancing_algorithm"
              >
                Load Balancing Algorithm
              </TableSortCell>
            </Hidden>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'health_checks'}
                direction={order}
                handleClick={handleOrderChange}
                label="health_checks"
              >
                Health Checks
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((serviceTarget: ServiceTarget) => (
            <ServiceTargetRow
              key={serviceTarget.id}
              onDelete={handleDelete}
              {...serviceTarget}
            />
          ))}
        </TableBody>
      </Table>
      {/* TODO: AGLB - are we paginating? */}
      {/* <PaginationFooter
        count={data?.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Service Target Table"
      /> */}
    </>
  );
};

export default ServiceTargetLanding;
