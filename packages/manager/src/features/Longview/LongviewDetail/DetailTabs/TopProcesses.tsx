import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import {
  LongviewTopProcesses,
  TopProcessStat
} from 'src/features/Longview/request.types';
import { readableBytes } from 'src/utilities/unitConversions';
import { formatCPU } from '../../shared/formatters';

const useStyles = makeStyles((theme: Theme) => ({
  detailsLink: {
    fontSize: 16,
    fontWeight: 'bold',
    position: 'relative',
    top: 3
  }
}));

export interface Props {
  topProcessesData: LongviewTopProcesses;
  topProcessesLoading: boolean;
  topProcessesError?: APIError[];
  lastUpdatedError?: APIError[];
}

export const TopProcesses: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    topProcessesData,
    topProcessesLoading,
    topProcessesError,
    lastUpdatedError
  } = props;

  const errorMessage = Boolean(topProcessesError || lastUpdatedError)
    ? 'There was an error getting Top Processes.'
    : undefined;

  return (
    <Grid item xs={12} md={4} lg={3}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">Top Processes</Typography>
        <Link to="processes" className={classes.detailsLink}>
          View Details
        </Link>
      </Box>
      <OrderBy
        data={extendTopProcesses(topProcessesData)}
        orderBy={'cpu'}
        order={'desc'}
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <>
            <Table spacingTop={16} aria-label="List of Top Processes">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    data-qa-table-header="Process"
                    active={orderBy === 'name'}
                    label="name"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '25%' }}
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
                  errorMessage
                )}
              </TableBody>
            </Table>
          </>
        )}
      </OrderBy>
    </Grid>
  );
};

const renderLoadingErrorData = (
  data: ExtendedTopProcessStat[],
  loading: boolean,
  errorMessage?: string
) => {
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
        />
      ))
  );
};

interface TopProcessRowProps {
  name: string;
  cpu: number;
  mem: number;
}

export const TopProcessRow: React.FC<TopProcessRowProps> = React.memo(props => {
  const { name, cpu, mem } = props;

  // Memory is given from the API in KB.
  const memInBytes = mem * 1024;

  return (
    <TableRow data-testid="longview-top-process-row">
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
    Object.values(topProcesses.Processes[processName]).forEach(userProcess => {
      topProcessDisplay.push({ ...userProcess, name: processName });
    });
  });
  return topProcessDisplay;
};
