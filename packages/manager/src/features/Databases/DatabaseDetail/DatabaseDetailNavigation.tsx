import * as React from 'react';
import { matchPath, useHistory, useRouteMatch } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

const DatabaseBackups = React.lazy(() => import('./DatabaseBackups'));
const DatabaseSettings = React.lazy(() => import('./DatabaseSettings'));

const DatabaseDetailNavigation: React.FC<{}> = props => {
  const label = 'Test';
  const history = useHistory();
  const match = useRouteMatch<{ id: string; subpath: string }>({
    path: '/databases/:id/:subpath'
  });
  const isSubpath = (subpath: string) => match?.params?.subpath === subpath;

  const tabs = [
    {
      title: 'Backups',
      // routeName: `databases/${match?.params.id}/backups`
      routeName: `databases/detail/backups`
    },
    {
      title: 'Settings',
      routeName: `databases/detail/settings`
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const getIndex = () => {
    return Math.max(
      tabs.findIndex(tab => matches(tab.routeName)),
      0
    );
  };

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  return (
    <>
      <DocumentTitleSegment
        segment={`${label} - ${tabs[getIndex()]?.title ?? 'Detail View'}`}
      />
      <Tabs index={getIndex()} onChange={navToURL}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <DatabaseBackups />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <DatabaseSettings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default DatabaseDetailNavigation;
