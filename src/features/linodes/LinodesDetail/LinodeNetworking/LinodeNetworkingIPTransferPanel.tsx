import { compose, equals, isNil, lensPath, over, path, set, view, when } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from 'material-ui';
import Typography from 'material-ui/Typography';

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

type ClassNames = 'root' | 'title' | 'ipRowLoading';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  ipRowLoading: {
    backgroundColor: 'red',
  },
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 4,
  },
});

interface Props {
  linodeID: number;
  linodeRegion: string;
  ipAddresses: string[];
  refreshIPs: () => Promise<any>;
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
      ips: props.ipAddresses.reduce((state, ip) => ({
        ...state,
        [ip]: LinodeNetworkingIPTransferPanel.defaultState(ip, this.props.linodeID),
      }), {}),
      linodes: [],
      loading: true,
      submitting: false,
    };
  }

  private static defaultState = (sourceIP: string, sourceIPsLinodeID: number): NoAction => ({
    mode: 'none',
    sourceIP,
    sourceIPsLinodeID,
  })

  private onModeChange = (ip: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const mode = e.target.value as Mode;
    if (isMoving(mode)) {
      this.setState(
        compose(
          set(L.mode(ip), mode),
          /**
           * when selectedLinodeId is not set, set it.
           */
          when(
            compose(isNil, view(L.selectedLinodeID(ip))),
            set(
              L.selectedLinodeID(ip),
              this.state.linodes[0].id,
            )
          ),
        ),
      );
    }

    if (isSwapping(mode)) {
      this.setState(
        compose(
          set(L.mode(ip), mode),
          when(
            compose(isNil, view(L.selectedLinodeID(ip))),
            set(
              L.selectedLinodeID(ip),
              this.state.linodes[0].id,
            )
          ),
          set(
            L.selectedIP(ip),
            this.state.linodes[0].ips[0],
          ),
          set(
            L.selectedLinodesIPs(ip),
            this.state.linodes[0].ips,
          ),
        ),
      );
    }
  }

  private onSelectedLinodeChange = (ip: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      compose(
        set(
          L.selectedLinodeID(ip),
          e.target.value,
        ),
        /**
         * When mode is swapping;
         *  Update the selectedLinodesIPs (since the Linode has changed, the available IPs certainly have)
         *  Update the selectedIP (to provide a sensible default).
         */
        when(
          compose(
            equals('swap'),
            view(L.mode(ip)),
          ),
          compose(

            /** We need to find and return the newly selected Linode's IPs. */
            over(
              L.selectedLinodesIPs(ip),
              () => {
                const linode = this.state.linodes.find(l => l.id === Number(e.target.value));
                if (linode) {
                  return linode.ips;
                }
                return [];
              },
            ),

            /** We need to find the selected Linode's IPs and return the first. */
            over(
              L.selectedIP(ip),
              () => {
                const linode = this.state.linodes.find(l => l.id === Number(e.target.value));
                if (linode) {
                  return linode.ips[0];
                }
                return;
              },
            ),
          ),
        ),
      ),
    );
  }

  private onSelectedIPChange = (ip: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState(
      set(
        L.selectedIP(ip),
        e.target.value,
      ),
    );
  }

  private renderRow = (
    state: IPStates,
    renderLinodeSelect?: (s: Move) => JSX.Element,
    renderIPSelect?: (s: Swap) => JSX.Element,
  ) => {
    return (
      <Grid container key={state.sourceIP}>
        <Grid item xs={3}>
          <TextField disabled value={state.sourceIP} />
        </Grid>
        <Grid item xs={2}>
          <Select
            value={state.mode}
            onChange={this.onModeChange(state.sourceIP)}
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

  private linodeSelect = ({ mode, sourceIP, selectedLinodeID }: Move) => {
    return (
      <Grid item xs={3}>
        <Select
          disabled={this.state.linodes.length === 1}
          value={selectedLinodeID}
          onChange={this.onSelectedLinodeChange(sourceIP)}
        >
          {
            this.state.linodes.map(l => (
              <MenuItem key={l.label} value={l.id}>{l.label}</MenuItem>))
          }
        </Select>
      </Grid>
    )
  }

  private ipSelect = ({ sourceIP, selectedIP, selectedLinodesIPs }: Swap) => {
    return (
      <Grid item xs={3}>
        <Select
          disabled={selectedLinodesIPs.length === 1}
          value={selectedIP}
          onChange={this.onSelectedIPChange(sourceIP)}
        >
          {selectedLinodesIPs.map(ip => <MenuItem key={ip} value={ip}>{ip}</MenuItem>)}
        </Select>
      </Grid>
    )
  }

  public componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      ips: nextProps.ipAddresses.reduce((state, ip) => ({
        ...state,
        [ip]: LinodeNetworkingIPTransferPanel.defaultState(ip, this.props.linodeID),
      }), {}),
    })
  }

  private ipRow = (ipState: IPStates) => {
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

  private onSubmit = () => {
    this.setState({ submitting: true, error: undefined });

    assignAddresses(
      createRequestData(this.state.ips, this.props.linodeRegion),
    )
      .then((response) => {
        this.props.refreshIPs()
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
          return this.setState({ error: apiErrors, submitting: false });
        }

        this.setState({
          error: [{ field: 'none', reason: 'Update to transfer IP addresses at this time. Please try again later.' }],
          submitting: false
        });
      })
  };

  private onReset = () => {
    this.setState({
      error: undefined,
      ips: this.props.ipAddresses.reduce((state, ip) => ({
        ...state,
        [ip]: LinodeNetworkingIPTransferPanel.defaultState(ip, this.props.linodeID),
      }), {}),
    });
  }

  public componentDidMount() {
    getLinodes({}, { region: this.props.linodeRegion })
      .then(response => ({
        ...response,
        data: response.data.filter(l => l.id !== this.props.linodeID),
      }))
      .then((response) => {
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
        this.setState({ error: [{ field: 'none', reason: 'Unable to fetch IP addresses. Try reloading?' }] })
      });
  }

  private transferActions = () => {
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

  public render() {
    const { classes } = this.props;
    const { ips, error } = this.state;

    return (
      <React.Fragment>
        <Grid container>
          <Grid item xs={12}>
            <Typography
              variant="title"
              className={classes.title}
            >
              Networking Actions
            </Typography>
            <ExpansionPanel
              defaultExpanded
              heading="IP Transfer"
              actions={this.transferActions}
            >
              <Grid container>
                {
                  error &&
                  <Grid item xs={12}>
                    { error.map(({ field, reason}) => <Notice error text={reason} />)}
                  </Grid>
                }
                <Grid item xs={12}>
                  <Typography>
                    If you have two Linodes in the same data center, you can use the IP transfer feature to
                    switch their IP addresses. This could be useful in several situations. For example,
                    if you’ve built a new server to replace an old one, you could swap IP addresses instead
                    of updating the DNS records.
                </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={3}>IP Address</Grid>
                    <Grid item xs={2}>Actions</Grid>
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
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const isMoving = (mode: Mode) => mode === 'move';

const isSwapping = (mode: Mode) => mode === 'swap';

const L = {
  mode: (ip: string) => lensPath(['ips', ip, 'mode']),
  selectedIP: (ip: string) => lensPath(['ips', ip, 'selectedIP']),
  selectedLinodeID: (ip: string) => lensPath(['ips', ip, 'selectedLinodeID']),
  selectedLinodesIPs: (ip: string) => lensPath(['ips', ip, 'selectedLinodesIPs']),
  sourceIP: (ip: string) => lensPath(['ips', ip, 'sourceIP']),
  sourceIPsLinodeID: (ip: string) => lensPath(['ips', ip, 'sourceIPsLinodeID']),
};

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
