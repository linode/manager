import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import Paper from 'src/components/core/Paper';
import { useLinodeQuery } from 'src/queries/linodes/linodes';

import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';

const useStyles = makeStyles()((theme: Theme) => ({
  dnsResolverContainer: {
    display: 'flex',
    [theme.breakpoints.down('md')]: {
      order: 2,
    },
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
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
        <Grid md={2.5} sm={6} xs={12}>
          <NetworkTransfer linodeID={linode.id} linodeLabel={linode.label} />
        </Grid>
        <Grid className={classes.transferHistoryContainer} md sm xs={12}>
          <TransferHistory
            linodeCreated={linode.created}
            linodeID={linode.id}
          />
        </Grid>
        <Grid
          sx={{
            paddingBottom: 0,
          }}
          className={classes.dnsResolverContainer}
          md={3.5}
          sm={6}
          xs={12}
        >
          <DNSResolvers region={linode.region} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
