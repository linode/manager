import { CircleProgress, ErrorState } from '@linode/ui';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

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
import { VPC_DOCS_LINK, VPC_LABEL } from 'src/features/VPCs/constants';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useVPCsQuery } from 'src/queries/vpcs/vpcs';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { VPCDeleteDialog } from './VPCDeleteDialog';
import { VPCEditDrawer } from './VPCEditDrawer';
import { VPCEmptyState } from './VPCEmptyState';
import { VPCRow } from './VPCRow';

import type { VPC } from '@linode/api-v4/lib/vpcs/types';

const preferenceKey = 'vpcs';
const VPC_CREATE_ROUTE = 'vpcs/create';

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

  const history = useHistory();

  const [selectedVPC, setSelectedVPC] = React.useState<VPC | undefined>();

  const [editVPCDrawerOpen, setEditVPCDrawerOpen] = React.useState(false);
  const [deleteVPCDialogOpen, setDeleteVPCDialogOpen] = React.useState(false);

  const handleEditVPC = (vpc: VPC) => {
    setSelectedVPC(vpc);
    setEditVPCDrawerOpen(true);
  };

  const handleDeleteVPC = (vpc: VPC) => {
    setSelectedVPC(vpc);
    setDeleteVPCDialogOpen(true);
  };

  const createVPC = () => {
    history.push(VPC_CREATE_ROUTE);
  };

  const isVPCCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_vpcs',
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
        id={selectedVPC?.id}
        label={selectedVPC?.label}
        onClose={() => setDeleteVPCDialogOpen(false)}
        open={deleteVPCDialogOpen}
      />
      <VPCEditDrawer
        onClose={() => setEditVPCDrawerOpen(false)}
        open={editVPCDrawerOpen}
        vpc={selectedVPC}
      />
    </>
  );
};

export const vpcLandingLazyRoute = createLazyRoute('/')({
  component: VPCLanding,
});

export default VPCLanding;
