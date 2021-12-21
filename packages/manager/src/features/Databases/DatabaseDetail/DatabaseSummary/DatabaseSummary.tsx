import * as React from 'react';
import Paper from 'src/components/core/Paper';
import AccessControls from './AccessControls';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Divider from 'src/components/core/Divider';

// import useDatabases from 'src/hooks/useDatabases';
// import DatabaseSummaryLabelPanel from './DatabaseSummaryLabelPanel';
// import DatabaseSummaryMaintenancePanel from './DatabaseSummaryMaintenancePanel';
// import DatabaseSummaryPasswordPanel from './DatabaseSummaryPasswordPanel';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: '1.5rem',
    marginBottom: '1rem',
  },
}));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DatabaseSummary: React.FC<Props> = (props) => {
  const classes = useStyles();
  // const databases = useDatabases();
  // const { databaseID } = props;
  // const thisDatabase = databases.databases.itemsById[databaseID];

  return (
    <Paper>
      <Typography variant="h3">Cluster Configuration</Typography>
      <Typography variant="h3">Connection Details</Typography>
      <Divider className={classes.divider} />
      {/* <DatabaseSummaryLabelPanel
        databaseID={thisDatabase.id}
        databaseLabel={thisDatabase.label}
      />
      <DatabaseSummaryPasswordPanel databaseID={thisDatabase.id} />
      <DatabaseSummaryMaintenancePanel
        databaseID={thisDatabase.id}
        databaseMaintenanceSchedule={thisDatabase.maintenance_schedule}
      /> */}
      <AccessControls />
    </Paper>
  );
};

export default DatabaseSummary;
