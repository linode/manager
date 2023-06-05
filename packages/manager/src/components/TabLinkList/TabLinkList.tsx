import { Link } from '@reach/router';
import * as React from 'react';
import TabList from 'src/components/core/ReachTabList';
import { Tab } from 'src/components/core/ReachTab';

export interface Tab {
  title: string;
  routeName: string;
}

interface TabLinkListProps {
  tabs: Tab[];
  noLink?: boolean; // @todo: remove this prop if we use NavTab widely.
}

export const TabLinkList = ({ tabs, noLink }: TabLinkListProps) => {
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
