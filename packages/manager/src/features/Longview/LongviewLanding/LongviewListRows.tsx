import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { compose } from 'recompose';

import { ActionHandlers } from './LongviewActionMenu';
import ClientRow from './LongviewClientRow';

interface Props extends ActionHandlers {
  longviewClientsResults: number;
  longviewClientsData: LongviewClient[];
}

type CombinedProps = Props & ActionHandlers;

const LongviewListRows: React.FC<CombinedProps> = props => {
  const {
    longviewClientsData,
    longviewClientsResults,
    ...actionMenuHandlers
  } = props;

  return (
    <React.Fragment>
      {longviewClientsData.map(eachClient => {
        return (
          <ClientRow
            key={`longview-client-${eachClient.label}`}
            clientID={eachClient.id}
            clientLabel={eachClient.label}
            clientAPIKey={eachClient.api_key}
            {...actionMenuHandlers}
          />
        );
      })}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props & ActionHandlers>(React.memo)(
  LongviewListRows
);
