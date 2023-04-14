import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2.5),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  transferHistoryContainer: {
    [theme.breakpoints.down('md')]: {
      order: 3,
    },
  },
  dnsResolverContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      order: 2,
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
}));

interface Props {
  linodeRegion: string;
  linodeID: number;
  linodeCreated: string;
  linodeLabel: string;
}

type CombinedProps = Props;

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = (props) => {
  const { linodeID, linodeRegion, linodeCreated, linodeLabel } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid xs={12} sm={6} md={3}>
          <NetworkTransfer linodeID={linodeID} linodeLabel={linodeLabel} />
        </Grid>
        <Grid xs={12} sm md className={classes.transferHistoryContainer}>
          <TransferHistory linodeID={linodeID} linodeCreated={linodeCreated} />
        </Grid>
        <Grid
          xs={12}
          sm={6}
          md={3}
          className={classes.dnsResolverContainer}
          sx={{
            paddingBottom: 0,
          }}
        >
          <DNSResolvers region={linodeRegion} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
