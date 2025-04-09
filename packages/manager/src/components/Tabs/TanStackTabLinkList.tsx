import { Link as TanstackLink } from '@tanstack/react-router';
import * as React from 'react';

import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';

import type { Tab as TanstackTab } from 'src/hooks/useTabs';

export interface Tab {
  chip?: React.JSX.Element | null;
  routeName: string;
  title: string;
}

interface TabLinkListProps {
  noLink?: boolean;
  tabs: TanstackTab[];
}

export const TanStackTabLinkList = ({ noLink, tabs }: TabLinkListProps) => {
  return (
    <TabList>
      {tabs.map((tab, _index) => {
        return (
          <Tab
            // @ts-expect-error - Tab accepts 'as' prop at runtime but it's not in the types
            as={noLink ? undefined : TanstackLink}
            key={`tab-${_index}`}
            preload={noLink ? undefined : 'intent'}
            to={noLink ? undefined : tab.to}
          >
            {tab.title}
            {tab.chip}
          </Tab>
        );
      })}
    </TabList>
  );
};
