import * as React from 'react';

import { Link as TanstackLink } from 'src/components/Link';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';

import type { Tab as TanstackTab } from 'src/hooks/useTabs';

export interface Tab {
  chip?: null | React.JSX.Element;
  routeName: string;
  title: string;
}

interface TabLinkListProps {
  fontSize?: string;
  noLink?: boolean;
  tabs: TanstackTab[];
}

export const TanStackTabLinkList = ({
  fontSize,
  noLink,
  tabs,
}: TabLinkListProps) => {
  return (
    <TabList>
      {tabs.map((tab, _index) => {
        return (
          <Tab
            // @ts-expect-error - Tab accepts 'as' prop at runtime but it's not in the types
            as={noLink ? undefined : TanstackLink}
            data-pendo-id={tab?.pendoId}
            data-testid={tab.title}
            fontSize={fontSize}
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
