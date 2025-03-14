import { useVPCQuery, useVPCsQuery } from '@linode/queries';
import { CircleProgress, ErrorState } from '@linode/ui';
import { useNavigate, useParams } from '@tanstack/react-router';
import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import {
  VPC_CREATE_ROUTE,
  VPC_LANDING_ROUTE,
  VPC_LANDING_TABLE_PREFERENCE_KEY,
} from 'src/features/VPCs/constants';
import { VPC_DOCS_LINK, VPC_LABEL } from 'src/features/VPCs/constants';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { VPCDeleteDialog } from './VPCDeleteDialog';
import { VPCEditDrawer } from './VPCEditDrawer';
import { VPCEmptyState } from './VPCEmptyState';
import { VPCRow } from './VPCRow';

import type { VPC } from '@linode/api-v4/lib/vpcs/types';

const VPCLanding = () => {
  const pagination = usePaginationV2({
    currentRoute: VPC_LANDING_ROUTE,
    preferenceKey: VPC_LANDING_TABLE_PREFERENCE_KEY,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'desc',
        orderBy: 'label',
      },
      from: VPC_LANDING_ROUTE,
    },
    preferenceKey: `${VPC_LANDING_TABLE_PREFERENCE_KEY}-order`,
  });

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

  const navigate = useNavigate();
  const params = useParams({ strict: false });

  const handleEditVPC = (vpc: VPC) => {
    navigate({
      params: { action: 'edit', id: vpc.id },
      to: '/vpcs/$action/$id',
    });
  };

  const handleDeleteVPC = (vpc: VPC) => {
    navigate({
      params: { action: 'delete', id: vpc.id },
      to: '/vpcs/$action/$id',
    });
  };

  const onCloseVPCDrawer = () => {
    navigate({ to: VPC_LANDING_ROUTE });
  };

  const createVPC = () => {
    navigate({ to: VPC_CREATE_ROUTE });
  };

  const isVPCCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_vpcs',
  });

  const { data: selectedVPC, isFetching: isFetchingVPC } = useDialogData({
    enabled: !!params.id,
    paramKey: 'id',
    queryHook: useVPCQuery,
    redirectToOnNotFound: '/placement-groups',
  });

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

  if (vpcs?.data.length === 0) {
    return <VPCEmptyState />;
  }

  return (
    <>
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'VPCs',
          }),
        }}
        createButtonText="Create VPC"
        disabledCreateButton={isVPCCreationRestricted}
        docsLink={VPC_DOCS_LINK}
        onButtonClick={createVPC}
        title={VPC_LABEL}
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
            <TableCell>Subnets</TableCell>
            <Hidden mdDown>
              <TableCell>Linodes</TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {vpcs?.data.map((vpc: VPC) => (
            <VPCRow
              handleDeleteVPC={() => handleDeleteVPC(vpc)}
              handleEditVPC={() => handleEditVPC(vpc)}
              key={vpc.id}
              vpc={vpc}
            />
          ))}
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
      <VPCDeleteDialog
        isFetching={isFetchingVPC}
        onClose={onCloseVPCDrawer}
        open={params.action === 'delete'}
        vpc={selectedVPC}
      />
      <VPCEditDrawer
        isFetching={isFetchingVPC}
        onClose={onCloseVPCDrawer}
        open={params.action === 'edit'}
        vpc={selectedVPC}
      />
    </>
  );
};

export default VPCLanding;
