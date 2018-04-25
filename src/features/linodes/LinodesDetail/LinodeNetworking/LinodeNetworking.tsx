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
}

type CombinedProps = Props & PreloadedProps & WithStyles<ClassNames>;

class LinodeNetworking extends React.Component<CombinedProps, State> {
  state = {
    linodeIPs: this.props.linodeIPs.response,
  };

  renderIPRow(ip: Linode.IPAddress | Linode.IPRange, type: string) {
    const address = (ip as Linode.IPAddress).address
      ? (ip as Linode.IPAddress).address
      : (ip as Linode.IPRange).range;
    return (
      <TableRow key={address}>
        <TableCell>
          {address}
        </TableCell>
        <TableCell>
          {(ip as Linode.IPAddress).rdns || ''}
        </TableCell>
        <TableCell>
          {type}
        </TableCell>
        <TableCell>
        </TableCell>
      </TableRow>
    );
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
                .map((ip: Linode.IPRange) =>
                  this.renderIPRow(ip, 'Range'))}
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}

const preloaded = PromiseLoader<Props>({
  linodeIPs: (props: Props) => getLinodeIPs(props.linodeID),
});

const styled = withStyles(styles, { withTheme: true });

export default preloaded(styled(LinodeNetworking));
