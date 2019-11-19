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

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    [theme.breakpoints.down('sm')]: {
      '& tbody > tr > td:first-child .data': {
        textAlign: 'right'
      }
    },
    [theme.breakpoints.up('md')]: {
      '& thead > tr > th:last-child': {
        textAlign: 'right'
      },
      '& tbody > tr > td:last-child': {
        textAlign: 'right'
      }
    }
  },
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
}

export const TopProcesses: React.FC<Props> = props => {
  const classes = useStyles();
  const { topProcessesData, topProcessesLoading, topProcessesError } = props;

  return (
    <Grid item xs={12} md={4} lg={3}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">Top Processes</Typography>
        {/* @todo: correct URL */}
        <Link to={`/processes`} className={classes.detailsLink}>
          View Details
        </Link>
      </Box>
      <OrderBy
        data={formatData(topProcessesData)}
        orderBy={'process'}
        order={'asc'}
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <>
            <Table spacingTop={16} tableClass={classes.table}>
              <TableHead>
                <TableRow>
                  <TableSortCell
                    data-qa-table-header="Process"
                    active={orderBy === 'process'}
                    label="process"
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
                  topProcessesError
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
  error?: APIError[]
) => {
  if (error) {
    return <TableRowError colSpan={12} message={error[0].reason} />;
  }
  if (loading) {
    return <TableRowLoading colSpan={6} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return (
    data
      // First 6 elements
      // @todo: is this what we want UI-wise?
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

export default TopProcesses;

interface TopProcessRowProps {
  name: string;
  cpu: number;
  mem: number;
}

export const TopProcessRow: React.FC<TopProcessRowProps> = props => {
  const { name, cpu, mem } = props;
  return (
    <TableRow data-testid="longview-top-process-row">
      <TableCell parentColumn="Process" data-qa-top-process-process>
        {name}
      </TableCell>
      <TableCell parentColumn="CPU" data-qa-top-process-cpu>
        {/* @todo: formatting */}
        {cpu.toFixed(2)}%
      </TableCell>
      <TableCell parentColumn="Memory" data-qa-top-process-memory>
        {/* @todo: formatting */}
        {Math.round(mem / 1024)} MB
      </TableCell>
    </TableRow>
  );
};

interface ExtendedTopProcessStat extends TopProcessStat {
  name: string;
}

// @todo: consider refactoring
// @todo: write tests
const formatData = (
  topProcesses: LongviewTopProcesses
): ExtendedTopProcessStat[] => {
  const topProcessDisplay: ExtendedTopProcessStat[] = [];
  Object.keys(topProcesses.Processes).forEach(key => {
    Object.values(topProcesses.Processes[key]).forEach(entry => {
      topProcessDisplay.push({ ...entry, name: key });
    });
  });
  return topProcessDisplay;
};
