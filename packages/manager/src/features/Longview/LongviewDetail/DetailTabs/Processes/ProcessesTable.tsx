import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
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
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { readableBytes } from 'src/utilities/unitConversions';
import { Process } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  processName: {
    display: 'flex',
    flexFlow: 'row nowrap',
    wordBreak: 'break-all',
    alignItems: 'center',
  },
  cmrTableModifier: {
    '& tbody': {
      transition: theme.transitions.create(['opacity']),
    },
    '& tbody.sorting': {
      opacity: 0.5,
    },
    '& thead': {
      '& th': {
        borderTop: `2px solid ${theme.color.grey9}`,
        borderRight: `1px solid ${theme.color.grey9}`,
        borderBottom: `2px solid ${theme.color.grey9}`,
        borderLeft: `1px solid ${theme.color.grey9}`,
        fontFamily: theme.font.bold,
        fontSize: '0.875em !important',
        color: theme.palette.text.primary,
        padding: '10px 15px',
        '&:first-of-type': {
          borderLeft: 'none',
        },
        '&:last-of-type': {
          borderRight: 'none',
        },
      },
    },
  },
}));

export interface Props {
  processesData: ExtendedProcess[];
  processesLoading: boolean;
  error?: string;
  selectedProcess: Process | null;
  setSelectedProcess: (process: Process) => void;
  lastUpdatedError?: APIError[];
}

export type CombinedProps = Props;

export const ProcessesTable: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { width } = useWindowDimensions();

  const {
    processesData,
    processesLoading,
    error,
    selectedProcess,
    setSelectedProcess,
  } = props;

  return (
    <OrderBy
      data={processesData}
      orderBy={'name'}
      order={'asc'}
      preferenceKey="lv-detail-processes"
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Table
          spacingTop={16}
          // This prop is necessary to show the "ActiveCaret", and we only
          // want it on large viewports.
          noOverflow={width >= 1280}
          className={classes.cmrTableModifier}
        >
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
              selectedProcess,
              setSelectedProcess,
              error
            )}
          </TableBody>
        </Table>
      )}
    </OrderBy>
  );
};

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
    return <TableRowLoading colSpan={7} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return data.map((thisProcess, idx) => (
    <ProcessesTableRow
      key={`process-${idx}`}
      isSelected={
        selectedProcess?.name === thisProcess.name &&
        selectedProcess?.user === thisProcess.user
      }
      setSelectedProcess={setSelectedProcess}
      {...thisProcess}
    />
  ));
};

export interface ProcessTableRowProps extends ExtendedProcess {
  isSelected: boolean;
  setSelectedProcess: (process: Process) => void;
  cmrFlag?: boolean;
}

export const ProcessesTableRow: React.FC<ProcessTableRowProps> = React.memo(
  (props) => {
    const {
      name,
      user,
      maxCount,
      averageIO,
      averageCPU,
      averageMem,
      setSelectedProcess,
      isSelected,
    } = props;

    const classes = useStyles();

    return (
      <TableRow
        onClick={() => setSelectedProcess({ name, user })}
        onKeyUp={(e: any) =>
          e.keyCode === 13 && setSelectedProcess({ name, user })
        }
        selected={isSelected}
        data-testid="longview-service-row"
        forceIndex
        ariaLabel={`${name} for ${user}`}
      >
        <TableCell data-testid={`name-${name}`}>
          <div className={classes.processName}>{name}</div>
        </TableCell>
        <TableCell data-testid={`user-${user}`}>{user}</TableCell>
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
