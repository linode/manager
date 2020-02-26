import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

interface Props {
  length: number;
  loading: boolean;
  lastUpdated: number;
  error?: APIError[];
}

type CombinedProps = Props;

const TableContentWrapper: React.FC<CombinedProps> = props => {
  const { length, loading, error, lastUpdated } = props;

  if (loading && lastUpdated === 0) {
    return <TableRowLoading colSpan={6} firstColWidth={25} oneLine />;
  }

  /**
   * only display error if we don't already have data
   */
  if (error && lastUpdated === 0) {
    return <TableRowError colSpan={6} message={error[0].reason} />;
  }

  if (lastUpdated !== 0 && length === 0) {
    return (
      <TableRowEmpty colSpan={6} message="You do not have any Firewalls" />
    );
  }

  return <React.Fragment>{props.children}</React.Fragment>;
};

export default compose<CombinedProps, Props>(React.memo)(TableContentWrapper);
