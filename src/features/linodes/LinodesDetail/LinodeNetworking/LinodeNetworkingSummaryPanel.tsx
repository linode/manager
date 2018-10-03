import { path } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CopyTooltip from 'src/components/CopyTooltip';
import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';

type ClassNames = 'root'
  | 'title'
  | 'section'
  | 'individualContainer'
  | 'ips';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
    paddingBottom: 20,
  },
  section: {
    marginBottom: theme.spacing.unit,
  },
  title: {
    marginBottom: theme.spacing.unit,
  },
  individualContainer: {
    marginBottom: theme.spacing.unit,
  },
  ips: {
    padding: `0 ${theme.spacing.unit}px !important`,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props {
  linodeRegion: string;
  linodeLabel: string;
  linkLocal?: string;
  sshIPAddress?: string;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

const SummarySection: React.StatelessComponent<any> = (props) => {
  const { title, renderValue, classes, ...rest } = props;

  return (
    <Grid container alignItems="baseline" className={classes.individualContainer}>
      <Grid item>
        <Typography variant="caption">
          <strong>{title}:</strong>
        </Typography>
      </Grid>
      <Grid item className={classes.ips}>{renderValue(rest)}</Grid>
    </Grid>
  )
}

const StyledSummarySection = styled(SummarySection);

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
    <Grid container justify="space-between">
      <Grid item xs={12}>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item xs={12}>
              <Typography role="header" variant="headline" className={classes.title} data-qa-title>Access</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledSummarySection title="SSH Access" renderValue={renderSSHLink(sshIPAddress)} />
              {username && linodeRegion &&
                <StyledSummarySection title="Lish via SSH" renderValue={renderLishLink(username, linodeRegion, linodeLabel)} />}
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledSummarySection title="DNS Resolvers (IPv4)" renderValue={renderIPv4DNSResolvers()} />
              <StyledSummarySection title="DNS Resolvers (IPv6)" renderValue={renderIPv6DNSResolvers()} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

const restyled = withStyles(styles, { withTheme: true });

interface StateProps {
  username?: string;
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state) => ({
  username: path(['data', 'username'], state.__resources.profile),
});

const connected = connect(mapStateToProps);

export default restyled(connected(LinodeNetworkingSummaryPanel)) as React.ComponentType<Props>;

const renderIPv4DNSResolvers = () => () => (
  <div style={{ display: 'flex', alignItems: "center" }}>
    <IPAddress ips={ipv4DNSResolvers} copyRight />
  </div>
)

const renderIPv6DNSResolvers = () => () => (
  <div style={{ display: 'flex', alignItems: "center" }}>
    <IPAddress ips={ipv6DNSResolvers} copyRight />
  </div>
)

const renderSSHLink = (address?: string) => () => (
  <div style={{ display: 'flex', alignItems: "center" }}>
    <Grid item><Typography variant="caption"><span style={{ marginLeft: 3 }} >ssh root@{address}</span></Typography></Grid>
    <Grid item><CopyTooltip text={`ssh root@${address}`} standAlone /></Grid>
  </div>
)

const renderLishLink = (username: string, region: string, linodeLabel: string) => () => (
  <div style={{ display: 'flex', alignItems: "center" }}>
    <Grid item>
      <Typography variant="caption">ssh -t {username}@lish-{region}.linode.com {linodeLabel}</Typography>
    </Grid>
    <Grid item><CopyTooltip text={`ssh -t ${username}@lish-${region}.linode.com ${linodeLabel}`} standAlone /></Grid>
  </div>
)
