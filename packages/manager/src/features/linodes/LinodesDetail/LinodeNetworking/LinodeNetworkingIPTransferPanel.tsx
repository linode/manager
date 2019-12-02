import { getLinodes } from 'linode-js-sdk/lib/linodes';
import { assignAddresses } from 'linode-js-sdk/lib/networking';
import { APIError } from 'linode-js-sdk/lib/types';
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
  when
} from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

type ClassNames =
  | 'containerDivider'
  | 'mobileFieldWrapper'
  | 'ipField'
  | 'ipFieldLabel'
  | 'actionsLabel'
  | 'networkActionText'
  | 'emptyStateText'
  | 'autoGridsm';

const styles = (theme: Theme) =>
  createStyles({
    containerDivider: {
      marginTop: theme.spacing(1)
    },
    mobileFieldWrapper: {
      [theme.breakpoints.down('xs')]: {
        width: '100%'
      }
    },
    ipField: {
      marginTop: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: 175
      }
    },
    ipFieldLabel: {
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: `calc(175px + ${theme.spacing(2)}px)`
      }
    },
    actionsLabel: {
      [theme.breakpoints.down('sm')]: {
        display: 'none'
      }
    },
    autoGridsm: {
      minWidth: 175,
      [theme.breakpoints.up('sm')]: {
        maxWidth: 'auto',
        flexBasis: 'auto'
      }
    },
    networkActionText: {
      marginBottom: theme.spacing(2)
    },
    emptyStateText: {
      marginTop: theme.spacing(2),
      color: theme.color.grey1
    }
  });

interface Props {
  linodeID: number;
  linodeRegion: string;
  ipAddresses: string[];
  readOnly?: boolean;
  refreshIPs: () => Promise<void>;
}

type IPStates = NoAction | Swap | Move;

interface IPRowState {
  [x: string]: IPStates;
}

interface State {
  submitting: boolean;
  loading: boolean;
  successMessage?: string;
  ips: IPRowState;
  linodes: { id: number; label: string; ips: string[] }[];
  error?: APIError[];
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

class LinodeNetworkingIPTransferPanel extends React.Component<
  CombinedProps,
  State
> {
  constructor(props: CombinedProps) {
    super(props);

    this.state = {
      ips: props.ipAddresses.reduce(
        (acc, ip) => ({
          ...acc,
          [ip]: LinodeNetworkingIPTransferPanel.defaultState(
            ip,
            this.props.linodeID
          )
        }),
        {}
      ),
      linodes: [],
      loading: true,
      submitting: false
    };
  }

  mounted: boolean = false;

  static defaultState = (
    sourceIP: string,
    sourceIPsLinodeID: number
  ): NoAction => ({
    mode: 'none',
    sourceIP,
    sourceIPsLinodeID
  });

  onModeChange = (ip: string) => (e: Item) => {
    const mode = e.value as Mode;
    const firstLinode = this.state.linodes[0];

    this.setState(
      compose(
        /** Always update the mode. */
        setMode(ip, mode),

        /** When switching back to none, reset the ipState. */
        when(
          () => isNone(mode),
          updateIPState(ip, ipState =>
            LinodeNetworkingIPTransferPanel.defaultState(
              ipState.sourceIP,
              ipState.sourceIPsLinodeID
            )
          )
        ),

        /** When we're swapping/moving we default to the head of the list if it's not set already. */
        when(
          both(
            () => isSwapping(mode) || isMoving(mode),
            compose(
              isNil,
              view(L.selectedLinodeID(ip))
            )
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
            setSelectedLinodesIPs(ip, firstLinode.ips)
          )
        )
      )
    );
  };

  onSelectedLinodeChange = (ip: string) => (e: Item) => {
    this.setState(
      compose(
        setSelectedLinodeID(ip, e.value),
        /**
         * When mode is swapping;
         *  Update the selectedLinodesIPs (since the Linode has changed, the available IPs certainly have)
         *  Update the selectedIP (to provide a sensible default).
         */
        when(
          compose(
            equals('swap'),
            view(L.mode(ip))
          ),

          compose(
            /** We need to find and return the newly selected Linode's IPs. */
            updateSelectedLinodesIPs(ip, (currentIPs: string[]) => {
              const linode = this.state.linodes.find(
                l => l.id === Number(e.value)
              );
              if (linode) {
                return linode.ips;
              }
              return [];
            }),

            /** We need to find the selected Linode's IPs and return the first. */
            updateSelectedIP(ip, (currentIP: string) => {
              const linode = this.state.linodes.find(
                l => l.id === Number(e.value)
              );
              if (linode) {
                return linode.ips[0];
              }
              return;
            })
          )
        )
      )
    );
  };

  onSelectedIPChange = (ip: string) => (e: Item<string>) => {
    this.setState(setSelectedIP(ip, e.value));
  };

  renderRow = (
    state: IPStates,
    renderLinodeSelect?: (s: Move) => JSX.Element,
    renderIPSelect?: (s: Swap) => JSX.Element
  ) => {
    const { classes, readOnly } = this.props;

    const actionsList = [
      { label: 'Move To', value: 'move' },
      { label: 'Swap With', value: 'swap' }
    ];

    return (
      <Grid container key={state.sourceIP}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item className={classes.mobileFieldWrapper}>
          <TextField value={state.sourceIP} className={classes.ipField} />
        </Grid>
        <Grid item xs={12} className={classes.autoGridsm}>
          <Select
            value={
              state.mode === 'none'
                ? null
                : actionsList.find(
                    eachAction => eachAction.value === state.mode
                  )
            }
            options={actionsList}
            textFieldProps={{
              dataAttrs: {
                'data-qa-ip-transfer-action-menu': state.mode
              }
            }}
            onChange={this.onModeChange(state.sourceIP)}
            disabled={readOnly}
            placeholder="Select Action"
            isClearable={false}
            noMarginTop
            label="Select Action"
            hideLabel
          />
        </Grid>
        {renderLinodeSelect && renderLinodeSelect(state as Move)}
        {renderIPSelect && renderIPSelect(state as Swap)}
      </Grid>
    );
  };

  linodeSelect = ({ mode, sourceIP, selectedLinodeID }: Move) => {
    const { classes, readOnly } = this.props;

    const linodeList = this.state.linodes.map(l => {
      return { label: l.label, value: l.id };
    });

    const defaultLinode = linodeList.find(eachLinode => {
      return eachLinode.value === selectedLinodeID;
    });

    return (
      <Grid item xs={12} className={classes.autoGridsm}>
        <Select
          options={linodeList}
          textFieldProps={{
            dataAttrs: {
              'data-qa-linode-select': true
            }
          }}
          disabled={readOnly || this.state.linodes.length === 1}
          defaultValue={defaultLinode}
          onChange={this.onSelectedLinodeChange(sourceIP)}
          isClearable={false}
          noMarginTop
          label="Select Linode"
          hideLabel
        />
      </Grid>
    );
  };

  ipSelect = ({ sourceIP, selectedIP, selectedLinodesIPs }: Swap) => {
    const { classes, readOnly } = this.props;

    const IPList = selectedLinodesIPs.map(ip => {
      return { label: ip, value: ip };
    });

    const defaultIP = IPList.find(eachIP => {
      return eachIP.value === selectedIP;
    });

    return (
      <Grid item xs={12} className={classes.autoGridsm}>
        <Select
          disabled={readOnly}
          value={defaultIP}
          options={IPList}
          onChange={this.onSelectedIPChange(sourceIP)}
          textFieldProps={{
            dataAttrs: {
              'data-qa-swap-ip-action-menu': true
            }
          }}
          isClearable={false}
          noMarginTop
          label="Select IP Address"
          hideLabel
        />
      </Grid>
    );
  };

  componentDidUpdate(prevProps: CombinedProps) {
    /**
     * if new ip addresses were provided as props, massage the data so it matches
     * the default shape we need to append to state
     */
    if (!equals(prevProps.ipAddresses, this.props.ipAddresses)) {
      this.setState({
        ips: this.props.ipAddresses.reduce((acc, ip) => {
          acc[ip] = LinodeNetworkingIPTransferPanel.defaultState(
            ip,
            this.props.linodeID
          );
          return acc;
        }, {})
      });
    }
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
  };

  onSubmit = () => {
    this.setState({
      submitting: true,
      error: undefined,
      successMessage: undefined
    });

    assignAddresses(createRequestData(this.state.ips, this.props.linodeRegion))
      .then(() => {
        return Promise.all([this.props.refreshIPs(), this.getLinodes()])
          .then(() => {
            this.setState({
              submitting: false,
              error: undefined,
              successMessage: 'IP transferred successfully.'
            });
          })
          .catch(err => {
            this.setState({
              error: getAPIErrorOrDefault(
                err,
                'Unable to refresh IPs. Please reload the screen.'
              )
            });
          });
      })
      .catch(err => {
        const apiErrors = getAPIErrorOrDefault(
          err,
          'Unable to transfer IP addresses at this time. Please try again later.'
        );

        return this.setState({
          error: uniq(apiErrors),
          submitting: false
        });
      });
  };

  onReset = () => {
    this.setState({
      error: undefined,
      successMessage: undefined,
      ips: this.props.ipAddresses.reduce(
        (state, ip) => ({
          ...state,
          [ip]: LinodeNetworkingIPTransferPanel.defaultState(
            ip,
            this.props.linodeID
          )
        }),
        {}
      )
    });
  };

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
        data: response.data.filter(l => l.id !== this.props.linodeID)
      }))
      .then(response => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          linodes: response.data.map(linode => ({
            id: linode.id,
            ips: linode.ipv4,
            label: linode.label
          })),
          loading: false
        });
      })
      .catch(() => {
        if (!this.mounted) {
          return;
        }
        this.setState({
          error: [
            {
              field: 'none',
              reason: 'Unable to fetch IP addresses. Try reloading?'
            }
          ]
        });
      });
  };

  transferActions = () => {
    const { readOnly } = this.props;
    return (
      <ActionsPanel>
        <Button
          loading={this.state.submitting}
          onClick={this.onSubmit}
          buttonType="primary"
          disabled={readOnly || this.state.linodes.length === 0}
          data-qa-ip-transfer-save
        >
          Save
        </Button>
        <Button
          disabled={this.state.submitting || this.state.linodes.length === 0}
          onClick={this.onReset}
          buttonType="secondary"
          data-qa-ip-transfer-cancel
        >
          Cancel
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { classes } = this.props;
    const { ips, error, successMessage } = this.state;

    return (
      <ExpansionPanel
        heading="IP Transfer"
        actions={this.transferActions}
        success={successMessage}
        data-qa-networking-actions-subheading
      >
        <Grid container>
          {error && (
            <Grid item xs={12}>
              {error.map(({ field, reason }, idx) => (
                <Notice key={idx} error text={reason} />
              ))}
            </Grid>
          )}
          <Grid item sm={12} lg={8} xl={6}>
            <Typography className={classes.networkActionText}>
              If you have two Linodes in the same data center, you can use the
              IP transfer feature to switch their IP addresses. This could be
              useful in several situations. For example, if you’ve built a new
              server to replace an old one, you could swap IP addresses instead
              of updating the DNS records.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid
                item
                className={classes.ipFieldLabel}
                data-qa-transfer-ip-label
              >
                <Typography>IP Address</Typography>
              </Grid>
              <Grid item className={classes.actionsLabel}>
                <Typography>Actions</Typography>
              </Grid>
            </Grid>
            {this.state.loading ? (
              <LinearProgress style={{ margin: '50px' }} /> // Loading, chill out man.
            ) : this.state.linodes.length === 0 ? (
              <Typography className={classes.emptyStateText}>
                You have no other linodes in this Linode's datacenter with which
                to transfer IPs.
              </Typography>
            ) : (
              Object.values(ips).map(this.ipRow)
            )}
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
  selectedLinodesIPs: (ip: string) =>
    lensPath(['ips', ip, 'selectedLinodesIPs']),
  sourceIP: (ip: string) => lensPath(['ips', ip, 'sourceIP']),
  sourceIPsLinodeID: (ip: string) => lensPath(['ips', ip, 'sourceIPsLinodeID'])
};

const setMode = (ip: string, mode: Mode) => set(L.mode(ip), mode);

const setSelectedIP = (ip: string, selectedIP: string) =>
  set(L.selectedIP(ip), selectedIP);

const setSelectedLinodeID = (ip: string, selectedLinodeID: number | string) =>
  set(L.selectedLinodeID(ip), selectedLinodeID);

const setSelectedLinodesIPs = (ip: string, selectedLinodesIPs: string[]) =>
  set(L.selectedLinodesIPs(ip), selectedLinodesIPs);

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
        linode_id: current.selectedLinodeID
      }
    ];
  }

  if (isSwapState(current)) {
    return [
      ...assignments,
      {
        address: current.sourceIP,
        linode_id: current.selectedLinodeID
      },
      {
        address: current.selectedIP,
        linode_id: current.sourceIPsLinodeID
      }
    ];
  }

  return assignments;
};

const createRequestData = (state: IPRowState, region: string) => ({
  assignments: Object.values(state).reduce(stateToAssignmentsReducer, []),
  region
});

const styled = withStyles(styles);

export default styled(LinodeNetworkingIPTransferPanel);
