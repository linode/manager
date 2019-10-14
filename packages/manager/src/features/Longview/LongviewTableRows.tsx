import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { compose } from 'recompose';
// import { makeStyles, Theme } from 'src/components/core/styles'

import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

import { Props as LVProps } from 'src/containers/longview.container';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';

// const useStyles = makeStyles((theme: Theme) => ({
//   root: {}
// }))

interface Props
  extends Omit<LVProps, 'longviewClientsData' | 'getLongviewClients'> {
  longviewClientsData: LongviewClient[];
}

type CombinedProps = Props & ActionHandlers;

const LongviewTableRows: React.FC<CombinedProps> = props => {
  // const classes = useStyles();

  const {
    longviewClientsData,
    longviewClientsResults,
    longviewClientsLoading,
    longviewClientsLastUpdated,
    longviewClientsError,
    ...actionMenuHandlers
  } = props;

  if (longviewClientsLoading && longviewClientsLastUpdated === 0) {
    return <TableRowLoading colSpan={3} />;
  }

  /**
   * only display error if we don't already have data
   */
  if (longviewClientsError.read && longviewClientsLastUpdated === 0) {
    return (
      <TableRowError
        colSpan={3}
        message={longviewClientsError.read[0].reason}
      />
    );
  }

  if (longviewClientsLastUpdated !== 0 && longviewClientsResults === 0) {
    return (
      <TableRowEmpty
        colSpan={3}
        message="You do not have any Longview Clients"
      />
    );
  }

  return (
    <React.Fragment>
      {longviewClientsData.map(eachClient => {
        return (
          <TableRow key={`longview-row-${eachClient.id}`}>
            <TableCell>{eachClient.label}</TableCell>
            <TableCell>
              <ActionMenu
                longviewClientID={eachClient.id}
                longviewClientLabel={eachClient.label}
                {...actionMenuHandlers}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </React.Fragment>
  );
};

export default compose<CombinedProps, Props & ActionHandlers>(React.memo)(
  LongviewTableRows
);
