import { Loadbalancer } from '@linode/api-v4';
import React from 'react';
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
import { TableSortCell } from 'src/components/TableSortCell';
import {
  AGLB_DOCS,
  AGLB_FEEDBACK_FORM_URL,
} from 'src/features/LoadBalancers/constants';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLoadBalancersQuery } from 'src/queries/aglb/loadbalancers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { DeleteLoadBalancerDialog } from '../LoadBalancerDetail/Settings/LoadBalancerDeleteDialog';
import { LoadBalancerLandingEmptyState } from './LoadBalancerLandingEmptyState';
import { LoadBalancerRow } from './LoadBalancerRow';

const LOADBALANCER_CREATE_ROUTE = 'loadbalancers/create';
const preferenceKey = 'loadbalancers';

export const LoadBalancerLanding = () => {
  const history = useHistory();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const [
    selectedLoadbalancerId,
    setSelectedLoadbalancerId,
  ] = React.useState<number>();

  const onDelete = (id: number) => {
    setSelectedLoadbalancerId(id);
    setIsDeleteDialogOpen(true);
  };

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

  const createLoadBalancer = () => {
    history.push(LOADBALANCER_CREATE_ROUTE);
  };

  const { data: loadBalancers, error, isLoading } = useLoadBalancersQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const selectedLoadbalancer = loadBalancers?.data.find(
    (l) => l.id === selectedLoadbalancerId
  );

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your Load Balancers.')[0]
            .reason
        }
      />
    );
  }

  return (
    <>
      <DocumentTitleSegment segment="Load Balancers" />
      {loadBalancers?.data.length === 0 ? (
        <LoadBalancerLandingEmptyState />
      ) : (
        <>
          <LandingHeader
            betaFeedbackLink={AGLB_FEEDBACK_FORM_URL}
            breadcrumbProps={{ pathname: '/loadbalancers' }}
            createButtonText="Create Load Balancer"
            docsLabel="Docs"
            docsLink={AGLB_DOCS.GettingStarted}
            entity="Global Load Balancers"
            onButtonClick={createLoadBalancer}
            removeCrumbX={1}
            title="Global Load Balancers"
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
                  <TableCell>Ports</TableCell>
                </Hidden>
                <Hidden smDown>
                  <TableCell>Hostname</TableCell>
                </Hidden>
                <Hidden mdDown>
                  <TableCell>Regions</TableCell>
                </Hidden>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadBalancers?.data.map((loadBalancer: Loadbalancer) => (
                <LoadBalancerRow
                  handlers={{
                    onDelete: () => onDelete(loadBalancer.id),
                  }}
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
          <DeleteLoadBalancerDialog
            loadbalancer={selectedLoadbalancer}
            onClose={() => setIsDeleteDialogOpen(false)}
            open={isDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
};
