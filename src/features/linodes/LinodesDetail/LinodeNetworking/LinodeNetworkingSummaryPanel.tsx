import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import CopyTooltip from 'src/components/CopyTooltip';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { MapState } from 'src/store/types';

type ClassNames = 'root' | 'title' | 'section' | 'individualContainer' | 'ips';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 2 + theme.spacing.unit / 2
  },
  section: {
    marginBottom: theme.spacing.unit
  },
  title: {
    marginBottom: theme.spacing.unit
  },
  individualContainer: {
    marginBottom: theme.spacing.unit
  },
  ips: {
    padding: `0 ${theme.spacing.unit}px !important`
  }
});

const styled = withStyles(styles);

interface Props {
  linodeRegion: string;
  linodeLabel: string;
  linkLocal?: string;
  sshIPAddress?: string;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

const SummarySection: React.StatelessComponent<any> = props => {
  const { title, renderValue, classes, ...rest } = props;

  return (
    <Grid
      container
      alignItems="baseline"
      className={classes.individualContainer}
    >
      <Grid item>
        <Typography variant="body1">
          <strong>{title}:</strong>
        </Typography>
      </Grid>
      <Grid item className={classes.ips}>
        {renderValue(rest)}
      </Grid>
    </Grid>
  );
};

const StyledSummarySection = styled(SummarySection);

const ipv4DNSResolvers = [
  // @todo this is a lot of items to display in a single list, and each DC has ~8.
  // Probably will need a different UX here.
  '172.105.0.5',
  '172.105.3.5',
  '172.105.4.5',
  '172.105.5.5',
  '172.105.6.5',
  '172.105.7.5',
  '172.105.8.5',
  '172.105.9.5',
  '172.105.10.5',
  '172.105.11.5',
  '66.228.42.5',
  '96.126.106.5',
  '50.116.53.5',
  '50.116.58.5',
  '50.116.61.5',
  '50.116.62.5',
  '66.175.211.5',
  '97.107.133.4',
  '207.192.69.4',
  '207.192.69.5'
];

const ipv6DNSResolvers = [
  '2600:3c00::', // Dallas, TX
  '2600:3c01::', // Fremont, CA
  '2600:3c02::', // Atlanta, GA
  '2600:3c03::', // Newark, NJ
  '2a01:7e00::', // London, UK
  '2400:8900::', // Tokyo, JP
  '2400:8901::', // Singapore, SG
  '2a01:7e01::', // Frankfurt, DE
  '2400:8902::', // Shinagawa1, JP
  '2600:3C04::' // Toronto, CAN
];

const LinodeNetworkingSummaryPanel: React.StatelessComponent<
  CombinedProps
> = props => {
  const { classes, sshIPAddress, username, linodeRegion, linodeLabel } = props;
  return (
    <Grid container justify="space-between">
      <Grid item xs={12}>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item xs={12}>
              <Typography
                role="header"
                variant="h2"
                className={classes.title}
                data-qa-title
              >
                Access
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledSummarySection
                title="SSH Access"
                renderValue={renderSSHLink(sshIPAddress)}
              />
              {username && linodeRegion && (
                <StyledSummarySection
                  title="Lish via SSH"
                  renderValue={renderLishLink(
                    username,
                    linodeRegion,
                    linodeLabel
                  )}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledSummarySection
                title="DNS Resolvers (IPv4)"
                renderValue={renderIPv4DNSResolvers()}
              />
              <StyledSummarySection
                title="DNS Resolvers (IPv6)"
                renderValue={renderIPv6DNSResolvers()}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

const restyled = withStyles(styles);

interface StateProps {
  username?: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  username: path(['data', 'username'], state.__resources.profile)
});

const connected = connect(mapStateToProps);

export default restyled(
  connected(LinodeNetworkingSummaryPanel)
) as React.ComponentType<Props>;

const renderIPv4DNSResolvers = () => () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <IPAddress ips={ipv4DNSResolvers} copyRight showMore />
  </div>
);

const renderIPv6DNSResolvers = () => () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <IPAddress ips={ipv6DNSResolvers} copyRight showMore />
  </div>
);

const renderSSHLink = (address?: string) => () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Grid item>
      <Typography variant="body1">
        <span style={{ marginLeft: 3 }}>ssh root@{address}</span>
      </Typography>
    </Grid>
    <Grid item>
      <CopyTooltip text={`ssh root@${address}`} standAlone />
    </Grid>
  </div>
);

const renderLishLink = (
  username: string,
  region: string,
  linodeLabel: string
) => () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Grid item>
      <Typography variant="body1">
        ssh -t {username}@lish-{region}.linode.com {linodeLabel}
      </Typography>
    </Grid>
    <Grid item>
      <CopyTooltip
        text={`ssh -t ${username}@lish-${region}.linode.com ${linodeLabel}`}
        standAlone
      />
    </Grid>
  </div>
);
