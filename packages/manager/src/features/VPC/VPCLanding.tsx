import { VPC } from '@linode/api-v4/lib/vpcs/types';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Action } from 'src/components/ActionMenu';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import LandingHeader from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRegionsQuery } from 'src/queries/regions';
import { useVPCsQuery } from 'src/queries/vpcs';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const preferenceKey = 'vpcs';

const actions: Action[] = [
  {
    onClick: () => null,
    title: 'Edit',
  },
  {
    onClick: () => null,
    title: 'Delete',
  },
];

const VPCLanding = () => {
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

  const { data: vpcs, error, isLoading } = useVPCsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );
  const { data: regions } = useRegionsQuery();

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your VPCs.')[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <ProductInformationBanner bannerLocation="VPC" important warning />
      <LandingHeader
        createButtonText="Create VPC"
        docsLink="#"
        onButtonClick={() => null}
        title="Virtual Private Cloud (VPC)"
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
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'id'}
                direction={order}
                handleClick={handleOrderChange}
                label="id"
              >
                VPC ID
              </TableSortCell>
            </Hidden>
            <TableSortCell
              active={orderBy === 'subnets'}
              direction={order}
              handleClick={handleOrderChange}
              label="subnets"
            >
              Subnets
            </TableSortCell>
            <Hidden mdDown>
              <TableSortCell
                active={orderBy === 'linodes'}
                direction={order}
                handleClick={handleOrderChange}
                label="linodes"
              >
                Linodes
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vpcs?.data.map((vpc: VPC) => {
            const regionLabel = regions?.find((r) => r.id === vpc.region)
              ?.label;
            return (
              <TableRow
                ariaLabel={`VPC ${vpc.label}`}
                data-qa-vpc-id={vpc.id}
                key={`vpc-row-${vpc.id}`}
              >
                <TableCell>
                  <Link to={`/vpc/${vpc.id}`}>{vpc.label}</Link>
                </TableCell>
                <Hidden smDown>
                  <TableCell>{regionLabel}</TableCell>
                </Hidden>
                <Hidden mdDown>
                  <TableCell>{vpc.id}</TableCell>
                </Hidden>
                <TableCell>{vpc.subnets.length}</TableCell>
                <Hidden mdDown>
                  <TableCell>{vpc.subnets.length}</TableCell>
                </Hidden>
                <TableCell actionCell>
                  {actions.map((action) => {
                    return (
                      <InlineMenuAction
                        actionText={action.title}
                        key={action.title}
                        onClick={action.onClick}
                      />
                    );
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <PaginationFooter
        count={vpcs?.results || 0}
        eventCategory="VPCs Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

export default VPCLanding;
