import { head, path, tail } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/Grid';
import ShowMore from 'src/components/ShowMore';

type ClassNames = 'root'
  | 'title'
  | 'section';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
    paddingBottom: 20,
  },
  section: {
    marginBottom: theme.spacing.unit,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  linodeRegion: string;
  linodeLabel: string;
  linkLocal?: string;
  sshIPAddress?: string;
}

interface ConnectedProps {
  username: string;
}

type CombinedProps = Props & ConnectedProps & WithStyles<ClassNames>;

const SummarySection: React.StatelessComponent<any> = ({
  title,
  renderValue,
  ...rest
}) => (
    <Grid container style={{ marginTop: '8px' }}>
      <Grid item >
        <Typography variant="caption">
          <strong>{title}:</strong>
        </Typography>
      </Grid>
      <Grid item style={{ flex: 1 }}>{renderValue(rest)}</Grid>
    </Grid>
  )

const ipv4DNSResolvers = [
  '66.228.42.5',
  '96.126.106.5',
  '50.116.53.5',
  '50.116.58.5',
  '50.116.61.5',
  '50.116.62.5',
  '66.175.211.5',
  '97.107.133.4',
  '207.192.69.4',
  '207.192.69.5',
];

const ipv6DNSResolvers = [
  '2600:3c03::5',
  '2600:3c03::6',
  '2600:3c03::7',
  '2600:3c03::8',
  '2600:3c03::9',
  '2600:3c03::b',
  '2600:3c03::c',
];

const LinodeNetworkingSummaryPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, sshIPAddress, username, linodeRegion, linodeLabel } = props;
  return (
    <Grid container justify="space-between" alignItems="flex-end">
      <Grid item xs={12}>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="headline">Access</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <SummarySection title="DNS Resolvers (IPv4)" renderValue={renderIPv4DNSResolvers()} />

              <SummarySection title="DNS Resolvers (IPv6)" renderValue={renderIPv6DNSResolvers()} />

            </Grid>
            <Grid item xs={12} sm={6}>
              <SummarySection title="SSH Access" renderValue={renderSSHLink(sshIPAddress)} />

              {username && linodeRegion &&
                <SummarySection title="Lish via SSH" renderValue={renderLishLink(username, linodeRegion, linodeLabel)} />}

            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

const styled = withStyles(styles, { withTheme: true });

const connected = connect((state: Linode.AppState) => ({
  username: path(['resources', 'profile', 'data', 'username'], state),
}));

export default styled(connected(LinodeNetworkingSummaryPanel)) as React.ComponentType<Props>;

const renderIPv4DNSResolvers = () => () => (
  <React.Fragment>
    <Typography variant="caption" style={{ display: 'inline-block' }}>{head(ipv4DNSResolvers)}</Typography>
    <ShowMore items={tail(ipv4DNSResolvers)} render={renderAddresses} chipProps={{ style: { marginRight: '8px' } }} />
  </React.Fragment>);

const renderIPv6DNSResolvers = () => () => (
  <React.Fragment>
    <Typography variant="caption" style={{ display: 'inline-block' }}> {head(ipv6DNSResolvers)}</Typography>
    <ShowMore items={tail(ipv6DNSResolvers)} render={renderAddresses} />
  </React.Fragment>);

const renderAddresses = (addresses: string[]) => addresses.map(a =>
  <Typography variant="caption" key={a} style={{ marginBottom: '4px', marginTop: '4px' }}>{a}</Typography>)

const renderSSHLink = (address?: string) => () =>
  <React.Fragment>
    <Typography variant="caption" style={{ display: 'inline-block' }}>ssh root@{address}</Typography>
    <CopyTooltip text={`ssh root@${address}`} />
  </React.Fragment>

const renderLishLink = (username: string, region: string, linodeLabel: string) => () =>
  <React.Fragment>
    <Typography variant="caption" style={{ display: 'inline-block' }}>
      ssh -t {username}@lish-{region}.linode.com {linodeLabel}
    </Typography>
    <CopyTooltip text={`ssh -t ${username}@lish-${region}.linode.com ${linodeLabel}`} />
  </React.Fragment>

