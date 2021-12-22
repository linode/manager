import * as React from 'react';
// import useDatabases from 'src/hooks/useDatabases';
import DatabaseSummaryConnectionDetails from './DatabaseSummaryConnectionDetails';
import DatabaseSummaryClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import DatabaseSummaryAccessControls from './DatabaseSummaryAccessControls';

// 
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
    <>
      Database Summary
      <DatabaseSummaryConnectionDetails />
      <DatabaseSummaryClusterConfiguration />
      <DatabaseSummaryAccessControls />
    </>
  );
};

export default DatabaseSummary;
