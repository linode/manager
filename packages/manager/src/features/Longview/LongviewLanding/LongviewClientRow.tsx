import Close from '@material-ui/icons/Close';
import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import IconButton from 'src/components/core/IconButton';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import CPUGauge from './Gauges/CPU';
import { ActionHandlers } from './LongviewActionMenu';

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
    padding: `0px ${theme.spacing()}px ${theme.spacing(
      3
    )}px ${theme.spacing()}px`
  },
  container: {
    height: 150,
    '@media (max-width: 1100px)': {
      flexDirection: 'column',
      height: 'inherit'
    }
  },
  button: {
    padding: 0,
    '&:hover': {
      color: theme.color.red
    }
  },
  label: {
    paddingLeft: theme.spacing(2)
  }
}));

interface Props extends ActionHandlers {
  clientID: number;
  clientLabel: string;
  clientAPIKey: string;
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
  const [lastUpdated, setLastUpdated] = React.useState<number | undefined>(0);
  const [authed, setAuthed] = React.useState<boolean>(true);

  const requestAndSetLastUpdated = () => {
    return getLastUpdated(clientAPIKey)
      .then(response => {
        /*
          only update _lastUpdated_ state if it hasn't already been set
          or the API response is in a time past what's already been set.
        */
        if (
          mounted &&
          (!lastUpdated || pathOr(0, ['updated'], response) > lastUpdated)
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
        if (mounted && reason.match(/authentication/i)) {
          setAuthed(false);
        }
      });
  };

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
        direction="row"
        wrap="nowrap"
        justify="space-between"
        alignItems="center"
        className={classes.container}
        aria-label="List of Your Longview Clients"
      >
        <Grid item xs={2} className={classes.label}>
          <LongviewClientHeader />
        </Grid>
        <Grid item>
          <CPUGauge clientID={clientID} />
        </Grid>
        <Grid item>
          <RAMGauge clientID={clientID} />
        </Grid>
        <Grid item>
          <SwapGauge token={clientAPIKey} lastUpdated={lastUpdated} />
        </Grid>
        <Grid item>
          <LoadGauge token={clientAPIKey} lastUpdated={lastUpdated} />
        </Grid>
        <Grid item>
          <NetworkGauge token={clientAPIKey} lastUpdated={lastUpdated} />
        </Grid>
        <Grid item>
          <StorageGauge clientID={clientID} />
        </Grid>
        <Grid item style={{ alignSelf: 'flex-start' }}>
          <IconButton
            onClick={() => triggerDeleteLongviewClient(clientID, clientLabel)}
            className={classes.button}
          >
            <Close width={30} height={30} />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default compose<CombinedProps, Props>(
  React.memo,
  withClientStats<Props>(ownProps => ownProps.clientID)
)(LongviewClientRow);
