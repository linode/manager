import * as React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import useFlags from 'src/hooks/useFlags';
import { getDatabaseEngine, useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

const DatabaseSummary = React.lazy(() => import('./DatabaseSummary'));
const DatabaseBackups = React.lazy(() => import('./DatabaseBackups'));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));

export const DatabaseDetail: React.FC = () => {
  const flags = useFlags();
  const history = useHistory();

  const { databaseId } = useParams<{ databaseId: string }>();

  const id = Number(databaseId);

  const { data: database, isLoading, error } = useDatabaseQuery(
    getDatabaseEngine(id),
    id
  );

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your database.')[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (!database || !flags.databases) {
    return null;
  }

  const tabs = [
    {
      title: 'Summary',
      routeName: `/databases/${databaseId}/summary`,
    },
    {
      title: 'Backups',
      routeName: `/databases/${databaseId}/backups`,
    },
    {
      title: 'Settings',
      routeName: `/databases/${databaseId}/settings`,
    },
  ];

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    // Redirect to the landing page if the path does not exist
    if (tabChoice < 0) {
      history.push(`/databases/${databaseId}`);
    }

    return tabChoice;
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  return (
    <>
      <DocumentTitleSegment segment={database.label} />
      <Breadcrumb
        pathname={`/Database Clusters/${database.label}`}
        firstAndLastOnly
        labelOptions={{ noCap: true }}
      />
      <Tabs defaultIndex={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <DatabaseSummary database={database} />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <DatabaseBackups />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <DatabaseSettings />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default DatabaseDetail;
