import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles } from 'src/components/core/styles';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import VlanDetailRow from './VlanDetailRow';
import VlanEntityDetail from './VlanEntityDetail';

const useStyles = makeStyles(() => ({
  table: {
    marginTop: 40
  }
}));

type CombinedProps = RouteComponentProps<{}>;

const VlanDetail: React.FC<CombinedProps> = props => {
  const classes = useStyles();

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
    Component: VlanDetailRow,
    data: [],
    loading: false,
    lastUpdated: 1234,
    error: undefined
  };

  return (
    <React.Fragment>
      <VlanEntityDetail />
      <div className={classes.table}>
        <LandingHeader
          title="Linodes"
          entity="Linode"
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onAddNew={() => {}}
          docsLink=""
        />
        <EntityTable
          entity="vlans"
          groupByTag={false}
          row={vLanRow}
          headers={headers}
          initialOrder={{ order: 'asc', orderBy: 'label' }}
        />
      </div>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(VlanDetail);
