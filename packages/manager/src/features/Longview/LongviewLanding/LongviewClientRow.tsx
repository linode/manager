import * as React from 'react';
import { compose } from 'recompose';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import CPUGauge from './Gauges/CPU';

import { useClientLastUpdated } from '../shared/useClientLastUpdated';
import LoadGauge from './Gauges/Load';
import NetworkGauge from './Gauges/Network';
import RAMGauge from './Gauges/RAM';
import StorageGauge from './Gauges/Storage';
import SwapGauge from './Gauges/Swap';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';
import LongviewClientHeader from './LongviewClientHeader';
import LongviewClientInstructions from './LongviewClientInstructions';

import withLongviewClients, {
  DispatchProps
} from 'src/containers/longview.container';
import withClientStats, {
  Props as LVDataProps
} from 'src/containers/longview.stats.container';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3)
  },
  gaugeContainer: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2)
    }
  },
  button: {
    padding: 0,
    '&:hover': {
      color: theme.color.red
    }
  },
  label: {}
}));

interface Props extends ActionHandlers {
  clientID: number;
  clientLabel: string;
  clientAPIKey: string;
  clientInstallKey: string;
  longviewClientLastUpdated: number;
}

type CombinedProps = Props & LVDataProps & DispatchProps;

const LongviewClientRow: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    clientID,
    clientLabel,
    clientAPIKey,
    triggerDeleteLongviewClient,
    clientInstallKey,
    updateLongviewClient,
    longviewClientLastUpdated
  } = props;

  const { lastUpdated, lastUpdatedError, authed } = useClientLastUpdated(
    clientAPIKey,
    () => props.getClientStats(clientAPIKey)
  );

  /**
   * We want to show a "waiting for data" state
   * until data has been returned.
   */
  if (!authed || lastUpdated === 0) {
    return (
      <LongviewClientInstructions
        clientID={clientID}
        clientLabel={clientLabel}
        clientAPIKey={clientAPIKey}
        installCode={clientInstallKey}
        triggerDeleteLongviewClient={triggerDeleteLongviewClient}
        updateLongviewClient={updateLongviewClient}
      />
    );
  }

  return (
    <Paper className={classes.root}>
      <Grid
        container
        wrap="nowrap"
        justify="space-between"
        alignItems="flex-start"
        aria-label="List of Your Longview Clients"
        data-testid="longview-client-row"
      >
        <Grid item xs={11}>
          <Grid container>
            <Grid item xs={12} md={3}>
              <LongviewClientHeader
                clientID={clientID}
                clientLabel={clientLabel}
                lastUpdatedError={lastUpdatedError}
                updateLongviewClient={updateLongviewClient}
                longviewClientLastUpdated={longviewClientLastUpdated}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <CPUGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <RAMGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <SwapGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <LoadGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <NetworkGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
                <Grid item xs={4} sm={2} className={classes.gaugeContainer}>
                  <StorageGauge
                    clientID={clientID}
                    lastUpdatedError={lastUpdatedError}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container justify="flex-end">
            <Grid item>
              <ActionMenu
                longviewClientID={clientID}
                longviewClientLabel={clientLabel}
                triggerDeleteLongviewClient={triggerDeleteLongviewClient}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withClientStats<Props>(ownProps => ownProps.clientID),
  /** We only need the update action here, easier than prop drilling through 4 components */
  withLongviewClients(() => ({}))
)(LongviewClientRow);
