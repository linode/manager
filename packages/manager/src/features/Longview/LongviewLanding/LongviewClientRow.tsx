import { pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';

import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import CPUGauge from './Gauges/CPU';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';

import { getLastUpdated } from '../request';
import LoadGauge from './Gauges/Load';
import NetworkGauge from './Gauges/Network';
import RAMGauge from './Gauges/RAM';
import StorageGauge from './Gauges/Storage';
import SwapGauge from './Gauges/Swap';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& td': {
      height: 192,
      paddingBottom: theme.spacing(4)
    }
  }
}));

interface Props extends ActionHandlers {
  clientID: number;
  clientLabel: string;
  clientAPIKey: string;
}

type CombinedProps = Props;

const LongviewClientRow: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  let requestInterval: NodeJS.Timeout;

  const { clientID, clientLabel, clientAPIKey, ...actionHandlers } = props;

  /* 
   lastUpdated _might_ come back from the endpoint as 0, so it's important
   that we differentiate between _0_ and _undefined_
   */
  const [lastUpdated, setLastUpdated] = React.useState<number | undefined>();

  const requestAndSetLastUpdated = () => {
    return getLastUpdated(clientAPIKey)
      .then(response => {
        /* 
          only update _lastUpdated_ state if it hasn't already been set
          or the API response is in a time past what's already been set.
        */
        if (!lastUpdated || pathOr(0, ['updated'], response) > lastUpdated) {
          setLastUpdated(response.updated);
        }
      })
      .catch(e => e);
  };

  /** request on first mount */
  React.useEffect(() => {
    requestAndSetLastUpdated();
  }, []);

  /** then request on an interval of 10 seconds */
  React.useEffect(() => {
    requestInterval = setInterval(() => {
      requestAndSetLastUpdated();
    }, 10000);

    return () => clearInterval(requestInterval);
  });

  return (
    <TableRow className={classes.root} rowLink={`longview/clients/${clientID}`}>
      <TableCell>{`${clientLabel}`}</TableCell>
      <TableCell>
        <CPUGauge clientAPIKey={clientAPIKey} lastUpdated={lastUpdated} />
      </TableCell>
      <TableCell>
        <RAMGauge token={clientAPIKey} lastUpdated={lastUpdated} />
      </TableCell>
      <TableCell>
        <SwapGauge />
      </TableCell>
      <TableCell>
        <LoadGauge token={clientAPIKey} lastUpdated={lastUpdated} />
      </TableCell>
      <TableCell>
        <NetworkGauge />
      </TableCell>
      <TableCell>
        <StorageGauge clientAPIKey={clientAPIKey} lastUpdated={lastUpdated} />
      </TableCell>
      <TableCell>
        <ActionMenu
          longviewClientID={clientID}
          longviewClientLabel={clientLabel}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, Props>(React.memo)(LongviewClientRow);
