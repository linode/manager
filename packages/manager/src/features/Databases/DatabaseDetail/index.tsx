import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import CircleProgress from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import ErrorState from 'src/components/ErrorState';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import useFlags from 'src/hooks/useFlags';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { Engine } from '@linode/api-v4/lib/databases/types';

const DatabaseSummary = React.lazy(() => import('./DatabaseSummary'));
const DatabaseBackups = React.lazy(() => import('./DatabaseBackups'));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));

export const DatabaseDetail: React.FC = () => {
  const flags = useFlags();
  const history = useHistory();

  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const id = Number(databaseId);

  const { data: database, isLoading, error } = useDatabaseQuery(engine, id);

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
      routeName: `/databases/${engine}/${id}/summary`,
    },
    {
      title: 'Backups',
      routeName: `/databases/${engine}/${id}/backups`,
    },
    {
      title: 'Settings',
      routeName: `/databases/${engine}/${id}/settings`,
    },
  ];

  const getTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    // Redirect to the landing page if the path does not exist
    if (tabChoice < 0) {
      history.push(`/databases/${engine}/${id}`);

      return 0;
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
        pathname={location.pathname}
        labelTitle={database.label}
        firstAndLastOnly
        crumbOverrides={[
          {
            position: 1,
            label: 'Database Clusters',
          },
        ]}
        labelOptions={{ noCap: true }}
      />
      <Tabs index={getTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <DatabaseSummary database={database} />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <DatabaseBackups />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <DatabaseSettings database={database} />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
};

export default DatabaseDetail;
