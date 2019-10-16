import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { compose } from 'recompose';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

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

const LongviewTableRows: React.FC<CombinedProps> = props => {
  const {
    longviewClientsData,
    longviewClientsResults,
    longviewClientsLoading,
    longviewClientsLastUpdated,
    longviewClientsError,
    ...actionMenuHandlers
  } = props;

  if (longviewClientsLoading && longviewClientsLastUpdated === 0) {
    return <TableRowLoading colSpan={9} />;
  }

  /**
   * only display error if we don't already have data
   */
  if (longviewClientsError.read && longviewClientsLastUpdated === 0) {
    return (
      <TableRowError
        colSpan={9}
        message={longviewClientsError.read[0].reason}
      />
    );
  }

  if (longviewClientsLastUpdated !== 0 && longviewClientsResults === 0) {
    return (
      <TableRowEmpty
        colSpan={9}
        message="You do not have any Longview Clients"
      />
    );
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
  LongviewTableRows
);
