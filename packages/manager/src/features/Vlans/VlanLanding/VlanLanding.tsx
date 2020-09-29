import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import VLanRow from './VLanRow';
import withVlans, { Props as VLANProps } from 'src/containers/vlans.container';
import { ActionHandlers as VlanHandlers } from './VlanActionMenu';
import VlanDialog from './VlanDialog';

type CombinedProps = RouteComponentProps<{}> & VLANProps;

const VlanLanding: React.FC<CombinedProps> = props => {
  const { deleteVlan } = props;

  const [modalOpen, toggleModal] = React.useState<boolean>(false);
  const [selectedVlanID, setSelectedVlanID] = React.useState<
    number | undefined
  >(undefined);
  const [selectedVlanLabel, setSelectedVlanLabel] = React.useState<string>('');

  const openModal = (id: number, label: string) => {
    setSelectedVlanID(id);
    setSelectedVlanLabel(label);
    toggleModal(true);
  };

  const handleOpenDeleteVlanModal = (id: number, label: string) => {
    openModal(id, label);
  };

  const {
    itemsById: vlans,
    loading: vlansLoading,
    error: vlansError,
    lastUpdated: vlansLastUpdated
  } = props;

  const headers = [
    {
      label: 'Label',
      dataColumn: 'label',
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
    Component: VLanRow,
    data: Object.values(vlans) ?? [],
    loading: vlansLoading,
    lastUpdated: vlansLastUpdated,
    error: vlansError.read
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Virtual LANs"
        entity="VLAN"
        //onAddNew={addNew}
        // TODO add vlan to type list
        iconType="linode"
        docsLink="http://google.com"
        headerOnly
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
        deleteVlan={deleteVlan}
        selectedVlanID={selectedVlanID}
        selectedVlanLabel={selectedVlanLabel}
        closeDialog={() => toggleModal(false)}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  React.memo,
  withVlans<{}, CombinedProps>()
)(VlanLanding);
