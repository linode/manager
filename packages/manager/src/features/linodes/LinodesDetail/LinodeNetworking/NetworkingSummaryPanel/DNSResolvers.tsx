import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import useRegions from 'src/hooks/useRegions';

interface Props {
  region: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflowX: 'scroll',
    overflowY: 'hidden',
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  },
  wrapper: {
    marginTop: 2,
    marginRight: 0,
    width: '100%',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'space-between'
    }
  },
  header: {
    position: 'absolute'
  },
  ipAddress: {
    lineHeight: 1.43
  }
}));

export const DNSResolvers: React.FC<Props> = props => {
  const { region } = props;
  const classes = useStyles();
  const regions = useRegions();

  const linodeRegion = regions.entities.find(
    thisRegion => thisRegion.id === region
  );

  const v4Resolvers = linodeRegion?.resolvers?.ipv4.split(',') ?? [];
  const v6Resolvers = linodeRegion?.resolvers?.ipv6.split(',') ?? [];

  return (
    <div className={classes.root}>
      <Typography className={classes.header}>
        <strong>DNS Resolvers</strong>
      </Typography>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        spacing={4}
        className={classes.wrapper}
      >
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
        <Grid item style={{ paddingRight: 0 }}>
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
