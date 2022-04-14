import { Link } from '@reach/router';
import * as React from 'react';
import Tab from 'src/components/core/ReachTab';
import TabList from 'src/components/core/ReachTabList';

export interface Tab {
  title: string;
  routeName: string;
}

interface Props {
  tabs: Tab[];
  [index: string]: any;
  noLink?: boolean; // @todo: remove this prop if we use NavTab widely.
}

export const TabLinkList: React.FC<Props> = ({ tabs, noLink }) => {
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

export default TabLinkList;
