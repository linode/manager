import * as React from 'react';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Divider from 'src/components/core/Divider';
// import useDatabases from 'src/hooks/useDatabases';

import ConnectionDetails from './DatabaseSummaryConnectionDetails';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import AccessControls from './DatabaseSummaryAccessControls';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DatabaseSummary: React.FC<Props> = (props) => {
  // const databases = useDatabases();
  // const { databaseID } = props;
  // const thisDatabase = databases.databases.itemsById[databaseID];

  return (
    <Paper>
      <Grid container>
        <Grid item>
          <ConnectionDetails />
        </Grid>
        <Grid item>
          <ClusterConfiguration />
        </Grid>
      </Grid>
      <Divider spacingTop={1.5} spacingBottom={1} />
      <AccessControls />
    </Paper>
  );
};

export default DatabaseSummary;
