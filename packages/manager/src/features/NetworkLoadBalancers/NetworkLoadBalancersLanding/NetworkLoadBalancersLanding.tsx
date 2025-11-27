import { useNetworkLoadBalancersQuery } from '@linode/queries';
import { CircleProgress, ErrorState, Hidden } from '@linode/ui';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { NLB_API_DOCS_LINK } from '../constants';
import {
  StyledLockIcon,
  StyledManagedChip,
} from './NetworkLoadBalancersLanding.styles';
import { NetworkLoadBalancersLandingEmptyState } from './NetworkLoadBalancersLandingEmptyState';
import { NetworkLoadBalancerTableRow } from './NetworkLoadBalancerTableRow';

const preferenceKey = 'netloadbalancers';

export const NetworkLoadBalancersLanding = () => {
  const pagination = usePaginationV2({
    currentRoute: '/netloadbalancers',
    initialPage: 1,
    preferenceKey,
  });

  const { data, error, isLoading } = useNetworkLoadBalancersQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {}
  );

  if (error) {
    return (
      <ErrorState
        errorText={
          error?.[0]?.reason ?? 'Unable to load your Network Load Balancers.'
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return <NetworkLoadBalancersLandingEmptyState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="Network Load Balancer" />
      <LandingHeader
        breadcrumbProps={{
          pathname: '/netloadbalancers',
        }}
        docsLink={NLB_API_DOCS_LINK}
        entity="Network Load Balancer"
        extraActions={
          <StyledManagedChip
            icon={<StyledLockIcon />}
            label="Managed by LKE Enterprise"
            size="small"
          />
        }
        title="Network Load Balancer"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <Hidden lgDown>
              <TableCell>Status</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>ID</TableCell>
            </Hidden>
            <TableCell>Listener Ports</TableCell>
            <TableCell>Virtual IP (IPv4)</TableCell>
            <Hidden mdDown>
              <TableCell>Virtual IP (IPv6)</TableCell>
            </Hidden>
            <TableCell>LKE-E Cluster</TableCell>
            <Hidden mdDown>
              <TableCell>Region</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((networkLoadBalancer) => (
            <NetworkLoadBalancerTableRow
              key={networkLoadBalancer.id}
              {...networkLoadBalancer}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="Network Load Balancer Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

export default NetworkLoadBalancersLanding;
