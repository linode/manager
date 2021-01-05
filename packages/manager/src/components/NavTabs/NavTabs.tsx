import * as React from 'react';
import { matchPath, Redirect, useHistory, useLocation } from 'react-router-dom';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import ReachTabs from 'src/components/core/ReachTabs';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from '../TabLinkList/TabLinkList';

export interface NavTab {
  title: string;
  routeName: string;
  component?:
    | React.ComponentType
    | React.LazyExoticComponent<React.ComponentType>;
  render?: JSX.Element;
  // Whether or not this tab should be rendered in the background (even when
  // not on screen). Consumers should consider performance implications,
  // especially when a component behind a tab performs network requests.
  backgroundRendering?: boolean;
}

export interface NavTabsProps {
  tabs: NavTab[];
  navToTabRouteOnChange?: boolean;
}

type CombinedProps = NavTabsProps;

const NavTabs: React.FC<CombinedProps> = props => {
  const history = useHistory();
  const reactRouterLocation = useLocation();

  const { tabs, navToTabRouteOnChange } = props;

  // Defaults to `true`.
  const _navToTabRouteOnChange = navToTabRouteOnChange ?? true;

  const navToURL = (index: number) => {
    if (tabs[index]) {
      history.push(tabs[index].routeName);
    }
  };

  // Detects if there's a search param, otherwise it won't detect instances
  // like '/stackscipts?type=account'
  const location = reactRouterLocation.pathname + reactRouterLocation.search;

  const tabMatch = getTabMatch(tabs, location);

  // Redirect to the first tab's route name if the pathname is unknown.
  if (tabMatch.idx === -1) {
    return <Redirect to={tabs[0].routeName} />;
  }

  // Redirect to the exact route name if the pathname doesn't match precisely.
  if (!tabMatch.isExact) {
    return <Redirect to={tabs[tabMatch.idx].routeName} />;
  }

  return (
    <ReachTabs
      index={Math.max(tabMatch.idx, 0)}
      onChange={_navToTabRouteOnChange ? navToURL : undefined}
    >
      <TabLinkList tabs={tabs} noLink />
      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          {tabs.map((thisTab, i) => {
            if (!thisTab.render && !thisTab.component) {
              return null;
            }

            const _TabPanelComponent = thisTab.backgroundRendering
              ? TabPanel
              : SafeTabPanel;

            return (
              <_TabPanelComponent key={thisTab.routeName} index={i}>
                {thisTab.component ? (
                  <thisTab.component />
                ) : thisTab.render ? (
                  thisTab.render
                ) : null}
              </_TabPanelComponent>
            );
          })}
        </TabPanels>
      </React.Suspense>
    </ReachTabs>
  );
};

export default React.memo(NavTabs);

// Given tabs and a pathname, return the index of the matched tab, and whether
// or not it's an exact match. If no match is found, the returned index is -1.
export const getTabMatch = (tabs: NavTab[], pathname: string) => {
  return tabs.reduce(
    (acc, thisTab, i) => {
      const match = matchPath(pathname, {
        path: thisTab.routeName,
        exact: false
      });

      if (match) {
        acc.idx = i;
        acc.isExact = match.isExact;
      }

      return acc;
    },
    { idx: -1, isExact: false }
  );
};
