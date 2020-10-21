import * as React from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import ReachTabs from 'src/components/core/ReachTabs';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from '../TabLinkList/TabLinkList';

interface NavTab {
  title: string;
  routeName: string;
  component: React.ComponentType;
}

export interface NavTabsProps {
  tabs: NavTab[];
  navToTabRouteOnChange?: boolean;
}

type CombinedProps = NavTabsProps;

const NavTabs: React.FC<CombinedProps> = props => {
  const history = useHistory();
  const location = useLocation();

  const { tabs, navToTabRouteOnChange } = props;

  // Defaults to `true`.
  const _navToTabRouteOnChange = navToTabRouteOnChange ?? true;

  const navToURL = (index: number) => {
    if (tabs[index]) {
      history.push(tabs[index].routeName);
    }
  };

  const tabIdx = tabs.findIndex(tab => tab.routeName === location.pathname);

  // Redirect to the first tab's route name if the route is bogus.
  if (tabIdx === -1) {
    return <Redirect to={tabs[0].routeName} />;
  }

  return (
    <ReachTabs
      index={Math.max(tabIdx, 0)}
      onChange={_navToTabRouteOnChange ? navToURL : undefined}
    >
      <TabLinkList tabs={tabs} noLink />
      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          {tabs.map((thisTab, i) => {
            return (
              <SafeTabPanel key={thisTab.routeName} index={i}>
                <thisTab.component />
              </SafeTabPanel>
            );
          })}
        </TabPanels>
      </React.Suspense>
    </ReachTabs>
  );
};

export default React.memo(NavTabs);
