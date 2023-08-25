import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useFirewallsQuery } from 'src/queries/firewalls';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CreateFirewallDrawer } from './CreateFirewallDrawer';
import { ActionHandlers as FirewallHandlers } from './FirewallActionMenu';
import { FirewallDialog, Mode } from './FirewallDialog';
import { FirewallLandingEmptyState } from './FirewallLandingEmptyState';
import { FirewallRow } from './FirewallRow';

const preferenceKey = 'firewalls';

const FirewallLanding = () => {
  const location = useLocation();
  const history = useHistory();
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

  const [selectedFirewallId, setSelectedFirewallId] = React.useState<
    number | undefined
  >(undefined);

  const selectedFirewall = data?.data.find(
    (firewall) => firewall.id === selectedFirewallId
  );

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
    history.replace('/firewalls/create');
  };

  const onCloseCreateDrawer = () => {
    history.replace('/firewalls');
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
        <ProductInformationBanner bannerLocation="Firewalls" />
        <FirewallLandingEmptyState openAddFirewallDrawer={onOpenCreateDrawer} />
        <CreateFirewallDrawer
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
      <ProductInformationBanner bannerLocation="Firewalls" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/firewalls' }}
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
        entity="Firewall"
        onButtonClick={onOpenCreateDrawer}
        title="Firewalls"
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
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableCell>Rules</TableCell>
              <TableCell>Linodes</TableCell>
            </Hidden>
            <TableCell></TableCell>
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
        onClose={onCloseCreateDrawer}
        open={isCreateFirewallDrawerOpen}
      />
      <FirewallDialog
        mode={dialogMode}
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
        selectedFirewallID={selectedFirewallId}
        selectedFirewallLabel={selectedFirewall?.label ?? ''}
      />
    </React.Fragment>
  );
};

export default React.memo(FirewallLanding);
