import { useFirewallsQuery } from '@linode/queries';
import { Button, CircleProgress, ErrorState, Hidden } from '@linode/ui';
import { useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { GenerateFirewallDialog } from 'src/components/GenerateFirewallDialog/GenerateFirewallDialog';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CreateFirewallDrawer } from './CreateFirewallDrawer';
import { FirewallDialog } from './FirewallDialog';
import { FirewallLandingEmptyState } from './FirewallLandingEmptyState';
import { FirewallRow } from './FirewallRow';

import type { ActionHandlers as FirewallHandlers } from './FirewallActionMenu';
import type { Mode } from './FirewallDialog';

const preferenceKey = 'firewalls';

const FirewallLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pagination = usePagination(1, preferenceKey);
  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const params = {
    page: pagination.page,
    page_size: pagination.pageSize,
  };

  const { data, error, isLoading } = useFirewallsQuery(params, filter);

  const isCreateFirewallDrawerOpen = location.pathname.endsWith('create');

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [dialogMode, setDialogMode] = React.useState<Mode>('enable');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false);

  const flags = useFlags();
  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();

  const [selectedFirewallId, setSelectedFirewallId] = React.useState<
    number | undefined
  >(undefined);

  const selectedFirewall = data?.data.find(
    (firewall) => firewall.id === selectedFirewallId
  );

  const { permissions } = usePermissions('account', ['create_firewall']);

  const openModal = (mode: Mode, id: number) => {
    setSelectedFirewallId(id);
    setDialogMode(mode);
    setIsModalOpen(true);
  };

  const handleOpenDeleteFirewallModal = (id: number) => {
    openModal('delete', id);
  };

  const handleOpenEnableFirewallModal = (id: number) => {
    openModal('enable', id);
  };

  const handleOpenDisableFirewallModal = (id: number) => {
    openModal('disable', id);
  };

  const onOpenCreateDrawer = () => {
    navigate({ to: '/firewalls/create' });
  };

  const onCloseCreateDrawer = () => {
    navigate({ to: '/firewalls' });
  };

  const handlers: FirewallHandlers = {
    triggerDeleteFirewall: handleOpenDeleteFirewallModal,
    triggerDisableFirewall: handleOpenDisableFirewallModal,
    triggerEnableFirewall: handleOpenEnableFirewallModal,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return (
      <>
        <FirewallLandingEmptyState openAddFirewallDrawer={onOpenCreateDrawer} />
        <CreateFirewallDrawer
          createFlow={undefined}
          onClose={onCloseCreateDrawer}
          open={isCreateFirewallDrawerOpen}
        />
      </>
    );
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your Firewalls.')[0].reason
        }
      />
    );
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment
        segment={`${
          isCreateFirewallDrawerOpen ? 'Create a Firewall' : 'Firewall'
        }`}
      />
      <LandingHeader
        breadcrumbProps={{ pathname: '/firewalls' }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Firewalls',
          }),
        }}
        disabledCreateButton={!permissions.create_firewall}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-cloud-firewalls"
        entity="Firewall"
        extraActions={
          secureVMNoticesEnabled && flags.secureVmCopy?.generateActionText ? (
            <Button
              buttonType="secondary"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              {flags.secureVmCopy.generateActionText}
            </Button>
          ) : undefined
        }
        onButtonClick={onOpenCreateDrawer}
        title="Firewalls"
      />
      <Table aria-label="List of services attached to each firewall">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
              sx={{ width: '20%' }}
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
              sx={{ width: '10%' }}
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableCell sx={{ width: '15%' }}>Rules</TableCell>
              <TableCell sx={{ width: '45%' }}>Services</TableCell>
            </Hidden>
            <TableCell sx={{ width: '10%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((firewall) => (
            <FirewallRow key={firewall.id} {...firewall} {...handlers} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="Firewalls Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <CreateFirewallDrawer
        createFlow={undefined}
        onClose={onCloseCreateDrawer}
        open={isCreateFirewallDrawerOpen}
      />
      {selectedFirewall && (
        <FirewallDialog
          mode={dialogMode}
          onClose={() => setIsModalOpen(false)}
          open={isModalOpen}
          selectedFirewall={selectedFirewall}
        />
      )}
      <GenerateFirewallDialog
        onClose={() => setIsGenerateDialogOpen(false)}
        open={isGenerateDialogOpen}
      />
    </React.Fragment>
  );
};

export default React.memo(FirewallLanding);
