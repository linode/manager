import * as React from 'react';

import { Link } from 'src/components/Link';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';

export interface Tab {
  chip?: React.JSX.Element | null;
  routeName: string;
  title: string;
}

interface TabLinkListProps {
  noLink?: boolean; // @todo: remove this prop if we use NavTab widely.
  tabs: Tab[];
}

export const TabLinkList = ({ noLink, tabs }: TabLinkListProps) => {
  return (
    <TabList>
      {tabs.map((tab, _index) => {
        // @todo: remove this if we use NavTab widely.
        const extraTemporaryProps: any = noLink
          ? {}
          : { as: Link, to: tab.routeName };

        return (
          <Tab
            key={`tab-${_index}`}
            // @todo: remove this if we use NavTab widely.
            {...extraTemporaryProps}
          >
            {tab.title}
            {tab.chip}
          </Tab>
        );
      })}
    </TabList>
  );
};
