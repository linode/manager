import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import Grid from 'src/components/Grid';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import Table from 'src/components/Table';
import IconTextLink from 'src/components/IconTextLink';
import { getLinodeIPs } from 'src/services/linodes';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';

import LinodeNetworkingActionMenu from './LinodeNetworkingActionMenu';
import ViewIPDrawer from './ViewIPDrawer';
import ViewRangeDrawer from './ViewRangeDrawer';
import CreateIPv4Drawer from './CreateIPv4Drawer';
import CreateIPv6Drawer from './CreateIPv6Drawer';
import EditRDNSDrawer from './EditRDNSDrawer';

type ClassNames =
  'root'
  | 'title'
  | 'address'
  | 'reverseDNS'
  | 'type'
  | 'action'
  | 'ipv4Title'
  | 'ipv6Title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    margin: `${theme.spacing.unit * 2}px 0`,
  },
  address: {
    width: '35%',
  },
  reverseDNS: {
    width: '35%',
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
  ipv4Title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  ipv6Title: {
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  linodeID: number;
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
    open: boolean;
  };
  createIPv6Drawer: {
    open: boolean;
  };
}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    linodeIPs: this.props.linodeIPs.response,
    viewIPDrawer: {
      open: false,
    },
    viewRangeDrawer: {
      open: false,
    },
    editRDNSDrawer: {
      open: false,
    },
    createIPv4Drawer: {
      open: false,
    },
    createIPv6Drawer: {
      open: false,
    },
  };

  refreshIPs() {
    getLinodeIPs(this.props.linodeID)
      .then(ips => this.setState({ linodeIPs: ips }))
      .catch(() => {
        /* @todo: we need a pattern for handling these errors */
      });
  }

  renderRangeRow(range: Linode.IPRange, type: string) {
    const { classes } = this.props;

    return (
      <TableRow key={range.range}>
        <TableCell>
          {range.range}
        </TableCell>
        <TableCell>
        </TableCell>
        <TableCell>
          {type}
        </TableCell>
        <TableCell className={classes.action}>
          <LinodeNetworkingActionMenu
            onView={() => {
              this.setState({
                viewRangeDrawer: { open: true, range },
              });
            }}
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
      <TableRow key={ip.address}>
        <TableCell>
          {ip.address}
        </TableCell>
        <TableCell>
          {ip.rdns}
        </TableCell>
        <TableCell>
          {type}
        </TableCell>
        <TableCell className={classes.action}>
          <LinodeNetworkingActionMenu
            onView={() => {
              this.setState({
                viewIPDrawer: { open: true, ip },
              });
            }}
            onEdit={onEditAction}
          />
        </TableCell>
      </TableRow>
    );
  }

  closeViewIPDrawer() {
    this.setState({
      viewIPDrawer: { open: false, ip: undefined },
    });
  }

  closeViewRangeDrawer() {
    this.setState({
      viewRangeDrawer: { open: false, range: undefined },
    });
  }

  closeEditRDNSDrawer() {
    this.setState({
      editRDNSDrawer: { open: false, address: undefined, rnds: undefined },
    });
    this.refreshIPs();
  }

  closeCreateIPv4Drawer() {
    this.setState({
      createIPv4Drawer: { open: false },
    });
    this.refreshIPs();
  }

  closeCreateIPv6Drawer() {
    this.setState({
      createIPv6Drawer: { open: false },
    });
  }

  render() {
    const { classes, linodeID } = this.props;
    const { linodeIPs } = this.state;

    return (
      <React.Fragment>
        <Typography variant="headline" className={classes.title}>
          Networking
        </Typography>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography
              variant="title"
              className={classes.ipv4Title}
              data-qa-title
            >
              IPv4
            </Typography>
          </Grid>
          <Grid item>
            <IconTextLink
              SideIcon={PlusSquare}
              onClick={() => {
                this.setState({ createIPv4Drawer: { open: true } });
              }}
              text="Add Public IPv4"
              title="Add Public IPv4"
            />
          </Grid>
        </Grid>
        <Paper style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.address}>Address</TableCell>
                <TableCell className={classes.reverseDNS}>Reverse DNS</TableCell>
                <TableCell className={classes.type}>Type</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linodeIPs.ipv4.public.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Public'))}
              {linodeIPs.ipv4.private.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Private'))}
              {linodeIPs.ipv4.shared.map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Shared'))}
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
              className={classes.ipv6Title}
              data-qa-title
            >
              IPv6
            </Typography>
          </Grid>
          <Grid item>
            <IconTextLink
              SideIcon={PlusSquare}
              onClick={() => this.setState({ createIPv6Drawer: { open: true } })}
              text="Add IPv6"
              title="Add IPv6"
            />
          </Grid>
        </Grid>
        <Paper style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.address}>Address</TableCell>
                <TableCell className={classes.reverseDNS}>Reverse DNS</TableCell>
                <TableCell className={classes.type}>Type</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[linodeIPs.ipv6.slaac].map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'SLAAC'))}
              {[linodeIPs.ipv6.link_local].map((ip: Linode.IPAddress) =>
                this.renderIPRow(ip, 'Link Local'))}
              {linodeIPs.ipv6.global
                .map((range: Linode.IPRange) =>
                  this.renderRangeRow(range, 'Range'))}
            </TableBody>
          </Table>
        </Paper>

        <ViewIPDrawer
          open={this.state.viewIPDrawer.open}
          onClose={() => this.closeViewIPDrawer()}
          ip={this.state.viewIPDrawer.ip }
        />

        <ViewRangeDrawer
          open={this.state.viewRangeDrawer.open}
          onClose={() => this.closeViewRangeDrawer()}
          range={this.state.viewRangeDrawer.range }
        />

        <EditRDNSDrawer
          open={this.state.editRDNSDrawer.open}
          onClose={() => this.closeEditRDNSDrawer()}
          address={this.state.editRDNSDrawer.address}
          rdns={this.state.editRDNSDrawer.rdns}
        />

        <CreateIPv6Drawer
          open={this.state.createIPv6Drawer.open}
          onClose={() => this.closeCreateIPv6Drawer()}
        />

        <CreateIPv4Drawer
          open={this.state.createIPv4Drawer.open}
          onClose={() => this.closeCreateIPv4Drawer()}
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

export default preloaded(styled(LinodeNetworking));
