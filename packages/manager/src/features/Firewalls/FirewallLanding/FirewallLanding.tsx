import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import LandingHeader from 'src/components/LandingHeader';
import { useFirewallsQuery } from 'src/queries/firewalls';
import CreateFirewallDrawer from './CreateFirewallDrawer';
import { ActionHandlers as FirewallHandlers } from './FirewallActionMenu';
import FirewallDialog, { Mode } from './FirewallDialog';
import FirewallEmptyState from './FirewallEmptyState';
import FirewallRow from './FirewallRow';
import { usePagination } from 'src/hooks/usePagination';
import { useOrder } from 'src/hooks/useOrder';
import ErrorState from 'src/components/ErrorState/ErrorState';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import Table from 'src/components/Table/Table';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import TableCell from 'src/components/TableCell/TableCell';
import TableBody from 'src/components/core/TableBody';
import Hidden from 'src/components/core/Hidden';

export const headers = [
  {
    label: 'Firewall',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 25,
  },
  {
    label: 'Status',
    dataColumn: 'status',
    sortable: true,
    widthPercent: 15,
  },
  {
    label: 'Rules',
    dataColumn: 'rules',
    sortable: false,
    widthPercent: 25,
    hideOnMobile: true,
  },
  {
    label: 'Linodes',
    dataColumn: 'devices',
    sortable: false,
    widthPercent: 25,
    hideOnMobile: true,
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 5,
  },
];

const preferenceKey = 'firewalls';

const FirewallLanding = () => {
  const pagination = usePagination(1, preferenceKey);
  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'asc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const params = {
    page: pagination.page,
    page_size: pagination.pageSize,
  };

  const { data, isLoading, error } = useFirewallsQuery(params, filter);

  const [
    isCreateFirewallDrawerOpen,
    setIsCreateFirewallDrawerOpen,
  ] = React.useState<boolean>(false);

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

  const onOpenCreateDrawer = React.useCallback(
    () => setIsCreateFirewallDrawerOpen(true),
    [setIsCreateFirewallDrawerOpen]
  );

  // On-the-fly route matching so this component can open the drawer itself.
  const createFirewallRouteMatch = Boolean(useRouteMatch('/firewalls/create'));

  React.useEffect(() => {
    if (createFirewallRouteMatch) {
      onOpenCreateDrawer();
    }
  }, [createFirewallRouteMatch, onOpenCreateDrawer]);

  const { replace } = useHistory();

  const closeDrawer = React.useCallback(() => {
    setIsCreateFirewallDrawerOpen(false);
    replace('/firewalls');
  }, [setIsCreateFirewallDrawerOpen, replace]);

  const handlers: FirewallHandlers = {
    triggerEnableFirewall: handleOpenEnableFirewallModal,
    triggerDisableFirewall: handleOpenDisableFirewallModal,
    triggerDeleteFirewall: handleOpenDeleteFirewallModal,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return (
      <>
        <FirewallEmptyState openAddFirewallDrawer={onOpenCreateDrawer} />
        <CreateFirewallDrawer
          open={isCreateFirewallDrawerOpen}
          onClose={() => setIsCreateFirewallDrawerOpen(false)}
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
      <LandingHeader
        title="Firewalls"
        entity="Firewall"
        breadcrumbProps={{ pathname: '/firewalls' }}
        onButtonClick={onOpenCreateDrawer}
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
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
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
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
      <CreateFirewallDrawer
        open={isCreateFirewallDrawerOpen}
        onClose={closeDrawer}
      />
      <FirewallDialog
        open={isModalOpen}
        mode={dialogMode}
        selectedFirewallID={selectedFirewallId}
        selectedFirewallLabel={selectedFirewall?.label ?? ''}
        onClose={() => setIsModalOpen(false)}
      />
    </React.Fragment>
  );
};

export default React.memo(FirewallLanding);
