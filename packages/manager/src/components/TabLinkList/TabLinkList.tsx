import { Link } from '@reach/router';
import * as React from 'react';

import { Tab } from 'src/components/ReachTab';
import { TabList } from 'src/components/ReachTabList';

export interface Tab {
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
          </Tab>
        );
      })}
    </TabList>
  );
};
