import { APIError } from 'linode-js-sdk/lib/types';
import { pathOr } from 'ramda';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import OrderBy from 'src/components/OrderBy';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import { formatCPU } from 'src/features/Longview/shared/formatters';
import { readableBytes } from 'src/utilities/unitConversions';

export interface Props {
  processesData: ExtendedProcess[];
  processesLoading: boolean;
  processesError?: APIError[];
  selectedRow: string | null;
  setSelectedRow: (id: string) => void;
  lastUpdatedError?: APIError[];
}

type CombinedProps = Props;

export const ProcessesTable: React.FC<CombinedProps> = props => {
  const {
    processesData,
    processesLoading,
    processesError,
    selectedRow,
    setSelectedRow,
    lastUpdatedError
  } = props;

  const _hasError = processesError || lastUpdatedError;
  const errorMessage = Boolean(_hasError)
    ? pathOr<string>('Error retrieving data', [0, 'reason'], _hasError)
    : undefined;

  return (
    <>
      <OrderBy data={processesData} orderBy={'name'} order={'desc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <>
            <Table spacingTop={16} noOverflow>
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'name'}
                    label="name"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '20%' }}
                  >
                    Process
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'user'}
                    label="user"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '20%' }}
                  >
                    User
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'maxCount'}
                    label="maxCount"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '15%' }}
                  >
                    Max Count
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'averageIO'}
                    label="averageIO"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '15%' }}
                  >
                    Avg IO
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'averageCPU'}
                    label="averageCPU"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '15%' }}
                  >
                    Avg CPU
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'averageMem'}
                    label="averageMem"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '15%' }}
                  >
                    Avg Mem
                  </TableSortCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderLoadingErrorData(
                  processesLoading,
                  orderedData,
                  selectedRow,
                  setSelectedRow,
                  errorMessage
                )}
              </TableBody>
            </Table>
          </>
        )}
      </OrderBy>
    </>
  );
};

const renderLoadingErrorData = (
  loading: boolean,
  data: ExtendedProcess[],
  selectedRow: string | null,
  setSelectedRow: (id: string) => void,
  error?: string
) => {
  if (error && data.length === 0) {
    return <TableRowError colSpan={12} message={error} />;
  }
  if (loading && data.length === 0) {
    return <TableRowLoading colSpan={7} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return data.map((thisProcesses, idx) => (
    <ProcessesTableRow
      key={`process-${idx}`}
      id={thisProcesses.id}
      isSelected={selectedRow === thisProcesses.id}
      setSelectedRow={setSelectedRow}
      {...thisProcesses}
    />
  ));
};

export interface ProcessTableRowProps extends ExtendedProcess {
  id: string;
  isSelected: boolean;
  setSelectedRow: (id: string) => void;
}

export const ProcessesTableRow: React.FC<ProcessTableRowProps> = React.memo(
  props => {
    const {
      name,
      user,
      maxCount,
      averageIO,
      averageCPU,
      averageMem,
      id,
      setSelectedRow,
      isSelected
    } = props;
    return (
      <TableRow
        onClick={() => setSelectedRow(id)}
        onKeyUp={(e: any) => e.keyCode === 13 && setSelectedRow(id)}
        selected={isSelected}
        data-testid="longview-service-row"
        forceIndex
        aria-label={`${name} for ${user}`}
      >
        <TableCell parentColumn="Process" data-testid={`name-${name}`}>
          {name}
        </TableCell>
        <TableCell parentColumn="User" data-testid={`user-${user}`}>
          {user}
        </TableCell>
        <TableCell
          parentColumn="Max Count"
          data-testid={`max-count-${Math.round(maxCount)}`}
        >
          {Math.round(maxCount)}
        </TableCell>
        <TableCell
          parentColumn="Avg IO"
          data-testid={`average-io-${averageIO}`}
        >
          {
            readableBytes(averageIO, { round: 0, unitLabels: { bytes: 'B' } })
              .formatted
          }
          /s
        </TableCell>
        <TableCell
          parentColumn="Avg CPU"
          data-testid={`average-cpu-${averageCPU}`}
        >
          {formatCPU(averageCPU)}
        </TableCell>
        <TableCell
          parentColumn="Avg Mem"
          data-testid={`average-mem-${averageMem}`}
        >
          {readableBytes(averageMem * 1024, { round: 0 }).formatted}
        </TableCell>
      </TableRow>
    );
  }
);

export interface ExtendedProcess {
  id: string;
  name: string;
  user: string;
  maxCount: number;
  averageIO: number;
  averageCPU: number;
  averageMem: number;
}

export default React.memo(ProcessesTable);
