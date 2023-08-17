import { Loadbalancer } from '@linode/api-v4/lib/AGLB/types';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancersQuery } from 'src/queries/aglb/loadbalancers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { LoadBalancerLandingEmptyState } from './LoadBalancerLandingEmptyState';
import { LoadBalancerRow } from './LoadBalancerRow';

const preferenceKey = 'loadbalancers';

const LoadBalancerTable = () => {
  const pagination = usePagination(1, preferenceKey);
  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data: loadBalancers, error, isLoading } = useLoadBalancersQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your LoadBalancers.')[0]
            .reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (loadBalancers?.data.length === 0) {
    return <LoadBalancerLandingEmptyState />;
  }

  return (
    <>
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
            <TableCell>Endpoints</TableCell>
            <TableCell>Ports</TableCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loadBalancers?.data.map((loadBalancer: Loadbalancer) => (
            <LoadBalancerRow
              key={loadBalancer.id}
              loadBalancer={loadBalancer}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={loadBalancers?.data.length || 0}
        eventCategory="Load Balancer Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

export default LoadBalancerTable;
