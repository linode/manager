// === TEMPORARY FACTORY ===

import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Select from 'src/components/EnhancedSelect/Select';
import OrderBy from 'src/components/OrderBy';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import TableSortCell from 'src/components/TableSortCell';
import TextField from 'src/components/TextField';

const useStyles = makeStyles((theme: Theme) => ({
  filterInput: {
    width: 300
  },
  timeSelect: {
    width: 200
  }
}));

interface Props {
  processesData: ExtendedProcess[];
  processesLoading: boolean;
  processesError?: APIError[];
  selectedRow: string | null;
  setSelectedRow: (id: string) => void;
}

type CombinedProps = Props;

const ProcessesTable: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    processesData,
    processesLoading,
    processesError,
    selectedRow,
    setSelectedRow
  } = props;

  const errorMessage = processesError
    ? 'There was an error getting Processes'
    : undefined;

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        {/* Doesn't work yet. */}
        <TextField
          className={classes.filterInput}
          small
          placeholder="Filter by process or user..."
        />
        {/* Doesn't work yet. */}
        <Select
          className={classes.timeSelect}
          small
          placeholder="Last 12 Hours"
          onChange={() => null}
        />
      </Box>
      <OrderBy data={processesData} orderBy={'name'} order={'desc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <>
            <Table spacingTop={16}>
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
                    data-qa-table-header="User"
                    active={orderBy === 'user'}
                    label="user"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '25%' }}
                  >
                    User
                  </TableSortCell>
                  <TableSortCell
                    data-qa-table-header="Max Count"
                    active={orderBy === 'maxCount'}
                    label="maxCount"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '15%' }}
                  >
                    Protocol
                  </TableSortCell>
                  <TableSortCell
                    data-qa-table-header="Avg IO"
                    active={orderBy === 'averageIO'}
                    label="averageIO"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '10%' }}
                  >
                    Avg IO
                  </TableSortCell>
                  <TableSortCell
                    data-qa-table-header="Avg CPU"
                    active={orderBy === 'averageCPU'}
                    label="averageCPU"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '10%' }}
                  >
                    Avg CPU
                  </TableSortCell>
                  <TableSortCell
                    data-qa-table-header="Avg Mem"
                    active={orderBy === 'averageMem'}
                    label="averageMem"
                    direction={order}
                    handleClick={handleOrderChange}
                    style={{ width: '25%' }}
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
    return <TableRowLoading colSpan={6} />;
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
        rowLink={() => setSelectedRow(id)}
        selected={isSelected}
        data-testid="longview-service-row"
      >
        <TableCell parentColumn="Process" data-qa-service-process>
          {name}
        </TableCell>
        <TableCell parentColumn="User" data-qa-service-user>
          {user}
        </TableCell>
        <TableCell parentColumn="Max Count" data-qa-service-protocol>
          {maxCount}
        </TableCell>
        <TableCell parentColumn="Avg IO" data-qa-service-port>
          {/* @todo: formatting */}
          {averageIO} B/s
        </TableCell>
        <TableCell parentColumn="Avg CPU" data-qa-service-ip>
          {/* @todo: formatting */}
          {averageCPU}%
        </TableCell>
        <TableCell parentColumn="Avg Mem" data-qa-service-ip>
          {/* @todo: formatting */}
          {averageMem} MB
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
