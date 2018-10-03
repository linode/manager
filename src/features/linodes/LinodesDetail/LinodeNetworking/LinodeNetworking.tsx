import { compose, equals, head, path, pathOr } from 'ramda';
import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import AddNewLink from 'src/components/AddNewLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { ZONES } from 'src/constants';
import { getLinodeIPs } from 'src/services/linodes';

import { withLinode } from '../context';
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
  'root'
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

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginTop: `${theme.spacing.unit}px`,
    marginBottom: `${theme.spacing.unit * 2}px`,
  },
  address: {
    width: '30%',
  },
  reverseDNS: {
    width: '30%',
  },
  defaultGateway: {
    width: '20%',
  },
  type: {
    width: '20%',
  },
  action: {
    textAlign: 'right',
    '& a': {
      marginRight: theme.spacing.unit,
    },
  },
  ipv4Container: {
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
      '& button': {
        marginLeft: -14,
      },
    },
  },
  ipv4Title: {
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 4,
  },
  ipv4TitleContainer: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flexBasis: '100%',
    },
  },
  netActionsTitle: {
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 4,
  },
});

interface ContextProps {
  linodeID: number;
  linodeRegion: string;
  linodeLabel: string;
}

interface PreloadedProps {
  linodeIPs: PromiseLoaderResponse<Linode.LinodeIPsResponse>;
}

interface State {
  linodeIPs?: Linode.LinodeIPsResponse;
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

type CombinedProps = PreloadedProps & ContextProps & WithStyles<ClassNames>;

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    createIPv4Drawer: {
      forPublic: true,
      open: false,
    },
    createIPv6Drawer: {
      open: false,
    },
    editRDNSDrawer: {
      open: false,
    },
    linodeIPs: path<Linode.LinodeIPsResponse>(['linodeIPs', 'response'], this.props),
    viewIPDrawer: {
      open: false,
    },
    viewRangeDrawer: {
      open: false,
    },
  };

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const maybeNewLinodeIPs =
      path<Linode.LinodeIPsResponse>(['linodeIPs', 'response'], this.props);
    const oldLinodeIPs =
      path<Linode.LinodeIPsResponse>(['linodeIPs', 'response'], prevProps); 
    if (!equals(maybeNewLinodeIPs, oldLinodeIPs)) {
      this.setState({
        linodeIPs: maybeNewLinodeIPs,
      });
    }
  }

  refreshIPs = () => {
    return getLinodeIPs(this.props.linodeID)
      .then(ips => this.setState({ linodeIPs: ips }))
      .catch(() => {
        /* @todo: we need a pattern for handling these errors */
      });
  }

  displayRangeDrawer = (range: Linode.IPRange) => () => {
    this.setState({
      viewRangeDrawer: { open: true, range },
    })
  }

  displayIPDrawer = (ip: Linode.IPAddress) => () => {
    this.setState({
      viewIPDrawer: { open: true, ip },
    });
  }

  renderRangeRow(range: Linode.IPRange, type: string) {
    const { classes } = this.props;

    return (
      <TableRow key={range.range}>
        <TableCell parentColumn="Address">
          {range.range}
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell parentColumn="Type">
          {type}
        </TableCell>
        <TableCell className={classes.action}>
          <LinodeNetworkingActionMenu
            onView={this.displayRangeDrawer(range)}
          />
        </TableCell>
      </TableRow>
    );
  }

  renderIPRow(ip: Linode.IPAddress, type: string) {
    /* Don't show edit RDNS for private IP addresses */
    const onEditAction = (type === 'Private' || type === 'Link Local')
      ? undefined
      : () => {
        this.setState({
          editRDNSDrawer: { open: true, address: ip.address, rdns: ip.rdns },
        });
      };
    const { classes } = this.props;

    return (
      <TableRow key={ip.address} data-qa-ip={ip.address}>
        <TableCell parentColumn="Address" data-qa-ip-address>
          {ip.address}
        </TableCell>
        <TableCell parentColumn="Default Gateway">
          {ip.gateway}
        </TableCell>
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

  closeViewIPDrawer = () => this.setState({ viewIPDrawer: { open: false, ip: undefined }, })

  closeViewRangeDrawer = () => this.setState(
    { viewRangeDrawer: { open: false, range: undefined }, })

  closeEditRDNSDrawer = () => {
    this.setState({ editRDNSDrawer: { open: false, address: undefined, rnds: undefined }, });
    this.refreshIPs()
  }

  closeCreateIPv4Drawer = () => {
    this.setState({ createIPv4Drawer: { ...this.state.createIPv4Drawer, open: false }, });
    this.refreshIPs()
  }

  closeCreateIPv6Drawer = () => this.setState({ createIPv6Drawer: { open: false } });

  openCreateIPv6Drawer = () => this.setState({ createIPv6Drawer: { open: true } })

  openCreatePublicIPv4Drawer = () => this.setState(
    { createIPv4Drawer: { ...this.state.createIPv4Drawer, open: true, forPublic: true } })

  openCreatePrivateIPv4Drawer = () => this.setState(
    { createIPv4Drawer: { ...this.state.createIPv4Drawer, open: true, forPublic: false } })

  hasPrivateIPAddress() {
    const { linodeIPs } = this.state;
    const privateIPs = pathOr([], ['ipv4', 'private'], linodeIPs);
    return privateIPs.length > 0;
  }

  render() {
    const { linodeID, linodeLabel, linodeRegion } = this.props;
    const { linodeIPs } = this.state;
    const firstPublicIPAddress = getFirstPublicIPv4FromResponse(linodeIPs);

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
    const ipv4 = path<Linode.LinodeIPsResponseIPV4>(['linodeIPs', 'ipv4'], this.state);

    if (!ipv4) { return null; }

    const { private: privateIPs, public: publicIPs, shared: sharedIPs } = ipv4;

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item className={classes.ipv4TitleContainer}>
            <Typography
              role="header"
              variant="title"
              className={classes.ipv4Title}
              data-qa-ipv4-subheading
            >
              IPv4
            </Typography>
          </Grid>
          <Grid item>
            <Tooltip title={this.hasPrivateIPAddress()
              ? 'This Linode has a private IPv4 address.'
              : ''
            }>
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
                <TableCell className={classes.defaultGateway}>Default Gateway</TableCell>
                <TableCell className={classes.reverseDNS}>Reverse DNS</TableCell>
                <TableCell className={classes.type}>Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {publicIPs.map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Public'))}
              {privateIPs.map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Private'))}
              {sharedIPs.map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Shared'))}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  };

  renderIPv6 = () => {
    const { classes } = this.props;
    const ipv6 = path<Linode.LinodeIPsResponseIPV6>(['linodeIPs', 'ipv6'], this.state);

    if (!ipv6) { return null; }

    const { slaac, link_local, global: globalRange } = ipv6;

    return (
      <React.Fragment>
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
        >
          <Grid item>
            <Typography
              role="header"
              variant="title"
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
            />
          </Grid>
        </Grid>
        <Paper style={{ padding: 0 }}>
          <Table aria-label="List of IPv6 Addresses">
            <TableHead>
              <TableRow>
                <TableCell className={classes.address}>Address</TableCell>
                <TableCell className={classes.defaultGateway}>Default Gateway</TableCell>
                <TableCell className={classes.reverseDNS}>Reverse DNS</TableCell>
                <TableCell className={classes.type}>Type</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {slaac && this.renderIPRow(slaac, 'SLAAC')}
              {link_local && this.renderIPRow(link_local, 'Link Local')}
              {globalRange && globalRange.map((range: Linode.IPRange) => this.renderRangeRow(range, 'Range'))}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    )
  }

  renderNetworkActions = () => {
    const { classes, linodeID, linodeRegion } = this.props;
    const { linodeIPs } = this.state;

    if (!linodeIPs) { return null; }

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography
            role="header"
            variant="title"
            className={classes.netActionsTitle}
            data-qa-network-actions-title
          >
            Networking Actions
        </Typography>
          <IPTransferPanel
            linodeID={linodeID}
            linodeRegion={linodeRegion}
            refreshIPs={this.refreshIPs}
            ipAddresses={[
              ...linodeIPs.ipv4.public.map(i => i.address),
              ...linodeIPs.ipv4.private.map(i => i.address),
            ]}
          />
          <IPSharingPanel
            linodeID={linodeID}
            linodeIPs={[
              ...linodeIPs.ipv4.public.map(i => i.address),
            ]}
            linodeSharedIPs={[
              ...linodeIPs.ipv4.shared.map(i => i.address),
            ]}
            linodeRegion={linodeRegion}
            refreshIPs={this.refreshIPs}
          />
        </Grid>
      </Grid>
    );
  }
}

const preloaded = PromiseLoader<CombinedProps & ContextProps>({
  linodeIPs: props => getLinodeIPs(props.linodeID),
});

const styled = withStyles(styles, { withTheme: true });

const getFirstPublicIPv4FromResponse = compose(
  path<string>(['address']),
  head,
  pathOr([], ['ipv4', 'public']),
);

const linodeContext = withLinode((context) => ({
  linodeID: context.data!.id,
  linodeLabel: context.data!.label,
  linodeRegion: context.data!.region,
}));

const enhanced = compose<any, any, any, any>(
  linodeContext,
  preloaded,
  styled,
);

export default enhanced(LinodeNetworking);
