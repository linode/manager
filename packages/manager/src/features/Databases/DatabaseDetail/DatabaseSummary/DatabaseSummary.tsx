import * as React from 'react';
// import useDatabases from 'src/hooks/useDatabases';
import ConnectionDetails from './DatabaseSummaryConnectionDetails';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import AccessControls from './DatabaseSummaryAccessControls';

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
      <ConnectionDetails />
      <ClusterConfiguration />
      <AccessControls />
    </>
  );
};

export default DatabaseSummary;
