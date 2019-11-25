import * as React from 'react';
import Grid from 'src/components/Grid';
import get from 'src/features/Longview/request';
import { LongviewProcesses, Stat } from 'src/features/Longview/request.types';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import ProcessesGraphs from './ProcessesGraphs';
import ProcessesTable, { ExtendedProcess } from './ProcessesTable';

interface Props {
  clientAPIKey?: string;
  lastUpdated?: number;
}

const ProcessesLanding: React.FC<Props> = props => {
  const [selectedRow, setSelectedRow] = React.useState<string | null>(null);

  const { clientAPIKey, lastUpdated } = props;

  const processes = useAPIRequest<LongviewProcesses>(
    // We can only make this request if we have a clientAPIKey, so we use `null`
    // if we don't (which will happen the first time this component mounts). We
    // also check for `lastUpdated`, otherwise we'd make an extraneous request
    // when it is retrieved.
    clientAPIKey && lastUpdated
      ? () => get(clientAPIKey, 'getValues', { fields: ['processes'] })
      : null,
    { Processes: {} },
    [clientAPIKey, lastUpdated]
  );

  return (
    <>
      <Grid container>
        <Grid item xs={9}>
          <ProcessesTable
            processesData={mungeData(processes.data)}
            processesLoading={processes.loading}
            processesError={processes.error}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        </Grid>
        <Grid item xs={3}>
          <ProcessesGraphs
            processesData={mungeData(processes.data)}
            processesLoading={processes.loading}
            processesError={processes.error}
            selectedRow={selectedRow}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default React.memo(ProcessesLanding);

export const mungeData = (processes: LongviewProcesses): ExtendedProcess[] => {
  if (!processes || !processes.Processes) {
    return [];
  }

  const extendedData: ExtendedProcess[] = [];
  Object.keys(processes.Processes).forEach(processName => {
    const { longname, ...users } = processes.Processes[processName];
    Object.keys(users).forEach(user => {
      if (user === 'longname') {
        return;
      }

      const userProcess = processes.Processes[processName][user];

      extendedData.push({
        name: processName,
        user,
        averageCPU: getAverage(userProcess.cpu || []),
        averageIO:
          getAverage(userProcess.ioreadkbytes || []) +
          getAverage(userProcess.iowritekbytes || []),
        averageMem: getAverage(userProcess.mem || []),
        id: processName + user,
        maxCount: getMax(userProcess.count || [])
      });
    });
  });

  return extendedData;
};

export const getAverage = (stats: Stat[]): number => {
  const sum = stats.reduce((acc, { y }) => acc + y, 0);
  return sum / stats.length;
};

export const getMax = (stats: Stat[]): number => {
  return stats.reduce((acc, { y }) => {
    if (y > acc) {
      return y;
    }
    return acc;
  }, 0);
};
