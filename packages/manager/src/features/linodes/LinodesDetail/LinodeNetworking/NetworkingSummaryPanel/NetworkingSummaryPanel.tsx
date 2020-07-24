import { ZoneName } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';
import Hidden from 'src/components/core/Hidden';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2) + theme.spacing(1) / 2
  },
  transferHistoryContainer: {
    padding: '16px 0px',
    [theme.breakpoints.up('sm')]: {
      padding: '0px 16px'
    },
    [theme.breakpoints.up('md')]: {
      padding: '0px 32px'
    }
  },
  dnsResolverContainer: {
    paddingTop: 8,
    [theme.breakpoints.up('md')]: {
      paddingTop: 0
    }
  }
}));

interface Props {
  linodeRegion: ZoneName;
  linodeID: number;
  linodeCreated: string;
  linodeLabel: string;
}

type CombinedProps = Props;

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = props => {
  const { linodeID, linodeRegion, linodeCreated, linodeLabel } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
      >
        <Grid xs={12} sm={3}>
          <NetworkTransfer linodeID={linodeID} linodeLabel={linodeLabel} />
        </Grid>
        <Grid
          xs={12}
          sm={9}
          md={6}
          lg={7}
          className={classes.transferHistoryContainer}
        >
          <TransferHistory linodeID={linodeID} linodeCreated={linodeCreated} />
        </Grid>
        <Hidden smDown>
          <Grid md={3} lg={2} className={classes.dnsResolverContainer}>
            <DNSResolvers region={linodeRegion} />
          </Grid>
        </Hidden>
      </Grid>
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
