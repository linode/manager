import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import {
  TableRowLoadingProps,
  TableRowLoading,
} from 'src/components/TableRowLoading/TableRowLoading';

interface Props {
  length: number;
  loading: boolean;
  lastUpdated?: number;
  error?: APIError[];
  emptyMessage?: string;
  loadingProps?: TableRowLoadingProps;
  rowEmptyState?: JSX.Element;
  customFirstRow?: JSX.Element;
}

export const TableContentWrapper: React.FC<Props> = (props) => {
  const {
    length,
    loading,
    emptyMessage,
    error,
    lastUpdated,
    loadingProps,
    rowEmptyState,
    customFirstRow,
  } = props;

  if (loading) {
    return <TableRowLoading {...loadingProps} />;
  }

  if (error && error.length > 0) {
    return <TableRowError colSpan={6} message={error[0].reason} />;
  }

  if (lastUpdated !== 0 && length === 0) {
    if (rowEmptyState) {
      return rowEmptyState;
    }
    return (
      <TableRowEmpty
        colSpan={6}
        message={emptyMessage ?? 'No data to display.'}
      />
    );
  }

  return (
    <>
      {customFirstRow ? customFirstRow : undefined}
      {props.children}
    </>
  );
};
