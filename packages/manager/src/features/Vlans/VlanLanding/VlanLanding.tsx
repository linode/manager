import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import withVLANs, { Props as VLANProps } from 'src/containers/vlans.container';
import { vlanContext } from 'src/context';
import VlanRow from './VlanRow';
import { ActionHandlers as VlanHandlers } from './VlanActionMenu';
import VlanDialog from './VlanDialog';
import useVlans from 'src/hooks/useVlans';
import useReduxLoad from 'src/hooks/useReduxLoad';

type CombinedProps = RouteComponentProps<{}> & VLANProps;

const VlanLanding: React.FC<CombinedProps> = () => {
  const { vlans } = useVlans();
  const context = React.useContext(vlanContext);

  useReduxLoad(['vlans']);

  const [modalOpen, toggleModal] = React.useState<boolean>(false);
  const [selectedVlanID, setSelectedVlanID] = React.useState<
    number | undefined
  >(undefined);
  const [selectedVlanLabel, setSelectedVlanLabel] = React.useState<string>('');

  const handleOpenDeleteVlanModal = (id: number, label: string) => {
    setSelectedVlanID(id);
    setSelectedVlanLabel(label);
    toggleModal(true);
  };

  const headers = [
    {
      label: 'Label',
      dataColumn: 'description',
      sortable: true,
      widthPercent: 10
    },
    {
      label: 'Region',
      dataColumn: 'region',
      sortable: true,
      widthPercent: 10
    },
    {
      label: 'Linodes',
      dataColumn: 'linodes',
      sortable: false,
      widthPercent: 15
    },
    {
      label: 'Action Menu',
      visuallyHidden: true,
      dataColumn: '',
      sortable: false,
      widthPercent: 5
    }
  ];

  const handlers: VlanHandlers = {
    triggerDeleteVlan: handleOpenDeleteVlanModal
  };

  const vLanRow = {
    handlers,
    Component: VlanRow,
    data: Object.values(vlans.itemsById) ?? [],
    loading: vlans.loading,
    lastUpdated: vlans.lastUpdated,
    error: vlans.error.read
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Virtual LANs"
        entity="VLAN"
        iconType="linode"
        docsLink="http://google.com"
        headerOnly
        onAddNew={context.open}
      />
      <EntityTable
        entity="vlans"
        groupByTag={false}
        row={vLanRow}
        headers={headers}
        initialOrder={{ order: 'asc', orderBy: 'label' }}
      />
      <VlanDialog
        open={modalOpen}
        selectedVlanID={selectedVlanID}
        selectedVlanLabel={selectedVlanLabel}
        closeDialog={() => toggleModal(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withVLANs<{}, CombinedProps>()
)(VlanLanding);
