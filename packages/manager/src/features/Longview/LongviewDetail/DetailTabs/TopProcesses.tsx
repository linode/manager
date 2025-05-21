import { Box, Typography } from '@linode/ui';
import { readableBytes } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';

import { formatCPU } from '../../shared/formatters';
import { StyledLink } from './TopProcesses.styles';

import type { APIError } from '@linode/api-v4/lib/types';
import type {
  LongviewTopProcesses,
  TopProcessStat,
} from 'src/features/Longview/request.types';

export interface Props {
  clientID: number;
  lastUpdatedError?: APIError[];
  topProcessesData: LongviewTopProcesses;
  topProcessesError?: APIError[];
  topProcessesLoading: boolean;
}

export const TopProcesses = React.memo((props: Props) => {
  const {
    clientID,
    lastUpdatedError,
    topProcessesData,
    topProcessesError,
    topProcessesLoading,
  } = props;

  const { handleOrderChange, order, orderBy, sortedData } =
    useOrderV2<ExtendedTopProcessStat>({
      data: extendTopProcesses(topProcessesData),
      initialRoute: {
        defaultOrder: {
          order: 'desc',
          orderBy: 'cpu',
        },
        from: '/longview/clients/$id/overview',
      },
      preferenceKey: 'top-processes',
      prefix: 'top-processes',
    });

  const errorMessage =
    topProcessesError || lastUpdatedError
      ? 'There was an error getting Top Processes.'
      : undefined;

  return (
    <Grid size={{ lg: 4, xs: 12 }}>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Typography variant="h2">Top Processes</Typography>
        <StyledLink to={`/longview/clients/${clientID}/processes`}>
          View Details
        </StyledLink>
      </Box>
      <Table aria-label="List of Top Processes" spacingTop={16}>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'name'}
              data-qa-table-header="Process"
              direction={order}
              handleClick={handleOrderChange}
              label="name"
              style={{ width: '40%' }}
            >
              Process
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'cpu'}
              data-qa-table-header="CPU"
              direction={order}
              handleClick={handleOrderChange}
              label="cpu"
              style={{ width: '25%' }}
            >
              CPU
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'mem'}
              data-qa-table-header="Memory"
              direction={order}
              handleClick={handleOrderChange}
              label="mem"
              style={{ width: '15%' }}
            >
              Memory
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {renderLoadingErrorData(
            sortedData ?? [],
            topProcessesLoading,
            errorMessage
          )}
        </TableBody>
      </Table>
    </Grid>
  );
});

const renderLoadingErrorData = (
  data: ExtendedTopProcessStat[],
  loading: boolean,
  errorMessage?: string
) => {
  if (errorMessage && data.length === 0) {
    return <TableRowError colSpan={4} message={errorMessage} />;
  }
  if (loading && data.length === 0) {
    return <TableRowLoading columns={4} />;
  }
  if (data.length === 0) {
    return <TableRowEmpty colSpan={4} />;
  }

  return (
    data
      // Only display first 6 elements.
      .slice(0, 6)
      .map((thisTopProcessStat, idx) => (
        <TopProcessRow
          cpu={thisTopProcessStat.cpu}
          key={`longview-top-process-${idx}`}
          mem={thisTopProcessStat.mem}
          name={thisTopProcessStat.name}
        />
      ))
  );
};

interface TopProcessRowProps {
  cpu: number;
  mem: number;
  name: string;
}

export const TopProcessRow = React.memo((props: TopProcessRowProps) => {
  const { cpu, mem, name } = props;

  // Memory is given from the API in KB.
  const memInBytes = mem * 1024;

  return (
    <TableRow data-testid="longview-top-process-row">
      <TableCell data-qa-top-process-process>{name}</TableCell>
      <TableCell data-qa-top-process-cpu>{formatCPU(cpu)}</TableCell>
      <TableCell data-qa-top-process-memory>
        {readableBytes(memInBytes, { round: 0 }).formatted}
      </TableCell>
    </TableRow>
  );
});

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
  Object.keys(topProcesses.Processes).forEach((processName) => {
    // For some reason the TS compiler doesn't recognize the early return above,
    // hence the non-null assertion operator on topProcesses.Processes.
    Object.values(topProcesses.Processes![processName]).forEach(
      (userProcess) => {
        topProcessDisplay.push({ ...userProcess, name: processName });
      }
    );
  });
  return topProcessDisplay;
};
