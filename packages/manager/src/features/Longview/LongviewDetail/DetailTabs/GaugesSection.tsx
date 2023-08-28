import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

import { Grid } from 'src/components/Grid';

import CPUGauge from '../../LongviewLanding/Gauges/CPU';
import LoadGauge from '../../LongviewLanding/Gauges/Load';
import NetworkGauge from '../../LongviewLanding/Gauges/Network';
import RAMGauge from '../../LongviewLanding/Gauges/RAM';
import StorageGauge from '../../LongviewLanding/Gauges/Storage';
import SwapGauge from '../../LongviewLanding/Gauges/Swap';

const useStyles = makeStyles()((theme: Theme) => ({
  gaugeContainer: {
    marginBottom: theme.spacing(6),
  },
  gaugesOuter: {
    [theme.breakpoints.down('lg')]: {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 450,
    },
  },
}));

interface Props {
  clientID: number;
  lastUpdatedError?: APIError[];
}

export const GaugesSection = React.memo((props: Props) => {
  const { classes } = useStyles();

  return (
    <Grid className={classes.gaugesOuter} container item md={5} xs={12}>
      <Grid className={classes.gaugeContainer} item xs={4}>
        <CPUGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid className={classes.gaugeContainer} item xs={4}>
        <RAMGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid className={classes.gaugeContainer} item xs={4}>
        <SwapGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid className={classes.gaugeContainer} item xs={4}>
        <LoadGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid className={classes.gaugeContainer} item xs={4}>
        <NetworkGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid className={classes.gaugeContainer} item xs={4}>
        <StorageGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
    </Grid>
  );
});
