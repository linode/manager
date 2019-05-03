import { compose, head, isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose as recompose } from 'recompose';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
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
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { ZONES } from 'src/constants';
import { getLinodeIPs } from 'src/services/linodes';
import { upsertLinode as _upsertLinode } from 'src/store/linodes/linodes.actions';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { withLinodeDetailContext } from '../linodeDetailContext';
import LinodePermissionsError from '../LinodePermissionsError';
import CreateIPv4Drawer from './CreateIPv4Drawer';
import CreateIPv6Drawer from './CreateIPv6Drawer';
import DeleteIPConfirm from './DeleteIPConfirm';
import EditRDNSDrawer from './EditRDNSDrawer';
import IPSharingPanel from './IPSharingPanel';
import { IPTypes } from './LinodeNetworkingActionMenu';
import LinodeNetworkingActionMenu from './LinodeNetworkingActionMenu';
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
  | 'netActionsTitle';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  title: {
    marginTop: `${theme.spacing.unit}px`,
    marginBottom: `${theme.spacing.unit * 2}px`
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
      marginRight: theme.spacing.unit
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
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 4
  },
  ipv4TitleContainer: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%'
    }
  },
  netActionsTitle: {
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 4
  }
});

interface State {
  linodeIPs?: Linode.LinodeIPsResponse;
  removeIPDialogOpen: boolean;
  initialLoading: boolean;
  currentlySelectedIP?: Linode.IPAddress;
  currentlySelectedIPRange?: Linode.IPRange;
  viewIPDrawerOpen: boolean;
  viewRangeDrawerOpen: boolean;
  editRDNSDrawerOpen: boolean;
  createIPv4DrawerOpen: boolean;
  createIPv4DrawerForPublic: boolean;
  IPRequestError?: string;
  createIPv6DrawerOpen: boolean;
}

type CombinedProps = ContextProps & WithStyles<ClassNames> & DispatchProps;

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    removeIPDialogOpen: false,
    createIPv4DrawerOpen: false,
    createIPv4DrawerForPublic: true,
    createIPv6DrawerOpen: false,
    editRDNSDrawerOpen: false,
    viewIPDrawerOpen: false,
    viewRangeDrawerOpen: false,
    initialLoading: true
  };

  componentDidMount() {
    this.refreshIPs().then(() => this.setState({ initialLoading: false }));
  }

  openRemoveIPDialog = (IPToRemove: Linode.IPAddress) => {
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
      .then(ips => this.setState({ linodeIPs: ips, initialLoading: false }))
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

  handleRemoveIPSuccess = (linode: Linode.Linode) => {
    /** refresh local state and redux state so our data is persistent everywhere */
    this.refreshIPs();
    this.props.upsertLinode(linode);
  };

  displayRangeDrawer = (range: Linode.IPRange) => () => {
    this.setState({
      viewRangeDrawerOpen: true,
      currentlySelectedIPRange: range
    });
  };

  displayIPDrawer = (ip: Linode.IPAddress) => () => {
    this.setState({
      viewIPDrawerOpen: true,
      currentlySelectedIP: ip
    });
  };

  handleOpenEditRDNS = (ip: Linode.IPAddress) => {
    this.setState({
      editRDNSDrawerOpen: true,
      currentlySelectedIP: ip
    });
  };

  renderRangeRow(range: Linode.IPRange, type: IPTypes) {
    const { classes } = this.props;

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
        <TableCell />
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

  renderIPRow(ip: Linode.IPAddress, type: IPTypes) {
    const { classes, readOnly } = this.props;

    return (
      <TableRow key={ip.address} data-qa-ip={ip.address}>
        <TableCell parentColumn="Address" data-qa-ip-address>
          {ip.address}
          {type === 'Link Local' && (
            <React.Fragment>
              <span style={{ margin: '0 5px 0 5px' }}>/</span>
              {ip.prefix}
            </React.Fragment>
          )}
        </TableCell>
        <TableCell parentColumn="Default Gateway">{ip.gateway}</TableCell>
        <TableCell parentColumn="Reverse DNS" data-qa-rdns>
          {ip.rdns}
        </TableCell>
        <TableCell parentColumn="Type" data-qa-type>
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

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Networking`} />
        {readOnly && <LinodePermissionsError />}
        <LinodeNetworkingSummaryPanel
          linkLocal={path(['ipv6', 'link_local', 'address'], linodeIPs)}
          sshIPAddress={firstPublicIPAddress}
          linodeLabel={linodeLabel}
          linodeRegion={ZONES[linodeRegion]}
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
    const ipv4 = path<Linode.LinodeIPsResponseIPV4>(
      ['linodeIPs', 'ipv4'],
      this.state
    );

    if (!ipv4) {
      return null;
    }

    const {
      private: privateIPs,
      public: publicIPs,
      shared: sharedIPs,
      reserved: reservedIPs
    } = ipv4;

    // `ipv4.reserved` contains both Public and Private IPs, so we use the `public` field to differentiate.
    // Splitting them into two arrays so we can order as desired (Public, then Private).
    const publicReservedIps = reservedIPs.filter(ip => ip.public);
    const privateReservedIps = reservedIPs.filter(ip => !ip.public);

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
              {publicIPs.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Public')
              )}
              {privateIPs.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Private')
              )}
              {publicReservedIps.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Public Reserved')
              )}
              {privateReservedIps.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Private Reserved')
              )}
              {sharedIPs.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Shared')
              )}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  };

  renderIPv6 = () => {
    const { classes, readOnly } = this.props;
    const ipv6 = path<Linode.LinodeIPsResponseIPV6>(
      ['linodeIPs', 'ipv6'],
      this.state
    );

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
              {slaac && this.renderIPRow(slaac, 'SLAAC')}
              {link_local && this.renderIPRow(link_local, 'Link Local')}
              {globalRange &&
                globalRange.map((range: Linode.IPRange) =>
                  this.renderRangeRow(range, 'Range')
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

    const publicIPs = pathOr([], ['ipv4', 'public'], linodeIPs).map(
      (i: Linode.IPAddress) => i.address
    );
    const privateIPs = pathOr([], ['ipv4', 'private'], linodeIPs).map(
      (i: Linode.IPAddress) => i.address
    );
    const sharedIPs = pathOr([], ['ipv4', 'shared'], linodeIPs).map(
      (i: Linode.IPAddress) => i.address
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
  linode: Linode.Linode;
  readOnly: boolean;
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  /** actually needs the whole linode for the purposes */
  linode,
  readOnly: linode._permissions === 'read_only'
}));

interface DispatchProps {
  upsertLinode: (data: Linode.Linode) => void;
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
