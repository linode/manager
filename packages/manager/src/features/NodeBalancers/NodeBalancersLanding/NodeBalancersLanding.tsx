import { useNodeBalancerQuery, useNodeBalancersQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { Hidden } from '@linode/ui';
import { useMatch, useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { TransferDisplay } from 'src/components/TransferDisplay/TransferDisplay';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import { NodeBalancerDeleteDialog } from '../NodeBalancerDeleteDialog';
import { useIsNodebalancerVPCEnabled } from '../utils';
import { NodeBalancerLandingEmptyState } from './NodeBalancersLandingEmptyState';
import { NodeBalancerTableRow } from './NodeBalancerTableRow';

const preferenceKey = 'nodebalancers';

export const NodeBalancersLanding = () => {
  const navigate = useNavigate();
  const match = useMatch({ strict: false });
  const params = useParams({ strict: false });
  const pagination = usePagination(1, preferenceKey);
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_nodebalancers',
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/nodebalancers',
    },
    preferenceKey,
  });

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

  const {
    data: selectedNodeBalancer,
    isFetching: isFetchingNodeBalancer,
    error: selectedNodeBalancerError,
  } = useNodeBalancerQuery(Number(params.id), !!params.id);

  const { isNodebalancerVPCEnabled } = useIsNodebalancerVPCEnabled();

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
        breadcrumbProps={{
          pathname: '/nodebalancers',
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'NodeBalancers',
          }),
        }}
        disabledCreateButton={isRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nodebalancers"
        entity="NodeBalancer"
        onButtonClick={() => navigate({ to: '/nodebalancers/create' })}
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
            {isNodebalancerVPCEnabled && (
              <Hidden lgDown>
                <TableCell>VPC</TableCell>
              </Hidden>
            )}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((nodebalancer) => (
            <NodeBalancerTableRow key={nodebalancer.id} {...nodebalancer} />
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
        isFetching={isFetchingNodeBalancer}
        nodeBalancerError={selectedNodeBalancerError}
        open={match.routeId === '/nodebalancers/$id/delete'}
        selectedNodeBalancer={selectedNodeBalancer}
      />
    </>
  );
};

export default NodeBalancersLanding;
