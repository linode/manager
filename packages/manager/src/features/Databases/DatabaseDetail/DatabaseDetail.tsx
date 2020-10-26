import * as React from 'react';
import { RouteComponentProps, useRouteMatch } from 'react-router-dom';
import useDatabases from 'src/hooks/useDatabases';
import useReduxLoad from 'src/hooks/useReduxLoad';
import DatabaseDetailNavigation from './DatabaseDetailNavigation';
import DatabaseEntityDetail from './DatabaseEntityDetail';

type CombinedProps = RouteComponentProps<{ id: string }>;

const DatabaseDetail: React.FC<CombinedProps> = () => {
  const match = useRouteMatch<{ id: string }>('/databases/:id');
  const databases = useDatabases();
  useReduxLoad(['databases']);

  const thisDatabaseID = match?.params?.id;

  const thisDatabase = databases.databases.itemsById[thisDatabaseID ?? '-1'];

  if (!thisDatabase) {
    return null;
  }

  return (
    <>
      <DatabaseEntityDetail database="" />
      <DatabaseDetailNavigation
        databaseID={thisDatabase.id}
        databaseLabel={thisDatabase.label}
      />
    </>
  );
};

export default DatabaseDetail;
