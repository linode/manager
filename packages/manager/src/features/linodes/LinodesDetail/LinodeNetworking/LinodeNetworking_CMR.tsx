import {
  getLinodeIPs,
  Linode,
  LinodeIPsResponse
} from '@linode/api-v4/lib/linodes';
import { getIPs, IPAddress, IPRange } from '@linode/api-v4/lib/networking';
import { IPv6, parse as parseIP } from 'ipaddr.js';
import { compose, head, isEmpty, path, pathOr, uniq, uniqBy } from 'ramda';
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
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import { ZONES } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { upsertLinode as _upsertLinode } from 'src/store/linodes/linodes.actions';
import capitalize from 'src/utilities/capitalize';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import CreateIPv4Drawer from './CreateIPv4Drawer';
import CreateIPv6Drawer from './CreateIPv6Drawer';
import DeleteIPConfirm from './DeleteIPConfirm';
import EditRDNSDrawer from './EditRDNSDrawer';
import IPSharingPanel from './IPSharingPanel';
import LinodeNetworkingActionMenu from './LinodeNetworkingActionMenu_CMR';
import { IPTypes } from './types';
import IPTransferPanel from './LinodeNetworkingIPTransferPanel';
import LinodeNetworkingSummaryPanel from './LinodeNetworkingSummaryPanel';
import ViewIPDrawer from './ViewIPDrawer';
import ViewRangeDrawer from './ViewRangeDrawer';
import ViewRDNSDrawer from './ViewRDNSDrawer';

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
  | 'multipleRDNSButton'
  | 'multipleRDNSText'
  | 'errorText'
  | 'loader'
  | 'rangeRDNSCell';

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
    multipleRDNSButton: {
      ...theme.applyLinkStyles
    },
    multipleRDNSText: {
      color: theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.light
      }
    },
    errorText: {
      color: theme.color.red
    },
    loader: {
      padding: 0
    },
    rangeRDNSCell: {
      '& .data': {
        display: 'flex',
        alignItems: 'center',
        minHeight: 32
      }
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
  viewRDNSDrawerOpen: boolean;
  createIPv4DrawerOpen: boolean;
  createIPv4DrawerForPublic: boolean;
  IPRequestError?: string;
  createIPv6DrawerOpen: boolean;
}

type CombinedProps = ContextProps & WithStyles<ClassNames> & DispatchProps;

// Save some typing below
export const uniqByIP = uniqBy((thisIP: IPAddress) => thisIP.address);

// The API returns an error if more than 100 IPs are requested.
const getAllIPs = getAll<IPAddress>(getIPs, 100);

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    removeIPDialogOpen: false,
    createIPv4DrawerOpen: false,
    createIPv4DrawerForPublic: true,
    createIPv6DrawerOpen: false,
    editRDNSDrawerOpen: false,
    viewRDNSDrawerOpen: false,
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

  handleOpenEditRDNSForRange = (range: IPRange) => {
    this.setState({
      editRDNSDrawerOpen: true,
      currentlySelectedIPRange: range
    });
  };

  renderRangeRDNSCell = (ipRange: IPRange) => {
    const { classes } = this.props;
    const { allIPs, ipv6Loading } = this.state;

    const { range, prefix } = ipRange;

    // The prefix is a prerequisite for finding IPs within the range, so we check for that here.
    const ipsWithRDNS =
      prefix && range ? listIPv6InRange(range, prefix, allIPs) : [];

    if (ipv6Loading) {
      return <CircleProgress noPadding mini />;
    }

    // We don't show anything if there are no addresses.
    if (ipsWithRDNS.length === 0) {
      return null;
    }

    if (ipsWithRDNS.length === 1) {
      return (
        <span>
          <Typography>{ipsWithRDNS[0].address}</Typography>
          <Typography>{ipsWithRDNS[0].rdns}</Typography>
        </span>
      );
    }

    return (
      <button
        className={classes.multipleRDNSButton}
        onClick={() =>
          this.setState({
            viewRDNSDrawerOpen: true,
            currentlySelectedIPRange: ipRange
          })
        }
        aria-label={`View the ${ipsWithRDNS.length} RDNS Addresses`}
      >
        <Typography className={classes.multipleRDNSText}>
          {ipsWithRDNS.length} Addresses
        </Typography>
      </button>
    );
  };

  renderIPRow = (ipDisplay: IPDisplay) => {
    const { classes, readOnly } = this.props;
    const { address, type, gateway, subnetMask, rdns, _ip, _range } = ipDisplay;

    return (
      <TableRow key={address} data-qa-ip={address}>
        <TableCell parentColumn="Address" data-qa-ip-address>
          {address}
        </TableCell>
        <TableCell parentColumn="Type" data-qa-ip-address>
          {type}
        </TableCell>
        <TableCell parentColumn="Default Gateway">{gateway}</TableCell>
        <TableCell parentColumn="Subnet Mask">{subnetMask}</TableCell>
        <TableCell parentColumn="Reverse DNS" data-qa-rdns>
          {_range ? this.renderRangeRDNSCell(_range) : rdns}
        </TableCell>
        <TableCell className={classes.action} data-qa-action>
          {_ip ? (
            <LinodeNetworkingActionMenu
              onView={this.displayIPDrawer(_ip)}
              onEdit={this.handleOpenEditRDNS}
              ipType={type}
              ipAddress={_ip}
              onRemove={this.openRemoveIPDialog}
              readOnly={readOnly}
            />
          ) : _range ? (
            <LinodeNetworkingActionMenu
              onView={this.displayRangeDrawer(_range)}
              ipType={type}
              ipAddress={_range}
              onEdit={() => this.handleOpenEditRDNSForRange(_range)}
            />
          ) : null}
        </TableCell>
      </TableRow>
    );
  };

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
      currentlySelectedIP: undefined,
      currentlySelectedIPRange: undefined
    });
    this.refreshIPs();
  };

  closeViewRDNSDrawer = () => {
    this.setState({
      viewRDNSDrawerOpen: false,
      currentlySelectedIPRange: undefined
    });
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

  updateIPs = (ip: IPAddress) => {
    // Mostly to avoid null checking.
    if (!this.state.allIPs) {
      return;
    }

    // Look for this IP address in state.
    const foundIPIndex = this.state.allIPs.findIndex(
      eachIP => eachIP.address === ip.address
    );

    // If this address is not yet in state, append it.
    if (foundIPIndex === -1) {
      this.setState({ allIPs: [...this.state.allIPs, ip] });
    } else {
      // If we already have the address in state, update it.
      const updatedIPS = this.state.allIPs;
      updatedIPS[foundIPIndex] = ip;
      this.setState({ allIPs: updatedIPS });
    }
  };

  render() {
    const {
      readOnly,
      linode: { id: linodeID, label: linodeLabel, region: linodeRegion }
    } = this.props;
    const {
      linodeIPs,
      initialLoading,
      IPRequestError,
      currentlySelectedIPRange
    } = this.state;
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

    const ipsWithRDNS =
      currentlySelectedIPRange && currentlySelectedIPRange.prefix
        ? listIPv6InRange(
            currentlySelectedIPRange.range,
            currentlySelectedIPRange.prefix,
            this.state.allIPs
          )
        : [];

    return (
      <div
        id="tabpanel-networking"
        role="tabpanel"
        aria-labelledby="tab-networking"
      >
        <DocumentTitleSegment segment={`${linodeLabel} - Networking`} />
        {readOnly && <LinodePermissionsError />}
        <LinodeNetworkingSummaryPanel
          linkLocal={path(['ipv6', 'link_local', 'address'], linodeIPs)}
          sshIPAddress={firstPublicIPAddress}
          linodeLabel={linodeLabel}
          linodeRegion={zoneName}
        />

        {this.renderIPTable()}

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
          range={
            this.state.currentlySelectedIPRange
              ? this.state.currentlySelectedIPRange.range
              : undefined
          }
          ips={ipsWithRDNS}
          updateIPs={
            this.state.currentlySelectedIPRange ? this.updateIPs : undefined
          }
        />

        <ViewRDNSDrawer
          open={this.state.viewRDNSDrawerOpen}
          onClose={this.closeViewRDNSDrawer}
          ips={ipsWithRDNS}
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
      </div>
    );
  }

  renderIPTable = () => {
    const { classes, readOnly } = this.props;

    const ipDisplay = ipResponseToDisplayRows(this.state.linodeIPs);

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
          {/* @todo: It'd be nice if we could always sort by public -> private. */}
          <OrderBy data={ipDisplay} orderBy="type" order="asc">
            {({ data: orderedData, handleOrderChange, order, orderBy }) => {
              return (
                <Table aria-label="IPv4 Addresses">
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.address}>Address</TableCell>
                      <TableSortCell
                        className={classes.address}
                        label="type"
                        direction={order}
                        active={orderBy === 'type'}
                        handleClick={handleOrderChange}
                      >
                        Type
                      </TableSortCell>
                      <TableCell className={classes.defaultGateway}>
                        Default Gateway
                      </TableCell>
                      <TableCell className={classes.defaultGateway}>
                        Subnet Mask
                      </TableCell>
                      <TableCell className={classes.reverseDNS}>
                        Reverse DNS
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>{orderedData.map(this.renderIPRow)}</TableBody>
                </Table>
              );
            }}
          </OrderBy>
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

const connected = connect(undefined, mapDispatchToProps);

const enhanced = recompose<CombinedProps, {}>(connected, linodeContext, styled);

export default enhanced(LinodeNetworking);

// =============================================================================
// Utilities
// =============================================================================

// Given a range, prefix, and a list of IPs, filter out the IPs that do not fall within the IPv6 range.
export const listIPv6InRange = (
  range: string,
  prefix: number,
  ips: IPAddress[] = []
) => {
  return ips.filter(thisIP => {
    // Only keep addresses that:
    // 1. are part of an IPv6 range or pool
    // 2. have RDNS set
    if (
      !['ipv6/range', 'ipv6/pool'].includes(thisIP.type) ||
      thisIP.rdns === null
    ) {
      // eslint-disable-next-line array-callback-return
      return;
    }

    // The ipaddr.js library throws an if it can't parse an IP address.
    // We'll wrap this in a try/catch block just in case something is malformed.
    try {
      // We need to typecast here so that the overloaded `match()` is typed correctly.
      const addr = parseIP(thisIP.address) as IPv6;
      const parsedRange = parseIP(range) as IPv6;

      return addr.match(parsedRange, prefix);
    } catch {
      return false;
    }
  });
};

// Higher-level IP address display for the IP Table.
interface IPDisplay {
  address: string;
  type: IPTypes;
  gateway?: string | null;
  subnetMask?: string | null;
  rdns?: string[] | null;
  // Not for display, but useful for lower-level components.
  _ip?: IPAddress;
  _range?: IPRange;
}

export const ipResponseToDisplayRows = (
  ipResponse?: LinodeIPsResponse
): IPDisplay[] => {
  if (!ipResponse) {
    return [];
  }

  const { ipv4, ipv6 } = ipResponse;

  const ipDisplay = [
    ...mapIPv4Display(ipv4.public, 'public'),
    ...mapIPv4Display(ipv4.private, 'private'),
    ...mapIPv4Display(ipv4.reserved, 'reserved'),
    ...mapIPv4Display(ipv4.shared, 'shared')
  ];

  if (ipv6?.slaac) {
    ipDisplay.push(ipToDisplay(ipv6.slaac, 'SLAAC'));
  }

  if (ipv6?.link_local) {
    ipDisplay.push(ipToDisplay(ipv6?.link_local, 'link local'));
  }

  if (ipv6?.global) {
    ipDisplay.push(
      ...ipv6.global.map(thisIP => {
        let address = thisIP.range;
        if (thisIP.prefix && thisIP.route_target) {
          address += ` / ${thisIP.prefix} routed to ${thisIP.route_target}`;
        }

        return {
          type: 'IPv6 – Range' as IPDisplay['type'],
          address,
          _range: thisIP
        };
      })
    );
  }

  return ipDisplay;
};

type ipKey =
  | 'public'
  | 'private'
  | 'reserved'
  | 'shared'
  | 'SLAAC'
  | 'link local';

const mapIPv4Display = (ips: IPAddress[], key: ipKey): IPDisplay[] => {
  return ips.map(ip => ipToDisplay(ip, key));
};

const ipToDisplay = (ip: IPAddress, key: ipKey): IPDisplay => {
  return {
    address: ip.address,
    gateway: ip.gateway,
    subnetMask: ip.subnet_mask,
    rdns: ip.rdns ? [ip.rdns] : null,
    type: createType(ip, key) as IPDisplay['type'],
    _ip: ip
  };
};

export const createType = (ip: IPAddress, key: ipKey) => {
  let type = '';
  type += ip.type === 'ipv4' ? 'IPv4' : 'IPv6';

  type += ' – ';

  if (key === 'shared') {
    type += ip.public ? 'Shared (public)' : 'Shared (private)';
  } else {
    type += capitalize(key);
  }

  return type;
};
