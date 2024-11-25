import { Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { TabLinkList } from './TabLinkList';

import type { TabsProps } from '@reach/tabs';
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

/**
 * Tabs allow users to view content across categories that are all related and share a similar hierarchy.
 * - Each tab should contain distinct content
 * - Tabs can scroll horizontally on smaller screens and mobile
 * - Content across a tab set should be considered peers, each tab being of equal importance
 */
export const Default: StoryObj<TabsProps> = {
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

const meta: Meta<TabsProps> = {
  argTypes: {
    defaultIndex: {
      control: { type: 'number' },
      description: 'Starts the tabs at a specific index.',
    },
    index: {
      control: { type: 'number' },
      description:
        'The index of the tab, must include `onChange` in order for the tabs to be interactive.',
    },
    onChange: {
      control: false,
      description: 'Callback fired when the value changes.',
    },
  },
  args: {
    defaultIndex: 0,
    index: 0,
    onChange: () => null,
  },
  component: Tabs,
  title: 'Foundations/Tabs',
};
export default meta;
