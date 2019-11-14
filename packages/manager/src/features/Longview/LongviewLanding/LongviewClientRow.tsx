import Close from '@material-ui/icons/Close';
import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import IconButton from 'src/components/core/IconButton';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import CPUGauge from './Gauges/CPU';

import { getLastUpdated } from '../request';
import LoadGauge from './Gauges/Load';
import NetworkGauge from './Gauges/Network';
import RAMGauge from './Gauges/RAM';
import StorageGauge from './Gauges/Storage';
import SwapGauge from './Gauges/Swap';
import LongviewClientHeader from './LongviewClientHeader';
import LongviewClientInstructions from './LongviewClientInstructions';

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

interface Props {
  clientID: number;
  clientLabel: string;
  clientAPIKey: string;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

type CombinedProps = Props & LVDataProps;

const LongviewClientRow: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  let requestInterval: NodeJS.Timeout;
  let mounted = true;

  const {
    clientID,
    clientLabel,
    clientAPIKey,
    triggerDeleteLongviewClient
  } = props;

  /*
   lastUpdated _might_ come back from the endpoint as 0, so it's important
   that we differentiate between _0_ and _undefined_
   */
  const [lastUpdated, setLastUpdated] = React.useState<number | undefined>(
    undefined
  );
  const currentLastUpdated = React.useRef(lastUpdated);
  const [lastUpdatedError, setLastUpdatedError] = React.useState<
    APIError[] | undefined
  >();
  const [authed, setAuthed] = React.useState<boolean>(true);

  const requestAndSetLastUpdated = () => {
    /*
     get the current last updated value 

     This function is called as a closure inside the onMount useEffect
     so we need to use a ref to get the new value
    */
    const { current: newLastUpdated } = currentLastUpdated;

    setLastUpdatedError(undefined);

    return getLastUpdated(clientAPIKey)
      .then(response => {
        /*
          only update _lastUpdated_ state if it hasn't already been set
          or the API response is in a time past what's already been set.
        */
        if (
          mounted &&
          (typeof newLastUpdated === 'undefined' ||
            pathOr(0, ['updated'], response) > newLastUpdated)
        ) {
          setLastUpdated(response.updated);
          props.getClientStats(props.clientAPIKey);
        }
      })
      .catch(e => {
        /**
         * The first request we make after creating a new client will almost always
         * return an authentication failed error.
         */
        const reason = pathOr('', [0, 'reason'], e);

        if (mounted) {
          if (reason.match(/authentication/i)) {
            setAuthed(false);
          }

          /* only set lastUpdated error if we haven't already gotten data before */
          if (typeof newLastUpdated === 'undefined') {
            setLastUpdatedError(e);
          }
        }
      });
  };

  React.useEffect(() => {
    /*
     update the ref each time the lastUpdate state changes 

     Why not just add lastUpdated as a dependency to the useEffect below?
     Because we don't want to re-instatiate the setInterval() over and over again
     but instead just do it once.

     The closure inside the useEffect below needs to know when lastUpdated changes
     but doesn't necessarily need to be re-defined again. useRef lets us accomplish this

     See: https://github.com/facebook/react/issues/14010#issuecomment-433788147
     
    */
    currentLastUpdated.current = lastUpdated;
  }, [lastUpdated]);

  /** request on first mount */
  React.useEffect(() => {
    requestAndSetLastUpdated().then(() => {
      requestInterval = setInterval(() => {
        requestAndSetLastUpdated();
      }, 10000);
    });

    return () => {
      mounted = false;
      clearInterval(requestInterval);
    };
  }, []);

  /**
   * We want to show a "waiting for data" state
   * until data has been returned.
   */
  if (!authed || lastUpdated === 0) {
    return (
      <LongviewClientInstructions
        clientID={clientID}
        clientLabel={clientLabel}
        installCode={'D3DD4F69-817B-4FF5-8F4C80029AD4F815'}
        triggerDeleteLongviewClient={triggerDeleteLongviewClient}
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
              <IconButton
                onClick={() =>
                  triggerDeleteLongviewClient(clientID, clientLabel)
                }
                className={classes.button}
              >
                <Close width={30} height={30} />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withClientStats<Props>(ownProps => ownProps.clientID)
)(LongviewClientRow);
