import * as React from 'react';
import { matchPath, useHistory, useParams } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
// import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import useFlags from 'src/hooks/useFlags';

const DatabaseSummary = React.lazy(() => import('./DatabaseSummary'));
const DatabaseBackups = React.lazy(() => import('./DatabaseBackups'));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));

export const DatabaseDetail: React.FC = () => {
  const history = useHistory();
  const { databaseId } = useParams<{ databaseId: string }>();

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
      return 0;
    } else {
      return tabChoice;
    }
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  // @TODO: Remove when Database goes to GA
  const flags = useFlags();
  if (!flags.databases) {
    return null;
  }

  return (
    <>
      {/* <DocumentTitleSegment segment={thisDatabase.label} /> */}
      Database Details
      <Tabs defaultIndex={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />
        <TabPanels>
          <SafeTabPanel index={0}>
            <DatabaseSummary />
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
