import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
// import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import useFlags from 'src/hooks/useFlags';

const DatabaseSummary = React.lazy(() => import('./DatabaseSummary'));
const DatabaseBackups = React.lazy(() => import('./DatabaseBackups'));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));

type CombinedProps = RouteComponentProps<{ id: string }>;

export const DatabaseDetail: React.FC<CombinedProps> = (props) => {
  // @TODO: Remove when Database goes to GA
  const flags = useFlags();
  if (!flags.databases) {
    return null;
  }

  // Source the Database's ID from the /:id path param.
  // const thisDatabaseId = props.match.params.id;

  const URL = props.match.url;

  const tabs = [
    {
      title: 'Summary',
      routeName: `${URL}/summary`,
    },
    {
      title: 'Backups',
      routeName: `${URL}/backups`,
    },
    {
      title: 'Settings',
      routeName: `${URL}/settings`,
    },
  ];

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <>
      {/* <DocumentTitleSegment segment={thisDatabase.label} /> */}
      Database Details
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
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
