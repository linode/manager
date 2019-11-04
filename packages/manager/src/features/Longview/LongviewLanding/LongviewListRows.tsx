import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { compose } from 'recompose';

import Grid from 'src/components/core/Grid';
import { Props as LVProps } from 'src/containers/longview.container';
import { ActionHandlers } from './LongviewActionMenu';
import ClientRow from './LongviewClientRow';

interface Props
  extends Omit<
    LVProps,
    | 'longviewClientsData'
    | 'getLongviewClients'
    | 'createLongviewClient'
    | 'deleteLongviewClient'
    | 'updateLongviewClient'
  > {
  longviewClientsData: LongviewClient[];
}

type CombinedProps = Props & ActionHandlers;

const LongviewListRows: React.FC<CombinedProps> = props => {
  const {
    longviewClientsData,
    longviewClientsResults,
    longviewClientsLoading,
    longviewClientsLastUpdated,
    longviewClientsError,
    ...actionMenuHandlers
  } = props;

  if (longviewClientsLoading && longviewClientsLastUpdated === 0) {
    return <Grid>Loading...</Grid>;
  }

  /**
   * only display error if we don't already have data
   */
  if (longviewClientsError.read && longviewClientsLastUpdated === 0) {
    return <Grid>Error!</Grid>;
  }

  if (longviewClientsLastUpdated !== 0 && longviewClientsResults === 0) {
    return <Grid>Empty</Grid>;
  }

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
