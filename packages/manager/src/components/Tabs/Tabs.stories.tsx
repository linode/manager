import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';

import { TabLinkList } from './TabLinkList';

import type { TabProps } from '@reach/tabs';
import type { Meta, StoryObj } from '@storybook/react';

const _tabs = [
  {
    routeName: '/tab1',
    title: 'Tab 1',
  },
  {
    routeName: '/tab2',
    title: 'Tab 2',
  },
  {
    routeName: '/tab3',
    title: 'Tab 3',
  },
];

export const Default: StoryObj<TabProps> = {
  render: () => (
    <Tabs>
      <TabLinkList tabs={_tabs} />
      <TabPanels>
        {_tabs.map((tab, idx) => (
          <SafeTabPanel index={idx} key={`tab-${idx}`}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="body1">Content for {tab.title}</Typography>
            </Paper>
          </SafeTabPanel>
        ))}
      </TabPanels>
    </Tabs>
  ),
};

const meta: Meta<TabProps> = {
  component: Tabs,
  title: 'Components/Tabs',
};
export default meta;
