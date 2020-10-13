/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import { makeStyles } from 'src/components/core/styles';
import EntityHeader from 'src/components/EntityHeader';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import useVlans from 'src/hooks/useVlans';
import AttachVLANDrawer from '../AttachVLANDrawer';
import VlanDetailRow from './VlanDetailRow';
import VlanEntityDetail from './VlanEntityDetail';

const useStyles = makeStyles(() => ({
  link: {
    marginRight: -11
  }
}));

type CombinedProps = RouteComponentProps<{}>;

const VlanDetail: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { vlans, requestVLANs } = useVlans();
  const randomVlan = Object.values(vlans.itemsById)[0];

  React.useEffect(() => {
    requestVLANs();
  }, []);

  if (vlans.lastUpdated === 0) {
    return null;
  }

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

  return (
    <React.Fragment>
      <VlanEntityDetail openTagDrawer={() => {}} />
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
      <AttachVLANDrawer
        onClose={() => null}
        isOpen={true}
        vlanID={randomVlan.id}
        linodes={randomVlan.linodes}
        region={randomVlan.region}
      />
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(React.memo)(VlanDetail);
