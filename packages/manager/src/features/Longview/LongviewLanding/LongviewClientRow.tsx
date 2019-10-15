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
      height: 192
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

  const [lastUpdated, setLastUpdated] = React.useState<number>(0);

  const requestAndSetLastUpdated = () => {
    return getLastUpdated(clientAPIKey)
      .then(response => {
        if (response.updated > lastUpdated) {
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
      <TableCell>{`${clientLabel} - ${lastUpdated}`}</TableCell>
      <TableCell>
        <CPUGauge />
      </TableCell>
      <TableCell>
        <RAMGauge />
      </TableCell>
      <TableCell>
        <SwapGauge />
      </TableCell>
      <TableCell>
        <LoadGauge />
      </TableCell>
      <TableCell>
        <NetworkGauge />
      </TableCell>
      <TableCell>
        <StorageGauge />
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
