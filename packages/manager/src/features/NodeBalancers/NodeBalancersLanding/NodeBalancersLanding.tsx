import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useNodeBalancersQuery } from 'src/queries/nodebalancers';

import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';
import { NodeBalancerTableRow } from './NodeBalancerTableRow';
import { NodeBalancerLandingEmptyState } from './NodeBalancersLandingEmptyState';

const preferenceKey = 'nodebalancers';

export const NodeBalancersLanding = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    selectedNodeBalancerId,
    setSelectedNodeBalancerId,
  ] = React.useState<number>(-1);

  const history = useHistory();
  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    preferenceKey
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data, error, isLoading } = useNodeBalancersQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const selectedNodeBalancer = data?.data.find(
    (nodebalancer) => nodebalancer.id === selectedNodeBalancerId
  );

  const onDelete = (nodeBalancerId: number) => {
    setSelectedNodeBalancerId(nodeBalancerId);
    setIsDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <ErrorState
        errorText={error?.[0].reason ?? 'Unable to load your NodeBalancers'}
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return <NodeBalancerLandingEmptyState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="NodeBalancers" />
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/"
        entity="NodeBalancer"
        onButtonClick={() => history.push('/nodebalancers/create')}
        title="NodeBalancers"
      />
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
            <Hidden smDown>
              <TableCell>Backend Status</TableCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell>Transferred</TableCell>
              <TableCell>Ports</TableCell>
            </Hidden>
            <TableCell>IP Address</TableCell>
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
          {data?.data.map((nodebalancer) => (
            <NodeBalancerTableRow
              key={nodebalancer.id}
              onDelete={() => onDelete(nodebalancer.id)}
              {...nodebalancer}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="NodeBalancers Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <TransferDisplay spacingTop={18} />
      <NodeBalancerDeleteDialog
        id={selectedNodeBalancerId}
        label={selectedNodeBalancer?.label ?? ''}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
    </>
  );
};

export default NodeBalancersLanding;
