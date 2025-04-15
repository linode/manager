import { readableBytes } from '@linode/utilities';
import * as React from 'react';

import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { formatCPU } from 'src/features/Longview/shared/formatters';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';

import { StyledDiv } from './ProcessesTable.styles';

import type { Process } from './types';
import type { APIError } from '@linode/api-v4/lib/types';

export interface ProcessesTableProps {
  error?: string;
  lastUpdatedError?: APIError[];
  processesData: ExtendedProcess[];
  processesLoading: boolean;
  selectedProcess: Process | null;
  setSelectedProcess: (process: Process) => void;
}

export const ProcessesTable = React.memo((props: ProcessesTableProps) => {
  const { width } = useWindowDimensions();

  const {
    error,
    processesData,
    processesLoading,
    selectedProcess,
    setSelectedProcess,
  } = props;

  const { handleOrderChange, order, orderBy, sortedData } =
    useOrderV2<ExtendedProcess>({
      data: processesData,
      initialRoute: {
        defaultOrder: {
          order: 'asc',
          orderBy: 'name',
        },
        from: '/longview/clients/$id/processes',
      },
      preferenceKey: 'lv-detail-processes',
    });

  return (
    <Table
      // This prop is necessary to show the "ActiveCaret", and we only
      // want it on large viewports.
      noOverflow={width >= 1280}
      spacingTop={16}
    >
      <TableHead>
        <TableRow>
          <TableSortCell
            active={orderBy === 'name'}
            direction={order}
            handleClick={handleOrderChange}
            label="name"
            style={{ width: '20%' }}
          >
            Process
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'user'}
            direction={order}
            handleClick={handleOrderChange}
            label="user"
            style={{ width: '20%' }}
          >
            User
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'maxCount'}
            direction={order}
            handleClick={handleOrderChange}
            label="maxCount"
            style={{ width: '15%' }}
          >
            Max Count
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'averageIO'}
            direction={order}
            handleClick={handleOrderChange}
            label="averageIO"
            style={{ width: '15%' }}
          >
            Avg IO
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'averageCPU'}
            direction={order}
            handleClick={handleOrderChange}
            label="averageCPU"
            style={{ width: '15%' }}
          >
            Avg CPU
          </TableSortCell>
          <TableSortCell
            active={orderBy === 'averageMem'}
            direction={order}
            handleClick={handleOrderChange}
            label="averageMem"
            style={{ width: '15%' }}
          >
            Avg Mem
          </TableSortCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {renderLoadingErrorData(
          processesLoading,
          sortedData ?? [],
          selectedProcess,
          setSelectedProcess,
          error
        )}
      </TableBody>
    </Table>
  );
});

const renderLoadingErrorData = (
  loading: boolean,
  data: ExtendedProcess[],
  selectedProcess: Process | null,
  setSelectedProcess: (process: Process) => void,
  error?: string
) => {
  if (error && data.length === 0) {
    return <TableRowError colSpan={12} message={error} />;
  }
  if (loading) {
    return <TableRowLoading columns={6} />;
  }
  if (data.length === 0) {
    return <TableRowEmpty colSpan={12} />;
  }

  return data.map((thisProcess, idx) => (
    <ProcessesTableRow
      isSelected={
        selectedProcess?.name === thisProcess.name &&
        selectedProcess?.user === thisProcess.user
      }
      key={`process-${idx}`}
      setSelectedProcess={setSelectedProcess}
      {...thisProcess}
    />
  ));
};

export interface ProcessTableRowProps extends ExtendedProcess {
  isSelected: boolean;
  setSelectedProcess: (process: Process) => void;
}

export const ProcessesTableRow = React.memo((props: ProcessTableRowProps) => {
  const {
    averageCPU,
    averageIO,
    averageMem,
    isSelected,
    maxCount,
    name,
    setSelectedProcess,
    user,
  } = props;

  return (
    <TableRow
      onKeyUp={(e: any) =>
        e.key === 'Enter' && setSelectedProcess({ name, user })
      }
      data-testid="longview-service-row"
      forceIndex
      onClick={() => setSelectedProcess({ name, user })}
      selected={isSelected}
    >
      <TableCell data-testid={`name-${name}`}>
        <StyledDiv>{name}</StyledDiv>
      </TableCell>
      <TableCell data-testid={`user-${user}`}>
        <MaskableText isToggleable length={10} text={user} />
      </TableCell>
      <TableCell data-testid={`max-count-${Math.round(maxCount)}`}>
        {Math.round(maxCount)}
      </TableCell>
      <TableCell data-testid={`average-io-${averageIO}`}>
        {
          readableBytes(averageIO, { round: 0, unitLabels: { bytes: 'B' } })
            .formatted
        }
        /s
      </TableCell>
      <TableCell data-testid={`average-cpu-${averageCPU}`}>
        {formatCPU(averageCPU)}
      </TableCell>
      <TableCell data-testid={`average-mem-${averageMem}`}>
        {readableBytes(averageMem * 1024, { round: 0 }).formatted}
      </TableCell>
    </TableRow>
  );
});

export interface ExtendedProcess {
  averageCPU: number;
  averageIO: number;
  averageMem: number;
  id: string;
  maxCount: number;
  name: string;
  user: string;
}
