import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import { getLinodeIPs } from 'src/services/linodes';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';

import LinodeNetworkingActionMenu from './LinodeNetworkingActionMenu';
import ViewIPDrawer from './ViewIPDrawer';

type ClassNames =
  'root'
  | 'ipv4Title'
  | 'ipv6Title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  ipv4Title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
  ipv6Title: {
    marginTop: theme.spacing.unit * 2,
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
}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state: State = {
    linodeIPs: this.props.linodeIPs.response,
    viewIPDrawer: {
      open: false,
    },
  };

  renderRangeRow(range: Linode.IPRange, type: string) {
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
        <TableCell>
          <LinodeNetworkingActionMenu
            onView={() => console.log(range)}
            onEdit={() => console.log(range)}
          />
        </TableCell>
      </TableRow>
    );
  }

  renderIPRow(ip: Linode.IPAddress, type: string) {
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
        <TableCell>
          <LinodeNetworkingActionMenu
            onView={() => {
              this.setState({ viewIPDrawer:
                { open: true, ip },
              });
            }}
            onEdit={() => console.log(ip)}
          />
        </TableCell>
      </TableRow>
    );
  }

  closeViewIPDrawer() {
    this.setState({ viewIPDrawer:
      { open: false, ip: undefined },
    });
  }

  render() {
    const { classes } = this.props;
    const { linodeIPs } = this.state;

    return (
      <React.Fragment>
        <Typography
          variant="headline"
          className={classes.ipv4Title}
          data-qa-title
        >
          IPv4
        </Typography>
        <Paper style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Reverse DNS</TableCell>
                <TableCell>Type</TableCell>
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

        <Typography
          variant="headline"
          className={classes.ipv6Title}
        >
          IPv6
        </Typography>
        <Paper style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Reverse DNS</TableCell>
                <TableCell>Type</TableCell>
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
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<Props>({
  linodeIPs: (props: Props) => getLinodeIPs(props.linodeID),
});

const styled = withStyles(styles, { withTheme: true });

export default preloaded(styled(LinodeNetworking));
