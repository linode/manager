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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

type CombinedProps = Props;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DatabaseDetail: React.FC<CombinedProps> = (props) => {
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

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const clampTabChoice = () => {
    const tabChoice = tabs.findIndex((tab) => matches(tab.routeName));
    return tabChoice < 0 ? 0 : tabChoice;
  };

  const navToURL = (index: number) => {
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
      <Tabs defaultIndex={clampTabChoice()} onChange={navToURL}>
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
