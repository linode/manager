import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import VLanRow from './VLanRow';
import { VLANFactory } from 'src/factories/vlans';

type CombinedProps = RouteComponentProps<{}>;

const VlanLanding: React.FC<CombinedProps> = () => {
  const vlans = VLANFactory.buildList(10);

  const headers = [
    {
      label: 'Label',
      dataColumn: 'label',
      sortable: true,
      widthPercent: 15
    },
    {
      label: 'Region',
      dataColumn: 'region',
      sortable: true,
      widthPercent: 15
    },
    {
      label: 'Linodes',
      dataColumn: 'linodes',
      sortable: false,
      widthPercent: 25
    },
    {
      label: 'Action Menu',
      visuallyHidden: true,
      dataColumn: '',
      sortable: false,
      widthPercent: 5
    }
  ];

  const vLanRow = {
    Component: VLanRow,
    data: Object.values(vlans) ?? [],
    loading: false,
    lastUpdated: 1234,
    error: undefined
  };

  const addNew = () => alert('You just created a vlan!');

  return (
    <React.Fragment>
      <LandingHeader
        title="Virtual LANS"
        entity="VLAN"
        onAddNew={addNew}
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
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(VlanLanding);
