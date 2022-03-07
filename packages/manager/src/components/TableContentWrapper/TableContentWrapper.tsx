import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { compose } from 'recompose';

import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

interface Props {
  length: number;
  loading: boolean;
  lastUpdated?: number;
  error?: APIError[];
  emptyMessage?: string;
}

type CombinedProps = Props;

const TableContentWrapper: React.FC<CombinedProps> = (props) => {
  const { length, loading, emptyMessage, error, lastUpdated } = props;

  if (loading) {
    return <TableRowLoading colSpan={6} widths={[25]} oneLine />;
  }

  if (error && error.length > 0) {
    return <TableRowError colSpan={6} message={error[0].reason} />;
  }

  if (lastUpdated !== 0 && length === 0) {
    return (
      <TableRowEmpty
        colSpan={6}
        message={emptyMessage ?? 'No data to display.'}
      />
    );
  }

  /* eslint-disable-next-line */
  return <>{props.children}</>;
};

export default compose<CombinedProps, Props>(React.memo)(TableContentWrapper);
