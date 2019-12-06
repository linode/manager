import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import TextField from 'src/components/TextField';
import get from 'src/features/Longview/request';
import { LongviewProcesses } from 'src/features/Longview/request.types';
import { statAverage, statMax } from 'src/features/Longview/shared/utilities';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import ProcessesGraphs from './ProcessesGraphs';
import ProcessesTable, { ExtendedProcess } from './ProcessesTable';

const useStyles = makeStyles((theme: Theme) => ({
  filterInput: {
    width: 300
  },
  timeSelect: {
    width: 200
  }
}));

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
}

const ProcessesLanding: React.FC<Props> = props => {
  const classes = useStyles();

  const [selectedRow, setSelectedRow] = React.useState<string | null>(null);

  const { clientAPIKey, lastUpdated, lastUpdatedError } = props;

  const processes = useAPIRequest<LongviewProcesses>(
    clientAPIKey && lastUpdated
      ? () => get(clientAPIKey, 'getValues', { fields: ['processes'] })
      : null,
    { Processes: {} },
    [clientAPIKey, lastUpdated]
  );

  const memoizedExtendedData = React.useMemo(() => extendData(processes.data), [
    processes.data
  ]);

  return (
    <>
      <Grid
        container
        id="tabpanel-longview-processes"
        role="tabpanel"
        aria-labelledby="tab-longview-processes"
      >
        <Grid item xs={9}>
          <Box display="flex" justifyContent="space-between">
            {/* Doesn't work yet. */}
            <TextField
              className={classes.filterInput}
              small
              placeholder="Filter by process or user..."
              label="Filter by process or user"
              hideLabel
            />
            {/* Doesn't work yet. */}
            <Select
              className={classes.timeSelect}
              small
              placeholder="Last 12 Hours"
              onChange={() => null}
              label="Select Time Range"
              hideLabel
            />
          </Box>
          <ProcessesTable
            processesData={memoizedExtendedData}
            // It's correct to set loading to `true` when
            // processes.lastUpdated === 0. The reason we do this is to avoid
            // a state where we haven't made the request to get processes yet
            // (since we're waiting on lastUpdated) and thus processes.loading
            // is `false` but we don't have any data to show. Instead of showing
            // an empty state, we want to show a loader.
            processesLoading={processes.loading || processes.lastUpdated === 0}
            processesError={processes.error}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
            lastUpdatedError={lastUpdatedError}
          />
        </Grid>
        <Grid item xs={3}>
          <ProcessesGraphs
            processesData={memoizedExtendedData}
            processesLoading={processes.loading || processes.lastUpdated === 0}
            processesError={processes.error}
            selectedRow={selectedRow}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default React.memo(ProcessesLanding);

export const extendData = (
  processesData: LongviewProcesses
): ExtendedProcess[] => {
  if (!processesData || !processesData.Processes) {
    return [];
  }

  const extendedData: ExtendedProcess[] = [];
  Object.keys(processesData.Processes).forEach(processName => {
    // Each process is an object where the keys are usernames and the values are
    // stats for that process/user. Additionally there's a key called "longname"
    // with a string as the value. Here, we separate these keys.
    const { longname, ...users } = processesData.Processes![processName];

    Object.keys(users).forEach(user => {
      const userProcess = processesData.Processes![processName][user];

      extendedData.push({
        id: `${processName}-${user}`,
        name: processName,
        user,
        maxCount: statMax(userProcess.count),
        averageIO:
          statAverage(userProcess.ioreadkbytes) +
          statAverage(userProcess.iowritekbytes),
        averageCPU: statAverage(userProcess.cpu),
        averageMem: statAverage(userProcess.mem)
      });
    });
  });

  return extendedData;
};
