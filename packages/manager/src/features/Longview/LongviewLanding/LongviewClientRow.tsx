import * as React from 'react';
import { compose } from 'recompose';

import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';

import { getLastUpdated } from '../request';

interface Props extends ActionHandlers {
  clientID: number;
  clientLabel: string;
  clientAPIKey: string;
}

type CombinedProps = Props;

const LongviewClientRow: React.FC<CombinedProps> = props => {
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
    <TableRow rowLink={`longview/clients/${clientID}`}>
      <TableCell>{`${clientLabel} - ${lastUpdated}`}</TableCell>
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
