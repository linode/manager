import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Box from 'src/components/core/Box';
import { makeStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Table_PreCMR from 'src/components/Table';
import Table_CMR from 'src/components/Table/Table_CMR';
import TableCell_PreCMR from 'src/components/TableCell';
import TableCell_CMR from 'src/components/TableCell/TableCell_CMR';
import TableRow_PreCMR from 'src/components/TableRow';
import TableRow_CMR from 'src/components/TableRow/TableRow_CMR';
import TableRowEmptyState_PreCMR from 'src/components/TableRowEmptyState';
import TableRowEmptyState_CMR from 'src/components/TableRowEmptyState/TableRowEmptyState_CMR';
import TableRowError_PreCMR from 'src/components/TableRowError';
import TableRowError_CMR from 'src/components/TableRowError/TableRowError_CMR';
import TableRowLoading_PreCMR from 'src/components/TableRowLoading';
import TableRowLoading_CMR from 'src/components/TableRowLoading/TableRowLoading_CMR';
import TableSortCell_PreCMR from 'src/components/TableSortCell';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR';
import {
  LongviewTopProcesses,
  TopProcessStat,
} from 'src/features/Longview/request.types';
import { readableBytes } from 'src/utilities/unitConversions';
import { formatCPU } from '../../shared/formatters';

const useStyles = makeStyles(() => ({
  detailsLink: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'relative',
    top: 3,
  },
}));

export interface Props {
  topProcessesData: LongviewTopProcesses;
  topProcessesLoading: boolean;
  topProcessesError?: APIError[];
  lastUpdatedError?: APIError[];
  cmrFlag?: boolean;
  clientID: number;
}

export const TopProcesses: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    topProcessesData,
    topProcessesLoading,
    topProcessesError,
    lastUpdatedError,
    cmrFlag,
    clientID,
  } = props;

  const errorMessage = Boolean(topProcessesError || lastUpdatedError)
    ? 'There was an error getting Top Processes.'
    : undefined;

  const Table = cmrFlag ? Table_CMR : Table_PreCMR;
  const TableRow = cmrFlag ? TableRow_CMR : TableRow_PreCMR;
  const TableSortCell = cmrFlag ? TableSortCell_CMR : TableSortCell_PreCMR;
  return (
    <Grid item xs={12} lg={4}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">Top Processes</Typography>
        <Link
          to={`/longview/clients/${clientID}/processes`}
          className={classes.detailsLink}
        >
          View Details
        </Link>
      </Box>
      <OrderBy
        data={extendTopProcesses(topProcessesData)}
        orderBy={'cpu'}
        order={'desc'}
        preferenceKey="top-processes"
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Table spacingTop={16} aria-label="List of Top Processes">
            <TableHead>
              <TableRow>
                <TableSortCell
                  data-qa-table-header="Process"
                  active={orderBy === 'name'}
                  label="name"
                  direction={order}
                  handleClick={handleOrderChange}
                  style={{ width: '40%' }}
                >
                  Process
                </TableSortCell>
                <TableSortCell
                  data-qa-table-header="CPU"
                  active={orderBy === 'cpu'}
                  label="cpu"
                  direction={order}
                  handleClick={handleOrderChange}
                  style={{ width: '25%' }}
                >
                  CPU
                </TableSortCell>
                <TableSortCell
                  data-qa-table-header="Memory"
                  active={orderBy === 'mem'}
                  label="mem"
                  direction={order}
                  handleClick={handleOrderChange}
                  style={{ width: '15%' }}
                >
                  Memory
                </TableSortCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderLoadingErrorData(
                orderedData,
                topProcessesLoading,
                errorMessage,
                cmrFlag
              )}
            </TableBody>
          </Table>
        )}
      </OrderBy>
    </Grid>
  );
};

const renderLoadingErrorData = (
  data: ExtendedTopProcessStat[],
  loading: boolean,
  errorMessage?: string,
  cmrFlag?: boolean
) => {
  const TableRowError = cmrFlag ? TableRowError_CMR : TableRowError_PreCMR;
  const TableRowLoading = cmrFlag
    ? TableRowLoading_CMR
    : TableRowLoading_PreCMR;
  const TableRowEmptyState = cmrFlag
    ? TableRowEmptyState_CMR
    : TableRowEmptyState_PreCMR;

  if (errorMessage && data.length === 0) {
    return <TableRowError colSpan={4} message={errorMessage} />;
  }
  if (loading && data.length === 0) {
    return <TableRowLoading colSpan={4} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={4} />;
  }

  return (
    data
      // Only display first 6 elements.
      .slice(0, 6)
      .map((thisTopProcessStat, idx) => (
        <TopProcessRow
          key={`longview-top-process-${idx}`}
          name={thisTopProcessStat.name}
          cpu={thisTopProcessStat.cpu}
          mem={thisTopProcessStat.mem}
          cmrFlag={cmrFlag}
        />
      ))
  );
};

interface TopProcessRowProps {
  name: string;
  cpu: number;
  mem: number;
  cmrFlag?: boolean;
}

export const TopProcessRow: React.FC<TopProcessRowProps> = React.memo(props => {
  const { name, cpu, mem, cmrFlag } = props;

  const TableCell = cmrFlag ? TableCell_CMR : TableCell_PreCMR;
  const TableRow = cmrFlag ? TableRow_CMR : TableRow_PreCMR;

  // Memory is given from the API in KB.
  const memInBytes = mem * 1024;

  return (
    <TableRow ariaLabel={name} data-testid="longview-top-process-row">
      <TableCell parentColumn="Process" data-qa-top-process-process>
        {name}
      </TableCell>
      <TableCell parentColumn="CPU" data-qa-top-process-cpu>
        {formatCPU(cpu)}
      </TableCell>
      <TableCell parentColumn="Memory" data-qa-top-process-memory>
        {readableBytes(memInBytes, { round: 0 }).formatted}
      </TableCell>
    </TableRow>
  );
});

export default React.memo(TopProcesses);

interface ExtendedTopProcessStat extends TopProcessStat {
  name: string;
}

// TopProcesses are key/value pairs, where the key is the name of the processes.
// This utility function returns an array of processes, with the name of the
// processes as an attribute called `name` on each element.
export const extendTopProcesses = (
  topProcesses: LongviewTopProcesses
): ExtendedTopProcessStat[] => {
  if (!topProcesses || !topProcesses.Processes) {
    return [];
  }
  const topProcessDisplay: ExtendedTopProcessStat[] = [];
  Object.keys(topProcesses.Processes).forEach(processName => {
    // For some reason the TS compiler doesn't recognize the early return above,
    // hence the non-null assertion operator on topProcesses.Processes.
    Object.values(topProcesses.Processes![processName]).forEach(userProcess => {
      topProcessDisplay.push({ ...userProcess, name: processName });
    });
  });
  return topProcessDisplay;
};
