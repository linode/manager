import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { prop, sortBy } from 'ramda';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Grid } from 'src/components/Grid';
import { TextField } from 'src/components/TextField';
import {
  LongviewProcesses,
  WithStartAndEnd,
} from 'src/features/Longview/request.types';
import { statAverage, statMax } from 'src/features/Longview/shared/utilities';
import { escapeRegExp } from 'src/utilities/escapeRegExp';
import { isToday as _isToday } from 'src/utilities/isToday';

import TimeRangeSelect from '../../../shared/TimeRangeSelect';
import { useGraphs } from '../OverviewGraphs/useGraphs';
import { ProcessesGraphs } from './ProcessesGraphs';
import { ProcessesTable, ExtendedProcess } from './ProcessesTable';
import { Process } from './types';

const useStyles = makeStyles()((theme: Theme) => ({
  filterInput: {
    width: 300,
  },
  root: {
    [theme.breakpoints.down('lg')]: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
  },
  selectTimeRange: {
    width: 200,
  },
}));

interface Props {
  clientAPIKey?: string;
  clientID?: number;
  lastUpdated?: number;
  lastUpdatedError?: APIError[];
  timezone: string;
}

export const filterResults = (
  results: ExtendedProcess[],
  inputText?: string
) => {
  if (!inputText) {
    return results;
  }

  const escapedInputText = escapeRegExp(inputText);

  return results.filter(
    (thisResult) =>
      thisResult.user.match(RegExp(escapedInputText, 'i')) ||
      thisResult.name.match(RegExp(escapedInputText, 'i'))
  );
};

const ProcessesLanding: React.FC<Props> = (props) => {
  const { clientAPIKey, lastUpdated, lastUpdatedError, timezone } = props;
  const { classes } = useStyles();

  // Text input for filtering processes by name or user.
  const [inputText, setInputText] = React.useState<string | undefined>();

  // The selected process row.
  const [selectedProcess, setSelectedProcess] = React.useState<Process | null>(
    null
  );

  // For the TimeRangeSelect.
  const [time, setTimeBox] = React.useState<WithStartAndEnd>({
    end: 0,
    start: 0,
  });
  const handleStatsChange = (start: number, end: number) => {
    setTimeBox({ end, start });
  };

  const isToday = _isToday(time.start, time.end);

  // We get all the data needed for the table and Graphs in one request.
  const { data, error, loading, request } = useGraphs(
    ['processes'],
    clientAPIKey,
    time.start,
    time.end
  );

  React.useEffect(() => {
    request();
  }, [time.start, time.end, clientAPIKey, lastUpdated, lastUpdatedError]);

  const memoizedExtendedData = React.useMemo(() => extendData(data), [data]);

  /**
   * Memoized separately so we don't extendData on every
   * text input
   */
  const memoizedFilteredData = React.useMemo(
    () => filterResults(memoizedExtendedData, inputText),
    [memoizedExtendedData, inputText]
  );

  // Once we have the data set the first row in the table as selected.
  // The <ProcessesTable /> component does the actual ordering of its data, so
  // we need to sort the data here in the same manner (by name ascending) and
  // select the first element.
  React.useEffect(() => {
    if (selectedProcess !== null) {
      return;
    }

    const sortedByName = sortByName(memoizedFilteredData);
    if (sortedByName.length > 0) {
      const { name, user } = sortedByName[0];
      setSelectedProcess({
        name,
        user,
      });
    }
  }, [selectedProcess, memoizedFilteredData]);

  return (
    <>
      <DocumentTitleSegment segment="Processes" />
      <Grid container spacing={4}>
        <Grid item lg={7} xs={12}>
          <Box
            className={classes.root}
            display="flex"
            justifyContent="space-between"
          >
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInputText(e.target.value)
              }
              className={classes.filterInput}
              hideLabel
              label="Filter by process or user"
              placeholder="Filter by process or user..."
            />
            <TimeRangeSelect
              className={classes.selectTimeRange}
              defaultValue={'Past 30 Minutes'}
              handleStatsChange={handleStatsChange}
              hideLabel
              label="Select Time Range"
            />
          </Box>
          <ProcessesTable
            error={lastUpdatedError?.[0]?.reason || error}
            // It's correct to set loading to `true` when
            // processes.lastUpdated === 0. The reason we do this is to avoid
            // a state where we haven't made the request to get processes yet
            // (since we're waiting on lastUpdated) and thus processes.loading
            // is `false` but we don't have any data to show. Instead of showing
            processesData={memoizedFilteredData}
            // an empty state, we want to show a loader.
            processesLoading={loading || lastUpdated === 0}
            selectedProcess={selectedProcess}
            setSelectedProcess={setSelectedProcess}
          />
        </Grid>
        <Grid item lg={5} xs={12}>
          <ProcessesGraphs
            clientAPIKey={clientAPIKey || ''}
            error={lastUpdatedError?.[0]?.reason || error}
            isToday={isToday}
            lastUpdated={lastUpdated}
            processesData={data}
            processesLoading={loading || lastUpdated === 0}
            selectedProcess={selectedProcess}
            time={time}
            timezone={timezone}
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
  Object.keys(processesData.Processes).forEach((processName) => {
    // Each process is an object where the keys are usernames and the values are
    // stats for that process/user. Additionally there's a key called "longname"
    // with a string as the value. Here, we separate these keys.
    const { longname, ...users } = processesData.Processes![processName];

    Object.keys(users).forEach((user) => {
      const userProcess = processesData.Processes![processName][user];

      extendedData.push({
        averageCPU: statAverage(userProcess.cpu),
        averageIO:
          statAverage(userProcess.ioreadkbytes) +
          statAverage(userProcess.iowritekbytes),
        averageMem: statAverage(userProcess.mem),
        id: `${processName}-${user}`,
        maxCount: statMax(userProcess.count),
        name: processName,
        user,
      });
    });
  });

  return extendedData;
};

const sortByName = sortBy(prop('name'));
