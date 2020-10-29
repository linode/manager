import { Config } from '@linode/api-v4/lib/linodes';
import { VLAN } from '@linode/api-v4/lib/vlans/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityTable_CMR from 'src/components/EntityTable/EntityTable_CMR';
import Grid from 'src/components/Grid';
import Loading from 'src/components/LandingLoading';
import { Props as WithLinodesProps } from 'src/containers/withLinodes.container';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import useInterfaces from 'src/hooks/useInterfaces';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';
import { AttachVlanDrawer } from './AttachVlanDrawer';
import RemoveVlanDialog from './RemoveVlanDialog';
import { ActionHandlers as VlanHandlers } from './VlanActionMenu';
import VlanTableRow from './VlanTableRow';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%'
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem'
  },
  addNewWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
      marginTop: -theme.spacing(1)
    },
    '&.MuiGrid-item': {
      padding: 5
    }
  },
  vlansPanel: {
    marginTop: '20px'
  }
}));

type RouteProps = RouteComponentProps<{ linodeId: string }>;

type CombinedProps = LinodeContextProps &
  WithLinodesProps &
  RouteProps &
  WithSnackbarProps;

const vlanHeaders = [
  {
    label: 'Label',
    dataColumn: 'description',
    sortable: true,
    widthPercent: 20
  },
  {
    label: 'Address',
    dataColumn: 'ip_address',
    sortable: true,
    widthPercent: 10
  },
  {
    label: 'Interface',
    dataColumn: 'interfaceName',
    sortable: true,
    widthPercent: 5
  },
  {
    label: 'Linodes',
    dataColumn: 'linodes',
    sortable: false,
    widthPercent: 55
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 10
  }
];

export const LinodeVLANs: React.FC<CombinedProps> = props => {
  const { configs, linodeId, linodeLabel, linodeRegion, readOnly } = props;

  const classes = useStyles();

  const [removeModalOpen, toggleRemoveModal] = React.useState<boolean>(false);
  const [selectedVlanID, setSelectedVlanID] = React.useState<
    number | undefined
  >(undefined);
  const [selectedVlanLabel, setSelectedVlanLabel] = React.useState<string>('');

  const { vlans, detachVlan } = useVlans();

  const {
    interfaces: reduxInterfacesObject,
    requestInterfaces
  } = useInterfaces();
  const thisLinodeInterfaces = reduxInterfacesObject[linodeId];
  const interfacesList = Object.values(thisLinodeInterfaces?.itemsById ?? {});

  const { _loading } = useReduxLoad(['vlans']);

  // Local state to manage drawer for attaching VLANs.
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [drawerError, setDrawerError] = React.useState<string | null>(null);

  const handleOpenDrawer = () => {
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const vlanData = React.useMemo(
    () =>
      interfacesList
        .map(thisInterface => {
          // The interface is tied to the linode. If the interface has a vlan_id, we want to grab that VLAN from Redux
          const thisVlan = vlans.itemsById[thisInterface.vlan_id];
          if (!thisVlan) {
            return undefined;
          }

          return {
            ...thisVlan,
            ip_address: thisInterface.ip_address,
            interfaceName: getInterfaceName(thisInterface.id, configs),
            currentLinodeId: linodeId,
            readOnly
          };
        })
        .filter(Boolean) as VlanData[],
    [interfacesList, vlans.itemsById, configs, linodeId, readOnly]
  );

  const vlansAvailableForAttaching = getVlansAvailableForAttaching(
    Object.values(vlans.itemsById),
    vlanData,
    linodeRegion
  );

  if (_loading) {
    return <Loading shouldDelay />;
  }

  const handleOpenRemoveVlanModal = (id: number, label: string) => {
    setSelectedVlanID(id);
    setSelectedVlanLabel(label);
    toggleRemoveModal(true);
  };

  const handlers: VlanHandlers = {
    triggerRemoveVlan: handleOpenRemoveVlanModal
  };

  const vlanRow = {
    handlers,
    Component: VlanTableRow,
    data: vlanData ?? [],
    loading: thisLinodeInterfaces?.loading || _loading,
    lastUpdated: thisLinodeInterfaces?.lastUpdated,
    error: thisLinodeInterfaces?.error?.read || vlans.error.read
  };

  return (
    <div className={classes.vlansPanel}>
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        className={classes.root}
      >
        <Grid item className="p0">
          <Typography variant="h3" className={classes.headline}>
            Virtual LANs
          </Typography>
        </Grid>
        <Grid item className={classes.addNewWrapper}>
          <AddNewLink
            onClick={handleOpenDrawer}
            label="Attach a VLAN..."
            disabled={readOnly}
          />
        </Grid>
      </Grid>
      <EntityTable_CMR
        entity="vlan"
        headers={vlanHeaders}
        groupByTag={false}
        row={vlanRow}
        initialOrder={{ order: 'asc', orderBy: 'label' }}
      />
      <RemoveVlanDialog
        open={removeModalOpen}
        removeVlan={detachVlan}
        selectedVlanID={selectedVlanID}
        selectedVlanLabel={selectedVlanLabel}
        linodeId={linodeId}
        closeDialog={() => toggleRemoveModal(false)}
        refreshInterfaces={() => requestInterfaces(linodeId)}
      />
      <AttachVlanDrawer
        open={drawerOpen}
        closeDrawer={() => setDrawerOpen(false)}
        error={drawerError}
        linodeLabel={linodeLabel}
        linodeId={linodeId}
        vlans={vlansAvailableForAttaching}
        readOnly={readOnly}
        refreshInterfaces={() => requestInterfaces(linodeId)}
      />
    </div>
  );
};

interface LinodeContextProps {
  linodeId: number;
  linodeLabel: string;
  linodeRegion: string;
  configs: Config[];
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  linodeLabel: linode.label,
  linodeRegion: linode.region,
  configs: linode._configs,
  readOnly: linode._permissions === 'read_only'
}));

export default compose<CombinedProps, {}>(
  linodeContext,
  withSnackbar
)(LinodeVLANs);

export const getInterfaceName = (
  interfaceID: number,
  configs: Config[]
): string | null => {
  // Loop over the configs to find the matching interface.
  for (let i = 0; i < configs.length; i++) {
    for (const [key, value] of Object.entries(configs[i].interfaces)) {
      if (value?.id === interfaceID) {
        return key;
      }
    }
  }
  return null;
};

const getVlansAvailableForAttaching = (
  vlans: VLAN[],
  vlanData: VlanData[],
  linodeRegion: string
) => {
  const thisLinodeVlanIds = vlanData.map((vlanDatum: VlanData) => vlanDatum.id); // Get array of IDs of VLANs attached to this linode.

  return vlans.filter(
    (vlanItem: VLAN) =>
      !thisLinodeVlanIds.includes(vlanItem.id) &&
      vlanItem.region === linodeRegion
  );
};

export interface VlanData extends VLAN {
  ip_address: string;
  interfaceName: string | null;
  currentLinodeId: number;
  readOnly: boolean;
}
