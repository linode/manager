/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles } from 'src/components/core/styles';
import EntityHeader from 'src/components/EntityHeader';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
import NotFound from 'src/components/NotFound';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';
import VlanDetailRow from './VlanDetailRow';
import VlanEntityDetail from './VlanEntityDetail';

type CombinedProps = RouteComponentProps<{ id: string }>;

const useStyles = makeStyles(() => ({
  link: {
    marginRight: -11
  }
}));

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
      label: 'Status',
      dataColumn: 'status',
      sortable: true,
      widthPercent: 15
    },
    {
      label: 'VLAN IP',
      dataColumn: 'ip',
      sortable: true,
      widthPercent: 15,
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
      widthPercent: 15
    }
  ];

  const vLanRow = {
    Component: VlanDetailRow,
    data: [],
    loading: false,
    lastUpdated: 1234,
    error: undefined
  };

  const { vlans } = useVlans();
  useReduxLoad(['vlans']);

  // Source the VLAN's ID from the /:id path param.
  const thisVlanID = props.match.params.id;

  // Find the VLAN in the store.
  const thisVlan = vlans.itemsById[thisVlanID];

  if (vlans.error.read) {
    return (
      <ErrorState errorText="There was a problem retrieving your VLAN. Please try again." />
    );
  }

  if (vlans.lastUpdated === 0 && !thisVlan) {
    return <CircleProgress />;
  }

  if (!thisVlan) {
    return <NotFound />;
  }

  return (
    <React.Fragment>
      <VlanEntityDetail vlan={thisVlan} openTagDrawer={() => {}} />
      <div style={{ marginTop: 20 }}>
        <EntityHeader
          title="Linodes"
          isSecondary
          actions={
            <AddNewLink
              className={classes.link}
              label="Add a Linode..."
              onClick={() => {}}
            />
          }
        />
        <EntityTable
          entity="linodes"
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
