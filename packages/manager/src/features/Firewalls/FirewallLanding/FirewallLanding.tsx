import * as React from 'react';
import {
  RouteComponentProps,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import EntityTable from 'src/components/EntityTable';
import LandingHeader from 'src/components/LandingHeader';
import {
  useCreateFirewall,
  useDeleteFirewall,
  useFirewallQuery,
  useMutateFirewall,
} from 'src/queries/firewalls';
import AddFirewallDrawer from './AddFirewallDrawer';
import { ActionHandlers as FirewallHandlers } from './FirewallActionMenu';
import FirewallDialog, { Mode } from './FirewallDialog';
import FirewallEmptyState from './FirewallEmptyState';
import FirewallRow from './FirewallRow';

type CombinedProps = RouteComponentProps<{}>;

const FirewallLanding: React.FC<CombinedProps> = () => {
  const { data, isLoading, error, dataUpdatedAt } = useFirewallQuery();

  // @TODO: Refactor so these are combined?
  const { mutateAsync: updateFirewall } = useMutateFirewall();
  const { mutateAsync: _deleteFirewall } = useDeleteFirewall();
  const { mutateAsync: createFirewall } = useCreateFirewall();

  const [
    addFirewallDrawerOpen,
    toggleAddFirewallDrawer,
  ] = React.useState<boolean>(false);
  const [modalOpen, toggleModal] = React.useState<boolean>(false);
  const [dialogMode, setDialogMode] = React.useState<Mode>('enable');
  const [selectedFirewallID, setSelectedFirewallID] = React.useState<
    number | undefined
  >(undefined);
  const [
    selectedFirewallLabel,
    setSelectedFirewallLabel,
  ] = React.useState<string>('');

  const enableFirewall = (id: number) => {
    return updateFirewall({ id, payload: { status: 'enabled' } });
  };

  const disableFirewall = (id: number) => {
    return updateFirewall({ id, payload: { status: 'disabled' } });
  };

  const deleteFirewall = (id: number) => {
    return _deleteFirewall({ id });
  };

  const openModal = (mode: Mode, id: number, label: string) => {
    setSelectedFirewallID(id);
    setSelectedFirewallLabel(label);
    setDialogMode(mode);
    toggleModal(true);
  };

  const handleOpenDeleteFirewallModal = (id: number, label: string) => {
    openModal('delete', id, label);
  };

  const handleOpenEnableFirewallModal = (id: number, label: string) => {
    openModal('enable', id, label);
  };

  const handleOpenDisableFirewallModal = (id: number, label: string) => {
    openModal('disable', id, label);
  };

  const headers = [
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

  const openDrawer = React.useCallback(() => toggleAddFirewallDrawer(true), [
    toggleAddFirewallDrawer,
  ]);

  // On-the-fly route matching so this component can open the drawer itself.
  const createFirewallRouteMatch = Boolean(useRouteMatch('/firewalls/create'));

  React.useEffect(() => {
    if (createFirewallRouteMatch) {
      openDrawer();
    }
  }, [createFirewallRouteMatch, openDrawer]);

  const { replace } = useHistory();

  const closeDrawer = React.useCallback(() => {
    toggleAddFirewallDrawer(false);
    replace('/firewalls');
  }, [toggleAddFirewallDrawer, replace]);

  const handlers: FirewallHandlers = {
    triggerEnableFirewall: handleOpenEnableFirewallModal,
    triggerDisableFirewall: handleOpenDisableFirewallModal,
    triggerDeleteFirewall: handleOpenDeleteFirewallModal,
  };

  const firewallArray = Object.values(data ?? {});

  if (isLoading) {
    return <CircleProgress />;
  }

  // We'll fall back to showing a request error in the EntityTable
  if (firewallArray.length === 0 && !error) {
    return (
      // Some repetition here, which we need to resolve separately
      // (move the create form to /firewalls/create, or as a top
      // level drawer).
      <>
        <FirewallEmptyState openAddFirewallDrawer={openDrawer} />
        <AddFirewallDrawer
          open={addFirewallDrawerOpen}
          onClose={() => toggleAddFirewallDrawer(false)}
          onSubmit={createFirewall}
          title="Create Firewall"
        />
      </>
    );
  }

  const firewallRow = {
    handlers,
    Component: FirewallRow,
    data: firewallArray,
    loading: isLoading,
    lastUpdated: dataUpdatedAt,
    error: error ?? undefined,
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Firewalls"
        entity="Firewall"
        breadcrumbProps={{ pathname: '/firewalls' }}
        onAddNew={openDrawer}
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
      />
      <EntityTable
        entity="firewall"
        row={firewallRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'domain' }}
      />
      <AddFirewallDrawer
        open={addFirewallDrawerOpen}
        onClose={closeDrawer}
        onSubmit={createFirewall}
        title="Create Firewall"
      />
      <FirewallDialog
        open={modalOpen}
        mode={dialogMode}
        enableFirewall={enableFirewall}
        disableFirewall={disableFirewall}
        deleteFirewall={deleteFirewall}
        selectedFirewallID={selectedFirewallID}
        selectedFirewallLabel={selectedFirewallLabel}
        closeDialog={() => toggleModal(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(FirewallLanding);
