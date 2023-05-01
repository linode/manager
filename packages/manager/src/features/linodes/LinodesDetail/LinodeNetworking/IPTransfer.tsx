import { assignAddresses, IPRange } from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import {
  both,
  compose,
  equals,
  isNil,
  lensPath,
  over,
  set,
  uniq,
  view,
  when,
} from 'ramda';
import * as React from 'react';
import { StyledActionPanel } from 'src/components/ActionsPanel/ActionsPanel';
import Button from 'src/components/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { Dialog } from 'src/components/Dialog/Dialog';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from '@mui/material/Unstable_Grid2';
import Notice from 'src/components/Notice';
import usePrevious from 'src/hooks/usePrevious';
import { ipv6RangeQueryKey } from 'src/queries/networking';
import {
  queryKey as linodesQueryKey,
  useAllLinodesQuery,
} from 'src/queries/linodes/linodes';
import { useIpv6RangesQuery } from 'src/queries/networking';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { debounce } from 'throttle-debounce';
import { useQueryClient } from 'react-query';

const useStyles = makeStyles((theme: Theme) => ({
  sourceIPWrapper: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  ipField: {
    marginTop: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 175,
    },
  },
  ipFieldLabel: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: `calc(175px + ${theme.spacing(2)})`,
    },
  },
  actionsLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  autoGridsm: {
    minWidth: 175,
    [theme.breakpoints.up('sm')]: {
      maxWidth: 'auto',
      flexBasis: 'auto',
    },
  },
  networkActionText: {
    marginBottom: theme.spacing(2),
  },
  emptyStateText: {
    marginTop: theme.spacing(2),
    color: theme.color.grey1,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface Props {
  linodeID: number;
  linodeRegion: string;
  ipAddresses: string[];
  readOnly?: boolean;
  refreshIPs: () => Promise<void>[];
  open: boolean;
  onClose: () => void;
}

type IPStates = NoAction | Swap | Move;

interface IPRowState {
  [x: string]: IPStates;
}

type Mode = 'none' | 'swap' | 'move';

interface NoAction {
  mode: Mode;
  sourceIP: string;
  sourceIPsLinodeID: number;
}

interface Move extends NoAction {
  selectedLinodeID: number;
}

interface Swap extends Move {
  selectedIP: string;
  selectedLinodesIPs: string[];
}

type CombinedProps = Props;

const defaultState = (
  sourceIP: string,
  sourceIPsLinodeID: number
): NoAction => ({
  mode: 'none',
  sourceIP,
  sourceIPsLinodeID,
});

export const getLinodeIPv6Ranges = (
  ipv6RangesData: IPRange[] | undefined,
  ipv6: string | null
) => {
  return (
    ipv6RangesData
      ?.filter(
        (ipv6RangeData) =>
          ipv6RangeData.route_target === ipv6?.substring(0, ipv6.indexOf('/'))
      )
      .map(
        (ipv6RangeData) => `${ipv6RangeData.range}/${ipv6RangeData.prefix}`
      ) ?? []
  );
};

const LinodeNetworkingIPTransferPanel: React.FC<CombinedProps> = (props) => {
  const {
    ipAddresses,
    linodeID,
    linodeRegion,
    open,
    onClose,
    readOnly,
  } = props;
  const classes = useStyles();
  const queryClient = useQueryClient();
  const [ips, setIPs] = React.useState<IPRowState>(
    props.ipAddresses.reduce(
      (acc, ip) => ({
        ...acc,
        [ip]: defaultState(ip, linodeID),
      }),
      {}
    )
  );
  const [error, setError] = React.useState<APIError[] | undefined>(undefined);
  const [successMessage, setSuccessMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');

  React.useEffect(() => {
    // Not using onReset here because we don't want to reset the IPs.
    // User may want to keep their selection after closing the modal to check their IP addresses table.
    setError(undefined);
    setSuccessMessage('');
  }, [open]);

  const handleInputChange = React.useRef(
    debounce(500, false, (_searchText: string) => {
      setSearchText(_searchText);
    })
  ).current;

  const {
    data: allLinodes,
    isLoading,
    error: linodesError,
  } = useAllLinodesQuery(
    {},
    {
      region: linodeRegion,
      label: { '+contains': searchText ? searchText : undefined },
    },
    open // only run the query if the modal is open
  );

  const {
    data: ipv6RangesData,
    isLoading: ipv6RangesLoading,
    error: ipv6RangesError,
  } = useIpv6RangesQuery();

  const linodes = (allLinodes ?? []).filter((l) => l.id !== linodeID);

  const onModeChange = (ip: string) => (e: Item) => {
    const mode = e.value as Mode;
    const firstLinode = linodes[0];

    const newState = compose<any, any, any, any, any>(
      /** Always update the mode. */
      setMode(ip, mode),

      /** When switching back to none, reset the ipState. */
      when(
        () => isNone(mode),
        updateIPState(ip, (ipState) =>
          defaultState(ipState.sourceIP, ipState.sourceIPsLinodeID)
        )
      ),

      /** When we're swapping/moving we default to the head of the list if it's not set already. */
      when(
        both(
          () => isSwapping(mode) || isMoving(mode),
          compose(isNil, view(L.selectedLinodeID(ip)))
        ),
        setSelectedLinodeID(ip, firstLinode.id)
      ),

      /** When we're swapping we defaulting the selectedIP to the first in the list and setting
       * the selectedLinodesIPs so the same Linode's IPs (which are used in the select IP menu).
       */
      when(
        () => isSwapping(mode),
        compose(
          setSelectedIP(ip, firstLinode.ipv4[0]),
          updateSelectedLinodesIPs(ip, () => {
            const linodeIPv6Ranges = getLinodeIPv6Ranges(
              ipv6RangesData?.data,
              firstLinode.ipv6
            );
            return [...firstLinode.ipv4, ...linodeIPv6Ranges];
          })
        )
      )
    );
    setIPs((currentState) => newState(currentState));
  };

  const onSelectedLinodeChange = (ip: string) => (e: Item) => {
    const newState = compose<any, any, any>(
      setSelectedLinodeID(ip, e.value),
      /**
       * When mode is swapping;
       *  Update the selectedLinodesIPs (since the Linode has changed, the available IPs certainly have)
       *  Update the selectedIP (to provide a sensible default).
       */
      when(
        compose(equals('swap'), view(L.mode(ip))),

        compose(
          /** We need to find and return the newly selected Linode's IPs. */
          updateSelectedLinodesIPs(ip, () => {
            const linode = linodes.find((l) => l.id === Number(e.value));
            if (linode) {
              const linodeIPv6Ranges = getLinodeIPv6Ranges(
                ipv6RangesData?.data,
                linode?.ipv6
              );
              return [...linode.ipv4, ...linodeIPv6Ranges];
            }
            return [];
          }),

          /** We need to find the selected Linode's IPs and return the first. */
          updateSelectedIP(ip, () => {
            const linode = linodes.find((l) => l.id === Number(e.value));
            if (linode) {
              return linode.ipv4[0];
            }
            return undefined;
          })
        )
      )
    );
    setIPs((currentState) => newState(currentState));
  };

  const onSelectedIPChange = (ip: string) => (e: Item<string>) => {
    setIPs(setSelectedIP(ip, e.value));
  };

  const renderRow = (
    state: IPStates,
    renderLinodeSelect?: (s: Move) => JSX.Element,
    renderIPSelect?: (s: Swap) => JSX.Element
  ) => {
    const actionsList = [
      { label: 'Move To', value: 'move' },
      { label: 'Swap With', value: 'swap' },
    ];

    return (
      <Grid container key={state.sourceIP} spacing={2} sx={{ width: '100%' }}>
        <Grid className={classes.sourceIPWrapper}>
          <Typography variant="body1" className={classes.ipField}>
            {state.sourceIP}
          </Typography>
        </Grid>
        <Grid className={classes.autoGridsm}>
          <Select
            value={
              state.mode === 'none'
                ? null
                : actionsList.find(
                    (eachAction) => eachAction.value === state.mode
                  )
            }
            options={actionsList}
            textFieldProps={{
              dataAttrs: {
                'data-qa-ip-transfer-action-menu': state.mode,
              },
            }}
            onChange={onModeChange(state.sourceIP)}
            disabled={readOnly}
            placeholder="Select Action"
            isClearable={false}
            noMarginTop
            label={`Select Action for IP Address ${state.sourceIP}`}
            hideLabel
            overflowPortal
          />
        </Grid>
        {renderLinodeSelect && renderLinodeSelect(state as Move)}
        {renderIPSelect && renderIPSelect(state as Swap)}
      </Grid>
    );
  };

  const linodeSelect = ({ sourceIP, selectedLinodeID }: Move) => {
    const linodeList = linodes.map((l) => {
      return { label: l.label, value: l.id };
    });

    const defaultLinode = linodeList.find((eachLinode) => {
      return eachLinode.value === selectedLinodeID;
    });

    return (
      <Grid xs={12} className={classes.autoGridsm}>
        <Select
          options={linodeList}
          textFieldProps={{
            dataAttrs: {
              'data-qa-linode-select': true,
            },
          }}
          disabled={readOnly || linodes.length === 1}
          value={defaultLinode}
          onChange={onSelectedLinodeChange(sourceIP)}
          isClearable={false}
          noMarginTop
          label="Select Linode"
          hideLabel
          onInputChange={handleInputChange}
          isLoading={isLoading || ipv6RangesLoading}
          errorText={linodesError?.[0].reason}
          overflowPortal
        />
      </Grid>
    );
  };

  const ipSelect = ({ sourceIP, selectedIP, selectedLinodesIPs }: Swap) => {
    const IPList = selectedLinodesIPs.map((ip) => {
      return { label: ip, value: ip };
    });

    const defaultIP = IPList.find((eachIP) => {
      return eachIP.value === selectedIP;
    });

    return (
      <Grid xs={12} className={classes.autoGridsm}>
        <Select
          disabled={readOnly}
          value={defaultIP}
          options={IPList}
          onChange={onSelectedIPChange(sourceIP)}
          textFieldProps={{
            dataAttrs: {
              'data-qa-swap-ip-action-menu': true,
            },
          }}
          isClearable={false}
          noMarginTop
          label="Select IP Address"
          hideLabel
          overflowPortal
        />
      </Grid>
    );
  };

  const previousIPAddresses = usePrevious(ipAddresses);

  React.useEffect(() => {
    /**
     * if new ip addresses were provided as props, massage the data so it matches
     * the default shape we need to append to state
     */
    if (!equals(previousIPAddresses, ipAddresses)) {
      setIPs(
        ipAddresses.reduce((acc, ip) => {
          acc[ip] = defaultState(ip, linodeID);
          return acc;
        }, {})
      );
    }
  }, [ipAddresses, linodeID, previousIPAddresses]);

  const ipRow = (ipState: IPStates) => {
    if (isNoneState(ipState)) {
      return renderRow(ipState);
    }

    if (isMoveState(ipState)) {
      return renderRow(ipState, linodeSelect);
    }

    if (isSwapState(ipState)) {
      return renderRow(ipState, linodeSelect, ipSelect);
    }

    return null;
  };

  const onSubmit = () => {
    setSubmitting(true);
    setError(undefined);
    setSuccessMessage('');

    const noActionSelected = !Object.values(ips).find(
      (ip) => ip.mode !== 'none'
    );
    if (noActionSelected) {
      setError([{ reason: 'Please select an action.' }]);
      setSubmitting(false);

      return;
    }

    assignAddresses(createRequestData(ips, props.linodeRegion))
      .then(() => {
        // Refresh Linodes in the region in which the changes were made.
        return Promise.all(props.refreshIPs())
          .then(() => {
            setSubmitting(false);
            setError(undefined);
            setSuccessMessage('IP transferred successfully.');
            // get updated route_target for ipv6 ranges
            queryClient.invalidateQueries(ipv6RangeQueryKey);
            queryClient.invalidateQueries(`${linodesQueryKey}-all`);
          })
          .catch((err) => {
            setError(
              getAPIErrorOrDefault(
                err,
                'Unable to refresh IPs. Please reload the screen.'
              )
            );
            setSubmitting(false);
          });
      })
      .catch((err) => {
        const apiErrors = getAPIErrorOrDefault(
          err,
          'Unable to transfer IP addresses at this time. Please try again later.'
        );

        setError(uniq(apiErrors));
        setSubmitting(false);
      });
  };

  const onReset = () => {
    setError(undefined);
    setSuccessMessage('');
    setIPs(
      ipAddresses.reduce(
        (state, ip) => ({
          ...state,
          [ip]: defaultState(ip, linodeID),
        }),
        {}
      )
    );
  };

  return (
    <Dialog title="IP Transfer" open={open} onClose={onClose} fullWidth>
      {error && (
        <Grid xs={12}>
          {error.map(({ reason }, idx) => (
            <Notice key={idx} error text={reason} />
          ))}
        </Grid>
      )}
      {successMessage && (
        <Grid xs={12}>
          <Notice success text={successMessage} />
        </Grid>
      )}
      <Grid sm={12} lg={8} xl={6}>
        <Typography className={classes.networkActionText}>
          If you have two Linodes in the same data center, you can use the IP
          transfer feature to switch their IP addresses. This could be useful in
          several situations. For example, if you&rsquo;ve built a new server to
          replace an old one, you could swap IP addresses instead of updating
          the DNS records.
        </Typography>
      </Grid>
      <Grid xs={12} container spacing={2}>
        {!isLoading && !ipv6RangesLoading && ipv6RangesError ? (
          <Notice error text={'There was an error loading IPv6 Ranges'} />
        ) : null}
        {(isLoading || ipv6RangesLoading) && searchText === '' ? (
          <div className={classes.loading}>
            <CircleProgress mini />
          </div>
        ) : (
          <>
            <Grid container spacing={2} sx={{ width: '100%' }}>
              <Grid className={classes.ipFieldLabel} data-qa-transfer-ip-label>
                <Typography>IP Address</Typography>
              </Grid>
              <Grid className={classes.actionsLabel}>
                <Typography>Actions</Typography>
              </Grid>
            </Grid>
            <Grid xs={12} sx={{ paddingTop: 0 }}>
              <Divider spacingBottom={0} />
            </Grid>
            {linodes.length === 0 && searchText === '' ? (
              <Typography className={classes.emptyStateText}>
                You have no other linodes in this Linode&rsquo;s datacenter with
                which to transfer IPs.
              </Typography>
            ) : (
              <Grid container spacing={2} sx={{ width: '100%' }}>
                {Object.values(ips).map(ipRow)}
              </Grid>
            )}
          </>
        )}
      </Grid>
      <StyledActionPanel>
        <Button
          buttonType="secondary"
          disabled={submitting || linodes.length === 0}
          onClick={onReset}
          data-qa-ip-transfer-reset
        >
          Reset Form
        </Button>
        <Button
          buttonType="primary"
          loading={submitting}
          onClick={onSubmit}
          disabled={readOnly || linodes.length === 0}
          data-qa-ip-transfer-save
        >
          Save
        </Button>
      </StyledActionPanel>
    </Dialog>
  );
};

const L = {
  ip: (ip: string) => lensPath([ip]),
  mode: (ip: string) => lensPath([ip, 'mode']),
  selectedIP: (ip: string) => lensPath([ip, 'selectedIP']),
  selectedLinodeID: (ip: string) => lensPath([ip, 'selectedLinodeID']),
  selectedLinodesIPs: (ip: string) => lensPath([ip, 'selectedLinodesIPs']),
  sourceIP: (ip: string) => lensPath([ip, 'sourceIP']),
  sourceIPsLinodeID: (ip: string) => lensPath([ip, 'sourceIPsLinodeID']),
};

const setMode = (ip: string, mode: Mode) => set(L.mode(ip), mode);

const setSelectedIP = (ip: string, selectedIP: string) =>
  set(L.selectedIP(ip), selectedIP);

const setSelectedLinodeID = (ip: string, selectedLinodeID: number | string) =>
  set(L.selectedLinodeID(ip), selectedLinodeID);

const updateSelectedLinodesIPs = (ip: string, fn: (s: string[]) => string[]) =>
  over(L.selectedLinodesIPs(ip), fn);

const updateSelectedIP = (ip: string, fn: (a: string) => string | undefined) =>
  over(L.selectedIP(ip), fn);

const updateIPState = (ip: string, fn: (v: IPStates) => IPStates) =>
  over(L.ip(ip), fn);

const isMoving = (mode: Mode) => mode === 'move';

const isSwapping = (mode: Mode) => mode === 'swap';

const isNone = (mode: Mode) => mode === 'none';

const isNoneState = (state: NoAction | Move | Swap): state is NoAction =>
  state.mode === 'none';

const isMoveState = (state: NoAction | Move | Swap): state is Move =>
  state.mode === 'move';

const isSwapState = (state: NoAction | Move | Swap): state is Swap =>
  state.mode === 'swap';

const stateToAssignmentsReducer = (
  assignments: { address: string; linode_id: number }[],
  current: IPStates
) => {
  if (isMoveState(current)) {
    return [
      ...assignments,
      {
        address: current.sourceIP,
        linode_id: current.selectedLinodeID,
      },
    ];
  }

  if (isSwapState(current)) {
    return [
      ...assignments,
      {
        address: current.sourceIP,
        linode_id: current.selectedLinodeID,
      },
      {
        address: current.selectedIP,
        linode_id: current.sourceIPsLinodeID,
      },
    ];
  }

  return assignments;
};

const createRequestData = (state: IPRowState, region: string) => ({
  assignments: Object.values(state).reduce(stateToAssignmentsReducer, []),
  region,
});

export default LinodeNetworkingIPTransferPanel;
