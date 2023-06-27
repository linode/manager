import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

const useStyles = makeStyles()((theme: Theme) => ({
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
    [theme.breakpoints.down('md')]: {
      order: 2,
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
}));

interface Props {
  linodeID: number;
}

const LinodeNetworkingSummaryPanel = (props: Props) => {
  // @todo maybe move this query closer to the consuming component
  const { data: linode } = useLinodeQuery(props.linodeID);
  const { classes } = useStyles();

  if (!linode) {
    return null;
  }

  return (
    <Paper className={classes.root}>
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid xs={12} sm={6} md={2.5}>
          <NetworkTransfer linodeID={linode.id} linodeLabel={linode.label} />
        </Grid>
        <Grid xs={12} sm md className={classes.transferHistoryContainer}>
          <TransferHistory
            linodeID={linode.id}
            linodeCreated={linode.created}
          />
        </Grid>
        <Grid
          xs={12}
          sm={6}
          md={3.5}
          className={classes.dnsResolverContainer}
          sx={{
            paddingBottom: 0,
          }}
        >
          <DNSResolvers region={linode.region} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
