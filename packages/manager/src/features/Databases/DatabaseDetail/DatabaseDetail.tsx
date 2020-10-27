import * as React from 'react';
import { RouteComponentProps, useRouteMatch } from 'react-router-dom';
import NavTabs from 'src/components/NavTabs';
import { NavTab } from 'src/components/NavTabs/NavTabs';
import useDatabases from 'src/hooks/useDatabases';
import useReduxLoad from 'src/hooks/useReduxLoad';
import DatabaseBackups from './DatabaseBackups';
import DatabaseEntityDetail from './DatabaseEntityDetail';
import DatabaseSettings from './DatabaseSettings';

type CombinedProps = RouteComponentProps<{ id: string }>;

const DatabaseDetail: React.FC<CombinedProps> = () => {
  const match = useRouteMatch<{ id: string }>('/databases/:id');
  const databases = useDatabases();
  useReduxLoad(['databases']);

  const thisDatabaseID = match?.params?.id;

  const thisDatabase = databases.databases.itemsById[thisDatabaseID ?? '-1'];

  if (!thisDatabase || !match) {
    return null;
  }

  const baseURL = match.url;

  const tabs: NavTab[] = [
    {
      title: 'Backups',
      routeName: `${baseURL}/backups`,
      component: DatabaseBackups,
      backgroundRendering: true
    },
    {
      title: 'Settings',
      routeName: `${baseURL}/settings`,
      component: DatabaseSettings,
      backgroundRendering: true
    }
  ];

  return (
    <>
      <DatabaseEntityDetail database={thisDatabase} />
      <NavTabs tabs={tabs} />
    </>
  );
};

export default DatabaseDetail;
