import * as React from 'react';
import { matchPath, Redirect, useHistory, useLocation } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanel } from 'src/components/Tabs/TabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { TabLinkList } from '../Tabs/TabLinkList';

export interface NavTab {
  // especially when a component behind a tab performs network requests.
  backgroundRendering?: boolean;
  component?:
    | React.ComponentType
    | React.LazyExoticComponent<React.ComponentType>;
  render?: JSX.Element;
  routeName: string;
  // Whether or not this tab should be rendered in the background (even when
  // not on screen). Consumers should consider performance implications,
  title: string;
}

export interface NavTabsProps {
  navToTabRouteOnChange?: boolean;
  tabs: NavTab[];
}

export const NavTabs = React.memo((props: NavTabsProps) => {
  const history = useHistory();
  const reactRouterLocation = useLocation();

  const { navToTabRouteOnChange, tabs } = props;

  // Defaults to `true`.
  const _navToTabRouteOnChange = navToTabRouteOnChange ?? true;

  const navToURL = (index: number) => {
    if (tabs[index]) {
      history.push(tabs[index].routeName);
    }
  };

  const tabMatch = getTabMatch(tabs, reactRouterLocation.pathname);

  // Redirect to the first tab's route name if the pathname is unknown.
  if (tabMatch.idx === -1) {
    return <Redirect to={tabs[0].routeName} />;
  }

  // Redirect to the exact route name if the pathname doesn't match precisely.
  if (!tabMatch.isExact) {
    return <Redirect to={tabs[tabMatch.idx].routeName} />;
  }

  return (
    <Tabs
      index={Math.max(tabMatch.idx, 0)}
      onChange={_navToTabRouteOnChange ? navToURL : undefined}
    >
      <TabLinkList noLink tabs={tabs} />
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
              <_TabPanelComponent index={i} key={thisTab.routeName}>
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
    </Tabs>
  );
});

// Given tabs and a pathname, return the index of the matched tab, and whether
// or not it's an exact match. If no match is found, the returned index is -1.
export const getTabMatch = (tabs: NavTab[], pathname: string) => {
  return tabs.reduce(
    (acc, thisTab, i) => {
      const match = matchPath(pathname, {
        exact: false,
        path: thisTab.routeName,
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
