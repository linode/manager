import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { CircleProgress } from 'src/components/CircleProgress';
import Hidden from 'src/components/core/Hidden';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useNodeBalancersQuery } from 'src/queries/nodebalancers';
import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';
import NodeBalancersLandingEmptyState from './NodeBalancersLandingEmptyState';
import { NodeBalancerTableRow } from './NodeBalancerTableRow';

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

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'asc',
    },
    preferenceKey
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const { data, isLoading, error } = useNodeBalancersQuery(
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
    return <NodeBalancersLandingEmptyState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="NodeBalancers" />
      <LandingHeader
        title="NodeBalancers"
        entity="NodeBalancer"
        onButtonClick={() => history.push('/nodebalancers/create')}
        docsLink="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              label="label"
              handleClick={handleOrderChange}
            >
              Label
            </TableSortCell>
            <Hidden smDown>
              <TableCell>Backend Status</TableCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell>Transfered</TableCell>
              <TableCell>Ports</TableCell>
            </Hidden>
            <TableCell>IP Address</TableCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                label="region"
                handleClick={handleOrderChange}
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
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="NodeBalancers Table"
      />
      <TransferDisplay spacingTop={18} />
      <NodeBalancerDeleteDialog
        id={selectedNodeBalancerId}
        label={selectedNodeBalancer?.label ?? ''}
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};

export default NodeBalancersLanding;
