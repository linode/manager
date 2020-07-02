import { ZoneName } from '@linode/api-v4/lib/networking';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { MapState } from 'src/store/types';

import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';

import { getIPv6DNSResolvers, ipv4DNSResolvers } from './resolvers';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2) + theme.spacing(1) / 2
  },
  section: {
    marginBottom: theme.spacing(1)
  },
  title: {
    marginBottom: theme.spacing(1)
  },
  individualContainer: {
    marginBottom: theme.spacing(1)
  },
  ips: {
    padding: `0 ${theme.spacing(1)}px !important`
  },
  error: {
    color: theme.palette.status.errorDark
  }
}));

interface Props {
  linodeRegion: ZoneName;
  linodeLabel: string;
  linkLocal?: string;
  sshIPAddress?: string;
}

type CombinedProps = Props & StateProps;

const SummarySection: React.FC<any> = props => {
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

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = props => {
  const { sshIPAddress, username, linodeRegion, linodeLabel } = props;
  const classes = useStyles();

  const v4Resolvers = getIPv4DNSResolvers(linodeRegion);
  const v6Resolvers = getIPv6DNSResolvers(linodeRegion);

  const renderErrorMessage = () => (
    <Typography className={classes.error} component="span">
      There was an error loading DNS resolvers.
    </Typography>
  );

  return (
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid item xs={4}>
          <NetworkTransfer />
        </Grid>
        <Grid item xs={4}>
          <TransferHistory />
        </Grid>
        <Grid item xs={4}>
          <DNSResolvers />
        </Grid>
      </Grid>
    </Paper>
  );
};

interface StateProps {
  username?: string;
}

const mapStateToProps: MapState<StateProps, Props> = state => ({
  username: state.__resources?.profile?.data?.username
});

const connected = connect(mapStateToProps);

export default connected(LinodeNetworkingSummaryPanel) as React.ComponentType<
  Props
>;

const getIPv4DNSResolvers = (region: string) => {
  return pathOr(ipv4DNSResolvers.newark, [region], ipv4DNSResolvers);
};

const renderDNSResolvers = (ips: string[]) => () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <IPAddress ips={ips} copyRight showMore />
  </div>
);
