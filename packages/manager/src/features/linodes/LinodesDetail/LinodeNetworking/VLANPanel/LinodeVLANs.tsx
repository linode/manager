import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
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
import { ActionHandlers as VlanHandlers } from './VlanActionMenu';
import RemoveVlanDialog from './RemoveVlanDialog';
import useReduxLoad from 'src/hooks/useReduxLoad';
import useVlans from 'src/hooks/useVlans';
import { Config, LinodeInterface } from '@linode/api-v4/lib/linodes';
import useFlags from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import useAccountManagement from 'src/hooks/useAccountManagement';
import { APIError } from '@linode/api-v4/lib/types';
import { VLAN } from '@linode/api-v4/lib/vlans/types';

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
  const { configs, linodeId, readOnly } = props;

  const classes = useStyles();

  const [removeModalOpen, toggleRemoveModal] = React.useState<boolean>(false);
  const [selectedVlanID, setSelectedVlanID] = React.useState<
    number | undefined
  >(undefined);
  const [selectedVlanLabel, setSelectedVlanLabel] = React.useState<string>('');

  // Local state to manage requested interfaces.
  const [interfaceData, setInterfaceData] = React.useState<LinodeInterface[]>(
    []
  );
  const [interfaceRequestError, setInterfaceRequestError] = React.useState<
    APIError[] | undefined
  >(undefined);
  const [interfaceDataLoading, setInterfaceDataLoading] = React.useState<
    boolean
  >(false);
  const [interfacesLastUpdated, setInterfacesLastUpdated] = React.useState<
    number
  >(0);

  const { vlans, disconnectVlan } = useVlans();

  const { account } = useAccountManagement();
  const flags = useFlags();

  const vlansEnabled = isFeatureEnabled(
    'Vlans',
    Boolean(flags.vlans),
    account?.data?.capabilities ?? []
  );

  const { _loading } = useReduxLoad(['vlans'], undefined, vlansEnabled);

  const requestInterfaces = React.useCallback(() => {
    setInterfaceDataLoading(true);
    setInterfaceRequestError(undefined);

    getInterfaces(linodeId)
      .then(interfaces => {
        const privateInterfaces = interfaces.data.filter(
          individualInterface =>
            individualInterface.type !== 'default' &&
            individualInterface.ip_address !== ''
        );

        setInterfaceData(privateInterfaces);
        setInterfacesLastUpdated(Date.now());
        setInterfaceDataLoading(false);
      })
      .catch(err => {
        setInterfaceRequestError(err);
        setInterfaceDataLoading(false);
      });
  }, [linodeId]);

  React.useEffect(() => {
    // Request interfaces upon page first loading.
    if (vlansEnabled && interfacesLastUpdated === 0) {
      requestInterfaces();
    }
  }, [vlansEnabled, interfacesLastUpdated, requestInterfaces, linodeId]);

  const vlanData = React.useMemo<(VlanData | undefined)[]>(
    () =>
      interfaceData
        .map(thisInterface => {
          const thisVlan = vlans.itemsById[thisInterface.vlan_id];

          if (thisVlan) {
            return {
              ...thisVlan,
              ip_address: thisInterface.ip_address,
              interfaceName: getInterfaceName(thisInterface.id, configs),
              currentLinode: linodeId,
              readOnly
            };
          } else {
            return undefined;
          }
        })
        .filter(Boolean),
    [interfaceData, vlans.itemsById, configs, linodeId, readOnly]
  );

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
    loading: interfaceDataLoading,
    lastUpdated: interfacesLastUpdated,
    error: interfaceRequestError || vlans.error.read
  };

  if (interfaceDataLoading || _loading) {
    return <Loading shouldDelay />;
  }

  return vlansEnabled ? (
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
        removeVlan={disconnectVlan}
        selectedVlanID={selectedVlanID}
        selectedVlanLabel={selectedVlanLabel}
        linodeId={linodeId}
        closeDialog={() => toggleRemoveModal(false)}
        resetInterfaces={requestInterfaces}
      />
    </div>
  ) : null;
};

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

interface VlanData extends VLAN {
  ip_address: string;
  interfaceName: string | null;
  currentLinode: number;
  readOnly: boolean;
}
