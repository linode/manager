import { ZoneName } from '@linode/api-v4/lib/networking';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import DNSResolvers from './DNSResolvers';
import NetworkTransfer from './NetworkTransfer';
import TransferHistory from './TransferHistory';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2) + theme.spacing(1) / 2
  }
}));

interface Props {
  linodeRegion: ZoneName;
  linodeID: number;
  linodeCreated: string;
}

type CombinedProps = Props;

const LinodeNetworkingSummaryPanel: React.FC<CombinedProps> = props => {
  const { linodeID, linodeRegion, linodeCreated } = props;
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        justify="space-between"
        alignItems="flex-start"
      >
        <Grid item xs={3}>
          <NetworkTransfer linodeID={linodeID} />
        </Grid>
        <Grid item xs={6}>
          <TransferHistory linodeID={linodeID} linodeCreated={linodeCreated} />
        </Grid>
        <Grid item xs={3}>
          <DNSResolvers region={linodeRegion} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(LinodeNetworkingSummaryPanel);
