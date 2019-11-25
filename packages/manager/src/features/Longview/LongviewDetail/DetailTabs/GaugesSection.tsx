import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';

import CPUGauge from '../../LongviewLanding/Gauges/CPU';
import LoadGauge from '../../LongviewLanding/Gauges/Load';
import NetworkGauge from '../../LongviewLanding/Gauges/Network';
import RAMGauge from '../../LongviewLanding/Gauges/RAM';
import StorageGauge from '../../LongviewLanding/Gauges/Storage';
import SwapGauge from '../../LongviewLanding/Gauges/Swap';

const useStyles = makeStyles((theme: Theme) => ({
  gaugeContainer: {
    marginBottom: theme.spacing(4)
  },
  gaugesOuter: {
    [theme.breakpoints.up('lg')]: {
      maxWidth: 450
    }
  }
}));

interface Props {
  clientID: number;
  lastUpdatedError?: APIError[];
}

const GaugesSection: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <Grid container item xs={12} md={4} lg={6} className={classes.gaugesOuter}>
      <Grid item xs={4} className={classes.gaugeContainer}>
        <CPUGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid item xs={4} className={classes.gaugeContainer}>
        <RAMGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid item xs={4} className={classes.gaugeContainer}>
        <SwapGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid item xs={4} className={classes.gaugeContainer}>
        <LoadGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid item xs={4} className={classes.gaugeContainer}>
        <NetworkGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid item xs={4} className={classes.gaugeContainer}>
        <StorageGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
    </Grid>
  );
};

export default compose<Props, Props>(React.memo)(GaugesSection);
