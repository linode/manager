import * as classnames from 'classnames';
import { IPv6, parse as parseIP } from 'ipaddr.js';
import {
  getLinodeIPs,
  Linode,
  LinodeIPsResponse,
  LinodeIPsResponseIPV4,
  LinodeIPsResponseIPV6
} from 'linode-js-sdk/lib/linodes';
import { getIPs, IPAddress, IPRange } from 'linode-js-sdk/lib/networking';
import {
  compose,
  head,
  isEmpty,
  path,
  pathOr,
  tail,
  uniq,
  uniqBy
} from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose as recompose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import ShowMore from 'src/components/ShowMore';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ZONES } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { upsertLinode as _upsertLinode } from 'src/store/linodes/linodes.actions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import CreateIPv4Drawer from './CreateIPv4Drawer';
import CreateIPv6Drawer from './CreateIPv6Drawer';
import DeleteIPConfirm from './DeleteIPConfirm';
import EditRDNSDrawer from './EditRDNSDrawer';
import IPSharingPanel from './IPSharingPanel';
import LinodeNetworkingActionMenu, {
  IPTypes
} from './LinodeNetworkingActionMenu';
import IPTransferPanel from './LinodeNetworkingIPTransferPanel';
import LinodeNetworkingSummaryPanel from './LinodeNetworkingSummaryPanel';
import ViewIPDrawer from './ViewIPDrawer';
import ViewRangeDrawer from './ViewRangeDrawer';

type ClassNames =
  | 'root'
  | 'title'
  | 'address'
  | 'reverseDNS'
  | 'defaultGateway'
  | 'type'
  | 'action'
  | 'ipv4Container'
  | 'ipv4Title'
  | 'ipv4TitleContainer'
  | 'netActionsTitle'
  | 'rDNSListItem'
  | 'multipleRDNS';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginTop: `${theme.spacing(1)}px`,
      marginBottom: `${theme.spacing(2)}px`
    },
    address: {
      width: '30%'
    },
    reverseDNS: {
      width: '30%'
    },
    defaultGateway: {
      width: '20%'
    },
    type: {
      width: '20%'
    },
    action: {
      textAlign: 'right',
      '& a': {
        marginRight: theme.spacing(1)
      }
    },
    ipv4Container: {
      [theme.breakpoints.down('sm')]: {
        justifyContent: 'flex-start',
        '& button': {
          marginLeft: -14
        }
      }
    },
    ipv4Title: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(4)
    },
    ipv4TitleContainer: {
      flex: 1,
      [theme.breakpoints.down('sm')]: {
        flexBasis: '100%'
      }
    },
    netActionsTitle: {
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(4)
    },
    rDNSListItem: {
      color: theme.palette.text.primary,
      fontSize: '.9rem',
      '&:not(:last-child)': {
        marginBottom: theme.spacing(2)
      }
    },
    multipleRDNS: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center'
    }
  });

interface State {
  linodeIPs?: LinodeIPsResponse;
  allIPs?: IPAddress[];
  removeIPDialogOpen: boolean;
  initialLoading: boolean;
  ipv6Loading: boolean;
  ipv6Error?: string;
  currentlySelectedIP?: IPAddress;
  currentlySelectedIPRange?: IPRange;
  viewIPDrawerOpen: boolean;
  viewRangeDrawerOpen: boolean;
  editRDNSDrawerOpen: boolean;
  createIPv4DrawerOpen: boolean;
  createIPv4DrawerForPublic: boolean;
  IPRequestError?: string;
  createIPv6DrawerOpen: boolean;
}

type CombinedProps = ContextProps & WithStyles<ClassNames> & DispatchProps;

// Save some typing below
export const uniqByIP = uniqBy((thisIP: IPAddress) => thisIP.address);

const getAllIPs = getAll<IPAddress>(getIPs);

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    removeIPDialogOpen: false,
    createIPv4DrawerOpen: false,
    createIPv4DrawerForPublic: true,
    createIPv6DrawerOpen: false,
    editRDNSDrawerOpen: false,
    viewIPDrawerOpen: false,
    viewRangeDrawerOpen: false,
    initialLoading: true,
    ipv6Loading: false
  };

  componentDidMount() {
    this.refreshIPs();
  }

  openRemoveIPDialog = (IPToRemove: IPAddress) => {
    this.setState({
      removeIPDialogOpen: !this.state.removeIPDialogOpen,
      currentlySelectedIP: IPToRemove
    });
  };

  closeRemoveIPDialog = () => {
    this.setState({
      removeIPDialogOpen: false,
      currentlySelectedIP: undefined
    });
  };

  refreshIPs = () => {
    this.setState({ IPRequestError: undefined });

    return getLinodeIPs(this.props.linode.id)
      .then(ips => {
        const hasIPv6Range = ips.ipv6 && ips.ipv6.global.length > 0;

        const shouldSetIPv6Loading = this.state.initialLoading;

        this.setState({ linodeIPs: ips, initialLoading: false });

        // If this user is assigned an IPv6 range in the DC this Linode resides
        // in, we request all IPs on the account, so we can look for matching
        // RDNS addresses.
        if (hasIPv6Range) {
          // Only set the IPv6 loading state if this is the initial load.
          if (shouldSetIPv6Loading) {
            this.setState({ ipv6Loading: true });
          }
          getAllIPs({}, { region: this.props.linode.region })
            .then(response => {
              this.setState({
                ipv6Loading: false,
                allIPs: response.data
              });
            })
            .catch(errorResponse => {
              const errors = getAPIErrorOrDefault(
                errorResponse,
                'There was an error retrieving your IPv6 network information.'
              );
              this.setState({
                ipv6Error: errors[0].reason,
                ipv6Loading: false
              });
            });
        }
      })
      .catch(errorResponse => {
        const errors = getAPIErrorOrDefault(
          errorResponse,
          'There was an error retrieving your network information.'
        );
        this.setState({
          IPRequestError: errors[0].reason,
          initialLoading: false
        });
      });
  };

  handleRemoveIPSuccess = (linode: Linode) => {
    /** refresh local state and redux state so our data is persistent everywhere */
    this.refreshIPs();
    this.props.upsertLinode(linode);
  };

  displayRangeDrawer = (range: IPRange) => () => {
    this.setState({
      viewRangeDrawerOpen: true,
      currentlySelectedIPRange: range
    });
  };

  displayIPDrawer = (ip: IPAddress) => () => {
    this.setState({
      viewIPDrawerOpen: true,
      currentlySelectedIP: ip
    });
  };

  handleOpenEditRDNS = (ip: IPAddress) => {
    this.setState({
      editRDNSDrawerOpen: true,
      currentlySelectedIP: ip
    });
  };

  renderRangeRow(range: IPRange, type: IPTypes) {
    const { classes } = this.props;

    // The prefix is a prerequisite for finding IPs within the range, so we
    // check for that here.
    const ipsWithRDNS = range.prefix
      ? listIPv6InRange(range.range, range.prefix, this.state.allIPs)
      : [];

    return (
      <TableRow key={range.range}>
        <TableCell parentColumn="Address">
          <React.Fragment>
            {range.range}
            <span style={{ margin: '0 5px 0 5px' }}>/</span>
            {range.prefix}
          </React.Fragment>
        </TableCell>
        <TableCell />
        <TableCell parentColumn="Reverse DNS">
          {this.renderRangeRDNSCell(range.range, ipsWithRDNS)}
        </TableCell>
        <TableCell parentColumn="Type">{type}</TableCell>
        <TableCell className={classes.action}>
          <LinodeNetworkingActionMenu
            onView={this.displayRangeDrawer(range)}
            ipType={type}
          />
        </TableCell>
      </TableRow>
    );
  }

  renderRangeRDNSCell = (range: string, ipsWithRDNS: IPAddress[]) => {
    const { classes } = this.props;

    // We don't show anything if there are no addresses.
    if (ipsWithRDNS.length === 0) {
      return null;
    }

    return (
      <div
        className={classnames({
          [classes.multipleRDNS]: ipsWithRDNS.length > 1
        })}
      >
        <span>
          <Typography>{ipsWithRDNS[0].address}</Typography>
          <Typography>{ipsWithRDNS[0].rdns}</Typography>
        </span>
        {ipsWithRDNS.length > 1 && (
          <ShowMore
            items={tail(ipsWithRDNS)}
            render={ips =>
              ips.map((ip: IPAddress) => (
                <div key={ip.address} className={classes.rDNSListItem}>
                  <Typography>{ip.address}</Typography>
                  <Typography>{ip.rdns}</Typography>
                </div>
              ))
            }
          />
        )}
      </div>
    );
  };

  renderIPRow(ip: IPAddress, type: IPTypes) {
    const { classes, readOnly } = this.props;

    return (
      <TableRow key={ip.address} data-qa-ip={ip.address}>
        <TableCell parentColumn="Address" data-qa-ip-address>
          {ip.address}
        </TableCell>
        <TableCell parentColumn="Default Gateway">{ip.gateway}</TableCell>
        <TableCell parentColumn="Reverse DNS" data-qa-rdns>
          {ip.rdns}
        </TableCell>
        <TableCell parentColumn="Type" data-qa-type={ip.type}>
          {type}
        </TableCell>
        <TableCell className={classes.action} data-qa-action>
          <LinodeNetworkingActionMenu
            onView={this.displayIPDrawer(ip)}
            onEdit={this.handleOpenEditRDNS}
            ipType={type}
            ipAddress={ip}
            onRemove={this.openRemoveIPDialog}
            readOnly={readOnly}
          />
        </TableCell>
      </TableRow>
    );
  }

  closeViewIPDrawer = () =>
    this.setState({ viewIPDrawerOpen: false, currentlySelectedIP: undefined });

  closeViewRangeDrawer = () =>
    this.setState({
      viewRangeDrawerOpen: false,
      currentlySelectedIPRange: undefined
    });

  closeEditRDNSDrawer = () => {
    this.setState({
      editRDNSDrawerOpen: false,
      currentlySelectedIP: undefined
    });
    this.refreshIPs();
  };

  closeCreateIPv4Drawer = () => {
    this.setState({
      createIPv4DrawerOpen: false
    });
    this.refreshIPs();
  };

  closeCreateIPv6Drawer = () => this.setState({ createIPv6DrawerOpen: false });

  openCreateIPv6Drawer = () => this.setState({ createIPv6DrawerOpen: true });

  openCreatePublicIPv4Drawer = () =>
    this.setState({
      createIPv4DrawerForPublic: true,
      createIPv4DrawerOpen: true
    });

  openCreatePrivateIPv4Drawer = () =>
    this.setState({
      createIPv4DrawerForPublic: false,
      createIPv4DrawerOpen: true
    });

  hasPrivateIPAddress() {
    const { linodeIPs } = this.state;
    const privateIPs = pathOr([], ['ipv4', 'private'], linodeIPs);
    return privateIPs.length > 0;
  }

  renderErrorState = () => {
    const { IPRequestError } = this.state;
    const errorText = IPRequestError
      ? IPRequestError
      : 'There was an error retrieving your networking information.';
    return <ErrorState errorText={errorText} />;
  };

  renderLoadingState = () => {
    return <CircleProgress />;
  };

  render() {
    const {
      readOnly,
      linode: { id: linodeID, label: linodeLabel, region: linodeRegion }
    } = this.props;
    const { linodeIPs, initialLoading, IPRequestError } = this.state;
    const firstPublicIPAddress = getFirstPublicIPv4FromResponse(linodeIPs);

    /* Loading state */
    if (initialLoading) {
      return this.renderLoadingState();
    }

    /* Error state */
    if (IPRequestError) {
      return this.renderErrorState();
    }

    /* Empty state */
    if (!linodeIPs || isEmpty(linodeIPs)) {
      return null;
    }

    const zoneName = ZONES[linodeRegion];

    if (!zoneName) {
      reportException(`Unknown region: ${linodeRegion}`, {
        linodeID
      });
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Networking`} />
        {readOnly && <LinodePermissionsError />}
        <LinodeNetworkingSummaryPanel
          linkLocal={path(['ipv6', 'link_local', 'address'], linodeIPs)}
          sshIPAddress={firstPublicIPAddress}
          linodeLabel={linodeLabel}
          linodeRegion={zoneName}
        />

        {this.renderIPv4()}

        {this.renderIPv6()}

        {this.renderNetworkActions()}

        <ViewIPDrawer
          open={this.state.viewIPDrawerOpen}
          onClose={this.closeViewIPDrawer}
          ip={this.state.currentlySelectedIP}
        />

        <ViewRangeDrawer
          open={this.state.viewRangeDrawerOpen}
          onClose={this.closeViewRangeDrawer}
          range={this.state.currentlySelectedIPRange}
        />

        <EditRDNSDrawer
          open={this.state.editRDNSDrawerOpen}
          onClose={this.closeEditRDNSDrawer}
          address={
            this.state.currentlySelectedIP
              ? this.state.currentlySelectedIP.address
              : undefined
          }
          rdns={
            this.state.currentlySelectedIP
              ? this.state.currentlySelectedIP.rdns
              : undefined
          }
        />

        <CreateIPv6Drawer
          open={this.state.createIPv6DrawerOpen}
          onClose={this.closeCreateIPv6Drawer}
        />

        <CreateIPv4Drawer
          forPublic={this.state.createIPv4DrawerForPublic}
          open={this.state.createIPv4DrawerOpen}
          onClose={this.closeCreateIPv4Drawer}
          linodeID={linodeID}
        />
        {this.state.currentlySelectedIP && linodeID && (
          <DeleteIPConfirm
            handleClose={this.closeRemoveIPDialog}
            IPAddress={this.state.currentlySelectedIP.address}
            open={this.state.removeIPDialogOpen}
            linode={this.props.linode}
            ipRemoveSuccess={this.handleRemoveIPSuccess}
          />
        )}
      </React.Fragment>
    );
  }

  renderIPv4 = () => {
    const { classes, readOnly } = this.props;
    const ipv4 = path<LinodeIPsResponseIPV4>(['linodeIPs', 'ipv4'], this.state);

    if (!ipv4) {
      return null;
    }

    const {
      private: _privateIPs,
      public: _publicIPs,
      shared: _sharedIPs,
      reserved: reservedIPs
    } = ipv4;

    // `ipv4.reserved` contains both Public and Private IPs, so we use the `public` field to differentiate.
    // Splitting them into two arrays so we can order as desired (Public, then Private).
    const publicReservedIps = uniqByIP(reservedIPs.filter(ip => ip.public));
    const privateReservedIps = uniqByIP(reservedIPs.filter(ip => !ip.public));
    /**
     * Customer reported an issue where a shared IP was displaying in the table multiple times.
     * We were unable to reproduce this, but added this as a safety check.
     */
    const privateIPs = uniqByIP(_privateIPs);
    const publicIPs = uniqByIP(_publicIPs);
    const sharedIPs = uniqByIP(_sharedIPs);

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item className={classes.ipv4TitleContainer}>
            <Typography
              variant="h2"
              className={classes.ipv4Title}
              data-qa-ipv4-subheading
            >
              IPv4
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip
              title={
                this.hasPrivateIPAddress()
                  ? 'This Linode has a private IPv4 address.'
                  : ''
              }
            >
              <div>
                <AddNewLink
                  onClick={this.openCreatePrivateIPv4Drawer}
                  disabled={Boolean(this.hasPrivateIPAddress()) || readOnly}
                  label="Add Private IPv4"
                />
              </div>
            </Tooltip>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openCreatePublicIPv4Drawer}
              disabled={readOnly}
              label="Add Public IPv4"
            />
          </Grid>
        </Grid>
        <Paper style={{ padding: 0 }}>
          <Table aria-label="IPv4 Addresses">
            <TableHead>
              <TableRow>
                <TableCell className={classes.address}>Address</TableCell>
                <TableCell className={classes.defaultGateway}>
                  Default Gateway
                </TableCell>
                <TableCell className={classes.reverseDNS}>
                  Reverse DNS
                </TableCell>
                <TableCell className={classes.type}>Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {publicIPs.map((ip: IPAddress) => this.renderIPRow(ip, 'Public'))}
              {privateIPs.map((ip: IPAddress) =>
                this.renderIPRow(ip, 'Private')
              )}
              {publicReservedIps.map((ip: IPAddress) =>
                this.renderIPRow(ip, 'Public Reserved')
              )}
              {privateReservedIps.map((ip: IPAddress) =>
                this.renderIPRow(ip, 'Private Reserved')
              )}
              {sharedIPs.map((ip: IPAddress) => this.renderIPRow(ip, 'Shared'))}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  };

  renderIPv6 = () => {
    const { classes, readOnly } = this.props;
    const ipv6 = path<LinodeIPsResponseIPV6>(['linodeIPs', 'ipv6'], this.state);

    if (!ipv6) {
      return null;
    }

    const { slaac, link_local, global: globalRange } = ipv6;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography
              variant="h2"
              className={classes.ipv4Title}
              data-qa-ipv6-subheading
            >
              IPv6
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openCreateIPv6Drawer}
              label="Add IPv6"
              disabled={readOnly}
            />
          </Grid>
        </Grid>
        <Paper style={{ padding: 0 }}>
          <Table aria-label="List of IPv6 Addresses">
            <TableHead>
              <TableRow>
                <TableCell className={classes.address}>Address</TableCell>
                <TableCell className={classes.defaultGateway}>
                  Default Gateway
                </TableCell>
                <TableCell className={classes.reverseDNS}>
                  Reverse DNS
                </TableCell>
                <TableCell className={classes.type}>Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.ipv6Loading ? (
                <TableRowLoading colSpan={4} firstColWidth={30} />
              ) : this.state.ipv6Error ? (
                <TableRowError colSpan={12} message={this.state.ipv6Error} />
              ) : (
                <>
                  {slaac && this.renderIPRow(slaac, 'SLAAC')}
                  {link_local && this.renderIPRow(link_local, 'Link Local')}
                  {globalRange &&
                    globalRange.map((range: IPRange) =>
                      this.renderRangeRow(range, 'Range')
                    )}
                </>
              )}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  };

  renderNetworkActions = () => {
    const {
      classes,
      linode: { id: linodeID, region: linodeRegion },
      readOnly
    } = this.props;
    const { linodeIPs } = this.state;

    const publicIPs = uniq<string>(
      pathOr([], ['ipv4', 'public'], linodeIPs).map((i: IPAddress) => i.address)
    );
    const privateIPs = uniq<string>(
      pathOr([], ['ipv4', 'private'], linodeIPs).map(
        (i: IPAddress) => i.address
      )
    );
    const sharedIPs = uniq<string>(
      pathOr([], ['ipv4', 'shared'], linodeIPs).map((i: IPAddress) => i.address)
    );

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant="h2"
            className={classes.netActionsTitle}
            data-qa-network-actions-title
          >
            Networking Actions
          </Typography>
          <IPTransferPanel
            linodeID={linodeID}
            linodeRegion={linodeRegion}
            refreshIPs={this.refreshIPs}
            ipAddresses={[...publicIPs, ...privateIPs]}
            readOnly={readOnly}
          />
          <IPSharingPanel
            linodeID={linodeID}
            linodeIPs={publicIPs}
            linodeSharedIPs={sharedIPs}
            linodeRegion={linodeRegion}
            refreshIPs={this.refreshIPs}
            updateFor={[publicIPs, sharedIPs, linodeID, linodeRegion, classes]}
            readOnly={readOnly}
          />
        </Grid>
      </Grid>
    );
  };
}

const styled = withStyles(styles);

const getFirstPublicIPv4FromResponse = compose(
  path<string>(['address']),
  head,
  pathOr([], ['ipv4', 'public'])
);

interface ContextProps {
  linode: Linode;
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  /** actually needs the whole linode for the purposes */
  linode,
  readOnly: linode._permissions === 'read_only'
}));

interface DispatchProps {
  upsertLinode: (data: Linode) => void;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: any
) => ({
  upsertLinode: linode => dispatch(_upsertLinode(linode))
});

const connected = connect(
  undefined,
  mapDispatchToProps
);

const enhanced = recompose<CombinedProps, {}>(connected, linodeContext, styled);

export default enhanced(LinodeNetworking);

// Given a range, prefix, and a list of IPs, filter out the IPs that do not
// fall within the IPv6 range.
export const listIPv6InRange = (
  range: string,
  prefix: number,
  ips: IPAddress[] = []
) => {
  return ips.filter(thisIP => {
    // Only keep addresses that:
    // 1. are part of an IPv6 range
    // 2. have RDNS set
    if (thisIP.type !== 'ipv6/range' || thisIP.rdns === null) {
      return;
    }

    // The ipaddr.js library throws an if it can't parse an IP address.
    // We'll wrap this in a try/catch block just in case something is malformed.
    try {
      // We need to typecast here so that the overloaded `match()` is typed
      // correctly.
      const addr = parseIP(thisIP.address) as IPv6;
      const parsedRange = parseIP(range) as IPv6;

      return addr.match(parsedRange, prefix);
    } catch {
      return false;
    }
  });
};
