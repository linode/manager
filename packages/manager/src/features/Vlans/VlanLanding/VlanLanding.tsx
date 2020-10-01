import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import { vlanContext } from 'src/context';
import VLanRow from './VLanRow';

type CombinedProps = RouteComponentProps<{}>;

const VlanLanding: React.FC<CombinedProps> = props => {
  const context = React.useContext(vlanContext);
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
      widthPercent: 25,
      hideOnMobile: true
    },
    {
      label: 'Tags',
      dataColumn: 'tags',
      sortable: false,
      widthPercent: 40,
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

  const vLanRow = {
    Component: VLanRow,
    data: [],
    loading: false,
    lastUpdated: 1234,
    error: undefined
  };

  return (
    <React.Fragment>
      <LandingHeader
        title="Virtual LANS"
        entity="VLAN"
        // TODO add vlan to type list
        iconType="linode"
        docsLink="http://google.com"
        onAddNew={context.open}
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
