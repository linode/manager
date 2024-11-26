import * as React from 'react';
import { Link } from 'react-router-dom';

import { Tab } from './Tab';
import { TabList } from './TabList';

export interface TabProps {
  chip?: React.JSX.Element | null;
  routeName: string;
  title: string;
}

interface TabLinkListProps {
  noLink?: boolean; // @todo: remove this prop if we use NavTab widely.
  tabs: TabProps[];
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
