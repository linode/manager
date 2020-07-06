import { ZoneName } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { getIPv6DNSResolvers, ipv4DNSResolvers } from './resolvers';

interface Props {
  region: ZoneName;
}

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    paddingBottom: theme.spacing() / 2
  },
  ipAddress: {
    lineHeight: 1.43
  }
}));

const getIPv4DNSResolvers = (region: ZoneName) => {
  return ipv4DNSResolvers[region] ?? ipv4DNSResolvers.newark;
};

export const DNSResolvers: React.FC<Props> = props => {
  const { region } = props;
  const classes = useStyles();

  const v4Resolvers = getIPv4DNSResolvers(region);
  const v6Resolvers = getIPv6DNSResolvers(region);

  return (
    <div>
      <Typography className={classes.header}>
        <strong>DNS Resolvers</strong>
      </Typography>
      <Grid container direction="row" wrap="nowrap" spacing={4}>
        <Grid item>
          {v4Resolvers.map(thisAddress => (
            <Typography
              key={`ip-resolver-item-${thisAddress}`}
              className={classes.ipAddress}
            >
              {thisAddress}
            </Typography>
          ))}
        </Grid>
        <Grid item>
          {v6Resolvers.map(thisAddress => (
            <Typography
              key={`ip-resolver-item-${thisAddress}`}
              className={classes.ipAddress}
            >
              {thisAddress}
            </Typography>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default React.memo(DNSResolvers);
