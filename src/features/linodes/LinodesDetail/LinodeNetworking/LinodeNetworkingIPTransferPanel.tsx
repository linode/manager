import { both, compose, equals, isNil, lensPath, over, path, set, uniq, view, when } from 'ramda';
import * as React from 'react';

import Divider from '@material-ui/core/Divider';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import Select from 'src/components/Select';
import TextField from 'src/components/TextField';
import { getLinodes } from 'src/services/linodes';
import { assignAddresses } from 'src/services/networking';

type ClassNames =
  'containerDivider'
  | 'ipField'
  | 'ipFieldLabel'
  | 'actionsLabel'
  | 'autoGridsm';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  containerDivider: {
   marginTop: theme.spacing.unit,
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
      width: `calc(175px + ${theme.spacing.unit * 2}px)`,
    },
  },
  actionsLabel: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  autoGridsm: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: 'auto',
      flexBasis: 'auto',
    },
  },
});

interface Props {
  linodeID: number;
  linodeRegion: string;
  ipAddresses: string[];
  refreshIPs: () => Promise<void>;
}

type IPStates = NoAction | Swap | Move;

interface IPRowState {
  [x: string]: IPStates;
}

interface State {
  submitting: boolean;
  loading: boolean;
  ips: IPRowState;
  linodes: { id: number, label: string, ips: string[] }[];
  error?: Linode.ApiFieldError[];
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

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeNetworkingIPTransferPanel extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      ips: props.ipAddresses.reduce((acc, ip) => ({
        ...acc,
        [ip]: LinodeNetworkingIPTransferPanel.defaultState(ip, this.props.linodeID),
      }), {}),
      linodes: [],
      loading: true,
      submitting: false,
    };
  }

  mounted: boolean = false;

  static defaultState = (sourceIP: string, sourceIPsLinodeID: number): NoAction => ({
    mode: 'none',
    sourceIP,
    sourceIPsLinodeID,
  })

  onModeChange = (ip: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as Mode;
    const firstLinode = this.state.linodes[0];

    this.setState(
      compose(
        /** Always update the mode. */
        setMode(ip, mode),

        /** When switching back to none, reset the ipState. */
        when(
          () => isNone(mode),
          updateIPState(ip, ipState => LinodeNetworkingIPTransferPanel.defaultState(ipState.sourceIP, ipState.sourceIPsLinodeID))
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
            setSelectedIP(ip, firstLinode.ips[0]),
            setSelectedLinodesIPs(ip, firstLinode.ips),
          ),
        ),
      ),
    )
  }

  onSelectedLinodeChange = (ip: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState(
      compose(
        setSelectedLinodeID(ip, e.target.value),
        /**
         * When mode is swapping;
         *  Update the selectedLinodesIPs (since the Linode has changed, the available IPs certainly have)
         *  Update the selectedIP (to provide a sensible default).
         */
        when(
          compose(equals('swap'), view(L.mode(ip))),

          compose(
            /** We need to find and return the newly selected Linode's IPs. */
            updateSelectedLinodesIPs(
              ip,
              (currentIPs: string[]) => {
                const linode = this.state.linodes.find(l => l.id === Number(e.target.value));
                if (linode) {
                  return linode.ips;
                }
                return [];
              },
            ),

            /** We need to find the selected Linode's IPs and return the first. */
            updateSelectedIP(
              ip,
              (currentIP: string) => {
              const linode = this.state.linodes.find(l => l.id === Number(e.target.value));
              if (linode) {
                return linode.ips[0];
              }
              return;
            })
          ),
        ),
      ),
    );
  }

  onSelectedIPChange = (ip: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState(
      setSelectedIP(ip, e.target.value)
    );
  }

  renderRow = (
    state: IPStates,
    renderLinodeSelect?: (s: Move) => JSX.Element,
    renderIPSelect?: (s: Swap) => JSX.Element,
  ) => {
    const { classes } = this.props;
    return (
      <Grid container key={state.sourceIP}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item>
          <TextField disabled value={state.sourceIP} className={classes.ipField} />
        </Grid>
        <Grid item xs={12} className={classes.autoGridsm}>
          <Select
            value={state.mode}
            onChange={this.onModeChange(state.sourceIP)}
            fullWidth={false}
          >
            <MenuItem value="none">Select Action</MenuItem>
            <MenuItem value="move">Move To</MenuItem>
            <MenuItem value="swap">Swap With</MenuItem>
          </Select>
        </Grid>
        {renderLinodeSelect && renderLinodeSelect(state as Move)}
        {renderIPSelect && renderIPSelect(state as Swap)}
      </Grid>
    );
  }

  linodeSelect = ({ mode, sourceIP, selectedLinodeID }: Move) => {
    const { classes } = this.props;
    return (
      <Grid item xs={12} className={classes.autoGridsm}>
        <Select
          disabled={this.state.linodes.length === 1}
          value={selectedLinodeID}
          onChange={this.onSelectedLinodeChange(sourceIP)}
          fullWidth={false}
        >
          {
            this.state.linodes.map(l => (
              <MenuItem key={l.label} value={l.id}>{l.label}</MenuItem>))
          }
        </Select>
      </Grid>
    )
  }

  ipSelect = ({ sourceIP, selectedIP, selectedLinodesIPs }: Swap) => {
    const { classes } = this.props;
    return (
      <Grid item xs={12} className={classes.autoGridsm}>
        <Select
          disabled={selectedLinodesIPs.length === 1}
          value={selectedIP}
          fullWidth={false}
          onChange={this.onSelectedIPChange(sourceIP)}
        >
          {selectedLinodesIPs.map(ip => <MenuItem key={ip} value={ip}>{ip}</MenuItem>)}
        </Select>
      </Grid>
    )
  }

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      ips: nextProps.ipAddresses.reduce((state, ip) => ({
        ...state,
        [ip]: LinodeNetworkingIPTransferPanel.defaultState(ip, this.props.linodeID),
      }), {}),
    })
  }

  ipRow = (ipState: IPStates) => {
    if (isNoneState(ipState)) {
      return this.renderRow(ipState);
    }

    if (isMoveState(ipState)) {
      return this.renderRow(ipState, this.linodeSelect);
    }

    if (isSwapState(ipState)) {
      return this.renderRow(ipState, this.linodeSelect, this.ipSelect);
    }

    return null;
  }

  onSubmit = () => {
    this.setState({ submitting: true, error: undefined });

    assignAddresses(
      createRequestData(this.state.ips, this.props.linodeRegion),
    )
      .then((response) => {
        return Promise.all([
          this.props.refreshIPs(),
          this.getLinodes()
        ])
          .then(() => {
            this.setState({ submitting: false, error: undefined })
          })
          .catch(() => {
            this.setState({ error: [{ field: 'none', reason: 'Unable to refresh IPs. Please reload the screen.' }] })
          });
      })
      .catch((response) => {
        const apiErrors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], response);

        if (apiErrors) {
          return this.setState({
            error: uniq(apiErrors),
            submitting: false,
          });
        }

        this.setState({
          error: [{ field: 'none', reason: 'Unable to transfer IP addresses at this time. Please try again later.' }],
          submitting: false
        });
      })
  };

  onReset = () => {
    this.setState({
      error: undefined,
      ips: this.props.ipAddresses.reduce((state, ip) => ({
        ...state,
        [ip]: LinodeNetworkingIPTransferPanel.defaultState(ip, this.props.linodeID),
      }), {}),
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.getLinodes();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getLinodes = () => {
    return getLinodes({}, { region: this.props.linodeRegion })
      .then(response => ({
        ...response,
        data: response.data.filter(l => l.id !== this.props.linodeID),
      }))
      .then((response) => {
        if (!this.mounted) { return; }
        this.setState({
          linodes: response.data.map(linode => ({
            id: linode.id,
            ips: linode.ipv4,
            label: linode.label,
          })),
          loading: false,
        });
      })
      .catch(() => {
        if (!this.mounted) { return; }
        this.setState({ error: [{ field: 'none', reason: 'Unable to fetch IP addresses. Try reloading?' }] })
      });
  };

  transferActions = () => {
    return (
      <ActionsPanel>
        <Button
          loading={this.state.submitting}
          onClick={this.onSubmit}
          type="primary"
        >
          Save
      </Button>
        <Button disabled={this.state.submitting} onClick={this.onReset} type="secondary">Cancel</Button>
      </ActionsPanel>)
  }

  render() {
    const { classes } = this.props;
    const { ips, error } = this.state;

    return (
      <ExpansionPanel
        defaultExpanded
        heading="IP Transfer"
        actions={this.transferActions}
      >
        <Grid container>
          {
            error &&
            <Grid item xs={12}>
              {error.map(({ field, reason }, idx) => <Notice key={idx} error text={reason} />)}
            </Grid>
          }
          <Grid item sm={12} lg={8} xl={6}>
            <Typography>
              If you have two Linodes in the same data center, you can use the IP transfer feature to
              switch their IP addresses. This could be useful in several situations. For example,
              if you’ve built a new server to replace an old one, you could swap IP addresses instead
              of updating the DNS records.
          </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item className={classes.ipFieldLabel}>IP Address</Grid>
              <Grid item className={classes.actionsLabel}>Actions</Grid>
            </Grid>
            {
              this.state.loading
                ? <LinearProgress style={{ margin: '50px' }} /> // Loading, chill out man.
                : this.state.linodes.length === 0
                  ? null // They don't have any other Linodes to transfer/swap with.
                  : Object.values(ips).map(this.ipRow)
            }
          </Grid>
        </Grid>
      </ExpansionPanel>
    );
  }
}

const L = {
  ip: (ip: string) => lensPath(['ips', ip]),
  mode: (ip: string) => lensPath(['ips', ip, 'mode']),
  selectedIP: (ip: string) => lensPath(['ips', ip, 'selectedIP']),
  selectedLinodeID: (ip: string) => lensPath(['ips', ip, 'selectedLinodeID']),
  selectedLinodesIPs: (ip: string) => lensPath(['ips', ip, 'selectedLinodesIPs']),
  sourceIP: (ip: string) => lensPath(['ips', ip, 'sourceIP']),
  sourceIPsLinodeID: (ip: string) => lensPath(['ips', ip, 'sourceIPsLinodeID']),
};

const setMode = (ip: string, mode: Mode) => set(L.mode(ip), mode);

const setSelectedIP = (ip: string, selectedIP: string) => set(L.selectedIP(ip), selectedIP);

const setSelectedLinodeID = (ip: string, selectedLinodeID: number|string) => set(L.selectedLinodeID(ip), selectedLinodeID);

const setSelectedLinodesIPs = (ip: string, selectedLinodesIPs: string[]) => set(L.selectedLinodesIPs(ip), selectedLinodesIPs);

const updateSelectedLinodesIPs = (ip: string, fn: (s: string[]) => string[]) =>
over(L.selectedLinodesIPs(ip), fn);

const updateSelectedIP = (ip: string, fn: (a: string) => string | undefined) =>
over(L.selectedIP(ip), fn);

const updateIPState = (ip: string, fn: (v: IPStates) => IPStates) => over( L.ip(ip), fn);

const isMoving = (mode: Mode) => mode === 'move';

const isSwapping = (mode: Mode) => mode === 'swap';

const isNone = (mode: Mode) => mode === 'none';

const isNoneState = (state: NoAction | Move | Swap): state is NoAction =>
  state.mode === 'none';

const isMoveState = (state: NoAction | Move | Swap): state is Move =>
  state.mode === 'move';

const isSwapState = (state: NoAction | Move | Swap): state is Swap =>
  state.mode === 'swap';

const stateToAssignmentsReducer = (assignments: { address: string, linode_id: number }[], current: IPStates) => {
  if (isMoveState(current)) {
    return [
      ...assignments,
      {
        address: current.sourceIP,
        linode_id: current.selectedLinodeID,
      }
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

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeNetworkingIPTransferPanel);
