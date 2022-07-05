import { APIError } from '@linode/api-v4';
import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import {
  TableRowLoading,
  Props as TableLoadingProps,
} from '../TableRowLoading/TableRowLoading';

interface Props {
  length: number;
  loading: boolean;
  lastUpdated?: number;
  error?: APIError[];
  emptyMessage?: string;
  loadingProps?: TableLoadingProps;
}

type CombinedProps = Props;

const TableContentWrapper: React.FC<CombinedProps> = (props) => {
  const {
    length,
    loading,
    emptyMessage,
    error,
    lastUpdated,
    loadingProps,
  } = props;

  if (loading) {
    return <TableRowLoading {...loadingProps} />;
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

export default TableContentWrapper;
