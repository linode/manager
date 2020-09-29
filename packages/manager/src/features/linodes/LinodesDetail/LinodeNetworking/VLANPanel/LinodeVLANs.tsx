import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import Loading from 'src/components/LandingLoading';
import { Props as WithLinodesProps } from 'src/containers/withLinodes.container';
import EntityTable_CMR from 'src/components/EntityTable/EntityTable_CMR';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { getInterfaces } from '@linode/api-v4/lib/linodes/interfaces';
import VlanTableRow from './VlanTableRow';
import withVlans, { Props as VLANProps } from 'src/containers/vlans.container';
import { ActionHandlers as VlanHandlers } from 'src/features/Vlans/VlanLanding/VlanActionMenu';
import RemoveVlanDialog from './RemoveVlanDialog';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';
import { Config } from '@linode/api-v4/lib/linodes';

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

type CombinedProps = VLANProps &
  LinodeContextProps &
  WithLinodesProps &
  RouteProps &
  WithSnackbarProps;

const vlanHeaders = [
  {
    label: 'Label',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 25
  },
  {
    label: 'Address',
    dataColumn: 'address',
    sortable: true,
    widthPercent: 10
  },
  {
    label: 'Interface',
    dataColumn: 'interface',
    sortable: true,
    widthPercent: 5
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
    widthPercent: 35
  }
];

export const LinodeVLANs: React.FC<CombinedProps> = props => {
  const { configs, linodeId } = props;

  const { _loading } = useReduxLoad(['vlans']);

  const { vlans, disconnectVlan } = useVlans();

  const request = useAPIRequest(
    () =>
      getInterfaces(linodeId ?? 0).then(interfaces => {
        return interfaces.data.filter(
          individualInterface =>
            individualInterface.type !== 'default' &&
            individualInterface.ip_address !== ''
        );
      }),
    []
  );

  const { loading, lastUpdated, error } = request;

  const vlanData = React.useMemo(
    () =>
      request.data.map(thisInterface => ({
        ...vlans.itemsById[thisInterface.vlan_id],
        ip_address: thisInterface.ip_address,
        interfaceName: getInterfaceName(thisInterface.id, configs)
      })),
    [request.data, vlans.itemsById, configs]
  );

  const classes = useStyles();

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

  const handleOpenRemoveVlanModal = (id: number, label: string) => {
    openModal(id, label);
  };

  const handlers: VlanHandlers = {
    triggerRemoveVlan: handleOpenRemoveVlanModal
  };

  const vlanRow = {
    handlers,
    Component: VlanTableRow,
    data: vlanData ?? [],
    loading,
    lastUpdated,
    error
  };

  if (loading || _loading) {
    return <Loading shouldDelay />;
  }

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
            onClick={() => null}
            label="Attach a VLAN..."
            disabled={false}
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
        open={modalOpen}
        removeVlan={disconnectVlan}
        selectedVlanID={selectedVlanID}
        selectedVlanLabel={selectedVlanLabel}
        linodeId={linodeId}
        closeDialog={() => toggleModal(false)}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      // openForEdit,
      // openForResize,
      // openForClone,
      // openForCreating,
      // openForConfig
    },
    dispatch
  );

interface LinodeContextProps {
  linodeId: number;
  configs: Config[];
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  configs: linode._configs,
  readOnly: linode._permissions === 'read_only'
}));

const connected = connect(undefined, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  connected,
  linodeContext,
  withVlans<{}, CombinedProps>(),
  withSnackbar
)(LinodeVLANs);

export const getInterfaceName = (
  interfaceID: number,
  configs: Config[]
): string | null => {
  const firstConfig = configs[0];
  for (const [key, value] of Object.entries(firstConfig.interfaces)) {
    if (value?.id === interfaceID) {
      return key;
    }
  }
  return null;
};
