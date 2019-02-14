import { compose, head, isEmpty, path, pathOr } from 'ramda';
import * as React from 'react';
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
import { withLinodeDetailContext } from '../linodeDetailContext';
import CreateIPv4Drawer from './CreateIPv4Drawer';
import CreateIPv6Drawer from './CreateIPv6Drawer';
import EditRDNSDrawer from './EditRDNSDrawer';
import IPSharingPanel from './IPSharingPanel';
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

interface ContextProps {
  linodeID: number;
  linodeRegion: string;
  linodeLabel: string;
}

interface State {
  linodeIPs?: Linode.LinodeIPsResponse;
  initialLoading: boolean;
  IPRequestError?: string;
  viewIPDrawer: {
    open: boolean;
    ip?: Linode.IPAddress;
  };
  viewRangeDrawer: {
    open: boolean;
    range?: Linode.IPRange;
  };
  editRDNSDrawer: {
    open: boolean;
    address?: string;
    rdns?: string;
  };
  createIPv4Drawer: {
    forPublic: boolean;
    open: boolean;
  };
  createIPv6Drawer: {
    open: boolean;
  };
}

type CombinedProps = ContextProps & WithStyles<ClassNames>;

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    createIPv4Drawer: {
      forPublic: true,
      open: false
    },
    createIPv6Drawer: {
      open: false
    },
    editRDNSDrawer: {
      open: false
    },
    viewIPDrawer: {
      open: false
    },
    viewRangeDrawer: {
      open: false
    },
    initialLoading: true
  };

  componentDidMount() {
    this.refreshIPs().then(() => this.setState({ initialLoading: false }));
  }

  refreshIPs = () => {
    this.setState({ IPRequestError: undefined });
    return getLinodeIPs(this.props.linodeID)
      .then(ips => this.setState({ linodeIPs: ips, initialLoading: false }))
      .catch(errorResponse => {
        const defaultError = [
          { reason: 'There was an error retrieving your network information.' }
        ];
        const errors = pathOr(
          defaultError,
          ['response', 'data', 'errors'],
          errorResponse
        );
        this.setState({
          IPRequestError: errors[0].reason,
          initialLoading: false
        });
      });
  };

  displayRangeDrawer = (range: Linode.IPRange) => () => {
    this.setState({
      viewRangeDrawer: { open: true, range }
    });
  };

  displayIPDrawer = (ip: Linode.IPAddress) => () => {
    this.setState({
      viewIPDrawer: { open: true, ip }
    });
  };

  renderRangeRow(range: Linode.IPRange, type: string) {
    const { classes } = this.props;

    return (
      <TableRow key={range.range}>
        <TableCell parentColumn="Address">{range.range}</TableCell>
        <TableCell />
        <TableCell />
        <TableCell parentColumn="Type">{type}</TableCell>
        <TableCell className={classes.action}>
          <LinodeNetworkingActionMenu onView={this.displayRangeDrawer(range)} />
        </TableCell>
      </TableRow>
    );
  }

  renderIPRow(ip: Linode.IPAddress, type: string) {
    /* Don't show edit RDNS for private IP addresses */
    const onEditAction =
      type === 'Private' || type === 'Link Local'
        ? undefined
        : () => {
            this.setState({
              editRDNSDrawer: { open: true, address: ip.address, rdns: ip.rdns }
            });
          };
    const { classes } = this.props;

    return (
      <TableRow key={ip.address} data-qa-ip={ip.address}>
        <TableCell parentColumn="Address" data-qa-ip-address>
          {ip.address}
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
            onEdit={onEditAction}
          />
        </TableCell>
      </TableRow>
    );
  }

  closeViewIPDrawer = () =>
    this.setState({ viewIPDrawer: { open: false, ip: undefined } });

  closeViewRangeDrawer = () =>
    this.setState({ viewRangeDrawer: { open: false, range: undefined } });

  closeEditRDNSDrawer = () => {
    this.setState({
      editRDNSDrawer: { open: false, address: undefined, rnds: undefined }
    });
    this.refreshIPs();
  };

  closeCreateIPv4Drawer = () => {
    this.setState({
      createIPv4Drawer: { ...this.state.createIPv4Drawer, open: false }
    });
    this.refreshIPs();
  };

  closeCreateIPv6Drawer = () =>
    this.setState({ createIPv6Drawer: { open: false } });

  openCreateIPv6Drawer = () =>
    this.setState({ createIPv6Drawer: { open: true } });

  openCreatePublicIPv4Drawer = () =>
    this.setState({
      createIPv4Drawer: {
        ...this.state.createIPv4Drawer,
        open: true,
        forPublic: true
      }
    });

  openCreatePrivateIPv4Drawer = () =>
    this.setState({
      createIPv4Drawer: {
        ...this.state.createIPv4Drawer,
        open: true,
        forPublic: false
      }
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
    const { linodeID, linodeLabel, linodeRegion } = this.props;
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
          open={this.state.viewIPDrawer.open}
          onClose={this.closeViewIPDrawer}
          ip={this.state.viewIPDrawer.ip}
        />

        <ViewRangeDrawer
          open={this.state.viewRangeDrawer.open}
          onClose={this.closeViewRangeDrawer}
          range={this.state.viewRangeDrawer.range}
        />

        <EditRDNSDrawer
          open={this.state.editRDNSDrawer.open}
          onClose={this.closeEditRDNSDrawer}
          address={this.state.editRDNSDrawer.address}
          rdns={this.state.editRDNSDrawer.rdns}
        />

        <CreateIPv6Drawer
          open={this.state.createIPv6Drawer.open}
          onClose={this.closeCreateIPv6Drawer}
        />

        <CreateIPv4Drawer
          forPublic={this.state.createIPv4Drawer.forPublic}
          open={this.state.createIPv4Drawer.open}
          onClose={this.closeCreateIPv4Drawer}
          linodeID={linodeID}
        />
      </React.Fragment>
    );
  }

  renderIPv4 = () => {
    const { classes } = this.props;
    const ipv4 = path<Linode.LinodeIPsResponseIPV4>(
      ['linodeIPs', 'ipv4'],
      this.state
    );

    if (!ipv4) {
      return null;
    }

    const { private: privateIPs, public: publicIPs, shared: sharedIPs } = ipv4;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item className={classes.ipv4TitleContainer}>
            <Typography
              role="header"
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
                  disabled={Boolean(this.hasPrivateIPAddress())}
                  label="Add Private IPv4"
                />
              </div>
            </Tooltip>
          </Grid>
          <Grid item>
            <AddNewLink
              onClick={this.openCreatePublicIPv4Drawer}
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
    const { classes } = this.props;
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
              role="header"
              variant="h2"
              className={classes.ipv4Title}
              data-qa-ipv6-subheading
            >
              IPv6
            </Typography>
          </Grid>
          <Grid item>
            <AddNewLink onClick={this.openCreateIPv6Drawer} label="Add IPv6" />
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
    const { classes, linodeID, linodeRegion } = this.props;
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
            role="header"
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
          />
          <IPSharingPanel
            linodeID={linodeID}
            linodeIPs={publicIPs}
            linodeSharedIPs={sharedIPs}
            linodeRegion={linodeRegion}
            refreshIPs={this.refreshIPs}
            updateFor={[publicIPs, sharedIPs, linodeID, linodeRegion]}
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

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeID: linode.id,
  linodeLabel: linode.label,
  linodeRegion: linode.region
}));

const enhanced = compose<any, any, any>(
  linodeContext,
  styled
);

export default enhanced(LinodeNetworking);
