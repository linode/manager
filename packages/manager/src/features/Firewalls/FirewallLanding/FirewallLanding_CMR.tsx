import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import withFirewalls, {
  Props as FireProps
} from 'src/containers/firewalls.container';
import AddFirewallDrawer from './AddFirewallDrawer';
import { ActionHandlers as FirewallHandlers } from './FirewallActionMenu_CMR';
import FirewallDialog, { Mode } from './FirewallDialog';
import FirewallRow from './FirewallRow_CMR';

type CombinedProps = RouteComponentProps<{}> & FireProps;

const FirewallLanding: React.FC<CombinedProps> = props => {
  const { deleteFirewall, disableFirewall, enableFirewall } = props;

  const [addFirewallDrawerOpen, toggleAddFirewallDrawer] = React.useState<
    boolean
  >(false);
  const [modalOpen, toggleModal] = React.useState<boolean>(false);
  const [dialogMode, setDialogMode] = React.useState<Mode>('enable');
  const [selectedFirewallID, setSelectedFirewallID] = React.useState<
    number | undefined
  >(undefined);
  const [selectedFirewallLabel, setSelectedFirewallLabel] = React.useState<
    string
  >('');

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

  const {
    itemsById: firewalls,
    loading: firewallsLoading,
    error: firewallsError,
    lastUpdated: firewallsLastUpdated
  } = props;

  const headers = [
    {
      label: 'Firewall',
      dataColumn: 'label',
      sortable: true,
      widthPercent: 25
    },
    {
      label: 'Status',
      dataColumn: 'status',
      sortable: true,
      widthPercent: 15
    },
    {
      label: 'Rules',
      dataColumn: 'rules',
      sortable: false,
      widthPercent: 25,
      hideOnMobile: true
    },
    {
      label: 'Linodes',
      dataColumn: 'devices',
      sortable: false,
      widthPercent: 25,
      hideOnMobile: true
    },
    {
      label: 'Action Menu',
      visuallyHidden: true,
      dataColumn: '',
      sortable: false,
      widthPercent: 5
    }
  ];

  const handlers: FirewallHandlers = {
    triggerEnableFirewall: handleOpenEnableFirewallModal,
    triggerDisableFirewall: handleOpenDisableFirewallModal,
    triggerDeleteFirewall: handleOpenDeleteFirewallModal
  };

  const firewallRow = {
    handlers,
    Component: FirewallRow,
    data: Object.values(firewalls) ?? [],
    loading: firewallsLoading,
    lastUpdated: firewallsLastUpdated,
    error: firewallsError.read
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Firewalls"
        entity="Firewall"
        onAddNew={() => toggleAddFirewallDrawer(true)}
        iconType="firewall"
        // This guide is not yet published and will 404
        // It will be published prior to any public beta
        docsLink="https://linode.com/docs/platform/cloud-firewall/getting-started-with-cloud-firewall/"
      />
      <EntityTable
        entity="firewall"
        groupByTag={false}
        row={firewallRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'domain' }}
      />
      <AddFirewallDrawer
        open={addFirewallDrawerOpen}
        onClose={() => toggleAddFirewallDrawer(false)}
        onSubmit={props.createFirewall}
        title="Add a Firewall"
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

export default compose<CombinedProps, {}>(
  React.memo,
  withFirewalls<{}, CombinedProps>()
)(FirewallLanding);
