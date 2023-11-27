import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';

import type { TabProps } from '@reach/tabs';
import type { Meta, StoryObj } from '@storybook/react';

export const _tabs = [
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
  render: (args) => (
    <Tabs {...args}>
      {_tabs.map((_, idx) => (
        <>
          <TabLinkList tabs={_tabs} />
          <TabPanels>
            <SafeTabPanel index={idx} key={`tab-${idx}`}>
              <Paper sx={{ paddingLeft: 16, paddingTop: 8 }}>
                <Typography variant="body1">Panel {idx + 1}</Typography>
              </Paper>
            </SafeTabPanel>
          </TabPanels>
        </>
      ))}
    </Tabs>
  ),
};

const meta: Meta<TabProps> = {
  args: {
    disabled: false,
    index: 0,
  },
  component: Tabs,
  title: 'Components/Tabs',
};
export default meta;
