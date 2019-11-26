import * as Factory from 'factory.ts';
import * as React from 'react';
import Grid from 'src/components/Grid';
import ProcessesGraphs from './ProcessesGraphs';
import ProcessesTable, { ExtendedProcess } from './ProcessesTable';

// === MOCK DAtA ===
const randomElement = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];
const randNum = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min) + min);
};
const TEMPORARY_longviewProcessFactory = Factory.Sync.makeFactory<
  ExtendedProcess
>({
  // In real life, `id` will be name + user concatenated.
  id: Factory.each(() => `${randNum(0, 50000)}`),
  name: Factory.each(() => randomElement(['bash', 'ssd', 'systemd'])),
  user: Factory.each(() => randomElement(['root', 'user1'])),
  maxCount: Factory.each(() => randNum(0, 4)),
  averageIO: Factory.each(() => randNum(0, 500)),
  averageCPU: Factory.each(() => randNum(0, 100)),
  averageMem: Factory.each(() => randNum(0, 100))
});
const mockData = TEMPORARY_longviewProcessFactory.buildList(25);
// =================

const ProcessesLanding: React.FC<{}> = () => {
  const [selectedRow, setSelectedRow] = React.useState<string | null>(null);

  // === MOCK DAtA ===
  const processesData = mockData;
  const processesLoading = false;
  const processesError = undefined;
  // =================

  return (
    <>
      <Grid container>
        <Grid item xs={9}>
          <ProcessesTable
            processesData={processesData}
            processesLoading={processesLoading}
            processesError={processesError}
            selectedRow={selectedRow}
            setSelectedRow={setSelectedRow}
          />
        </Grid>
        <Grid item xs={3}>
          <ProcessesGraphs
            processesData={processesData}
            processesLoading={processesLoading}
            processesError={processesError}
            selectedRow={selectedRow}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default React.memo(ProcessesLanding);
