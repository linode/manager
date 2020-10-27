import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import NavTabs from 'src/components/NavTabs';
import { NavTab } from 'src/components/NavTabs/NavTabs';
import DatabaseBackups from './DatabaseBackups';
import DatabaseEntityDetail from './DatabaseEntityDetail';
import DatabaseSettings from './DatabaseSettings';

type CombinedProps = RouteComponentProps<{ id: string }>;

const DatabaseDetail: React.FC<CombinedProps> = props => {
  const baseURL = props.match.url;

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
      <DatabaseEntityDetail database="" />
      <NavTabs tabs={tabs} />
    </>
  );
};

export default DatabaseDetail;
