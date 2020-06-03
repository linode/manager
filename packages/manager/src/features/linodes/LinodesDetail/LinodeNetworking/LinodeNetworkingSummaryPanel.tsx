import { ZoneName } from '@linode/api-v4/lib/networking';
import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import CopyTooltip from 'src/components/CopyTooltip';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IPAddress from 'src/features/linodes/LinodesLanding/IPAddress';
import { MapState } from 'src/store/types';

import { getIPv6DNSResolvers, ipv4DNSResolvers } from './resolvers';

type ClassNames =
  | 'root'
  | 'title'
  | 'section'
  | 'individualContainer'
  | 'ips'
  | 'error';

const styles = (theme: Theme) =>
  createStyles({
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
  });

const styled = withStyles(styles);

interface Props {
  linodeRegion: ZoneName;
  linodeLabel: string;
  linkLocal?: string;
  sshIPAddress?: string;
}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

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

const StyledSummarySection = styled(SummarySection);

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = props => {
  const { classes, sshIPAddress, username, linodeRegion, linodeLabel } = props;

  const v4Resolvers = getIPv4DNSResolvers(linodeRegion);
  const v6Resolvers = getIPv6DNSResolvers(linodeRegion);

  const renderErrorMessage = () => (
    <Typography className={classes.error} component="span">
      There was an error loading DNS resolvers.
    </Typography>
  );

  return (
    <Grid container justify="space-between">
      <Grid item xs={12}>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="h2" className={classes.title} data-qa-title>
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
                renderValue={
                  v4Resolvers.length > 0
                    ? renderDNSResolvers(v4Resolvers)
                    : renderErrorMessage
                }
              />
              <StyledSummarySection
                title="DNS Resolvers (IPv6)"
                renderValue={
                  v6Resolvers.length > 0
                    ? renderDNSResolvers(v6Resolvers)
                    : renderErrorMessage
                }
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
  username: state.__resources?.profile?.data?.username
});

const connected = connect(mapStateToProps);

export default restyled(
  connected(LinodeNetworkingSummaryPanel)
) as React.ComponentType<Props>;

const getIPv4DNSResolvers = (region: string) => {
  return pathOr(ipv4DNSResolvers.newark, [region], ipv4DNSResolvers);
};

const renderDNSResolvers = (ips: string[]) => () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <IPAddress ips={ips} copyRight showMore />
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
