import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Divider from 'src/components/core/Divider';
// import useDatabases from 'src/hooks/useDatabases';

import ConnectionDetails from './DatabaseSummaryConnectionDetails';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import AccessControls from './DatabaseSummaryAccessControls';

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
      <ConnectionDetails /> 
      <ClusterConfiguration />
      <Divider className={classes.divider} />
      <AccessControls />
    </Paper>
  );
};

export default DatabaseSummary;
