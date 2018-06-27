import * as React from 'react';
import { compose, path, pathOr, head } from 'ramda';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import { getLinodeIPs } from 'src/services/linodes';

import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import { ZONES } from 'src/constants';

import AddNewLink from 'src/components/AddNewLink';
import CreateIPv4Drawer from './CreateIPv4Drawer';
import CreateIPv6Drawer from './CreateIPv6Drawer';
import EditRDNSDrawer from './EditRDNSDrawer';
import LinodeNetworkingActionMenu from './LinodeNetworkingActionMenu';
import IPTransferPanel from './LinodeNetworkingIPTransferPanel';
import ViewIPDrawer from './ViewIPDrawer';
import ViewRangeDrawer from './ViewRangeDrawer';

import LinodeNetworkingSummaryPanel from './LinodeNetworkingSummaryPanel';

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
  | 'ipv4TitleContainer';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
  }
});

interface Props {
  linodeID: number;
  linodeRegion: string;
  linodeLabel: string;
}

interface PreloadedProps {
  linodeIPs: PromiseLoaderResponse<Linode.LinodeIPsResponse>;
}

interface State {
  linodeIPs: Linode.LinodeIPsResponse;
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

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

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
    linodeIPs: this.props.linodeIPs.response,
    viewIPDrawer: {
      open: false,
    },
    viewRangeDrawer: {
      open: false,
    },
  };

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
        <TableCell>
          {range.range}
        </TableCell>
        <TableCell />
        <TableCell>
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
        <TableCell data-qa-ip-address>
          {ip.address}
        </TableCell>
        <TableCell>
          {ip.gateway}
        </TableCell>
        <TableCell data-qa-rdns>
          {ip.rdns}
        </TableCell>
        <TableCell data-qa-type>
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

  closeViewRangeDrawer = () => this.setState({ viewRangeDrawer: { open: false, range: undefined }, })

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

  openCreatePublicIPv4Drawer = () => this.setState({ createIPv4Drawer: { ...this.state.createIPv4Drawer, open: true, forPublic: true } })

  openCreatePrivateIPv4Drawer = () => this.setState({ createIPv4Drawer: { ...this.state.createIPv4Drawer, open: true, forPublic: false } })

  hasPrivateIPAddress() {
    const { linodeIPs } = this.state;
    return Boolean(linodeIPs.ipv4.private.length);
  }

  render() {
    const { classes, linodeID, linodeLabel, linodeRegion } = this.props;
    const { linodeIPs } = this.state;
    const firstPublicIPAddress = getFirstPublicIPv4FromResponse(linodeIPs);
    return (
      <React.Fragment>

        <LinodeNetworkingSummaryPanel
          linkLocal={path(['ipv6', 'link_local', 'address'], linodeIPs)}
          sshIPAddress={firstPublicIPAddress}
          linodeLabel={linodeLabel}
          linodeRegion={ZONES[linodeRegion]}
        />

        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item className={classes.ipv4TitleContainer}>
            <Typography
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
          <Table>
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
              {linodeIPs.ipv4.public.map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Public'))}
              {linodeIPs.ipv4.private.map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Private'))}
              {linodeIPs.ipv4.shared.map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Shared'))}
            </TableBody>
          </Table>
        </Paper>

        <Grid
          container
          justify="space-between"
          alignItems="flex-end">
          <Grid item>
            <Typography
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
          <Table>
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
              {[linodeIPs.ipv6.slaac].map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'SLAAC'))}
              {[linodeIPs.ipv6.link_local].map((ip: Linode.IPAddress) => this.renderIPRow(ip, 'Link Local'))}
              {linodeIPs.ipv6.global.map((range: Linode.IPRange) => this.renderRangeRow(range, 'Range'))}
            </TableBody>
          </Table>
        </Paper>

        <IPTransferPanel
          linodeID={linodeID}
          linodeRegion={linodeRegion}
          refreshIPs={this.refreshIPs}
          ipAddresses={[
            ...linodeIPs.ipv4.public.map(i => i.address),
            ...linodeIPs.ipv4.private.map(i => i.address),
          ]}
        />

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
}

const preloaded = PromiseLoader<Props>({
  linodeIPs: (props: Props) => getLinodeIPs(props.linodeID),
});

const styled = withStyles(styles, { withTheme: true });

const getFirstPublicIPv4FromResponse = compose(
  path<string>(['address']),
  head,
  pathOr([], ['ipv4', 'public']),
);

export default preloaded(styled(LinodeNetworking));
