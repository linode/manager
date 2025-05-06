import * as React from 'react';

import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

import type { APIError } from '@linode/api-v4/lib/types';
import type { TableRowLoadingProps } from 'src/components/TableRowLoading/TableRowLoading';

interface TableContentWrapperProps {
  children?: React.ReactNode;
  customFirstRow?: JSX.Element;
  emptyMessage?: string;
  error?: APIError[];
  lastUpdated?: number;
  length: number;
  loading: boolean;
  loadingProps?: TableRowLoadingProps;
  rowEmptyState?: JSX.Element;
}

export const TableContentWrapper = (props: TableContentWrapperProps) => {
  const {
    children,
    customFirstRow,
    emptyMessage,
    error,
    lastUpdated,
    length,
    loading,
    loadingProps,
    rowEmptyState,
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
      {children}
    </>
  );
};
