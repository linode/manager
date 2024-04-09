import React from 'react';

import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';

import { useLinodeCreateQueryParams } from '../../utilities';
import { Images } from './Images';
import { StackScriptSelectionList } from './StackScriptSelectionList';
import { getStackScriptTabIndex, tabs } from './utilities';

export const StackScripts = () => {
  const { params, updateParams } = useLinodeCreateQueryParams();

  return (
    <Stack spacing={3}>
      <Paper>
        <Typography variant="h2">Create From:</Typography>
        <Tabs
          onChange={(index) =>
            updateParams({ stackScriptID: undefined, subtype: tabs[index] })
          }
          index={getStackScriptTabIndex(params.subtype)}
        >
          <TabList>
            <Tab>Account StackScripts</Tab>
            <Tab>Community StackScripts</Tab>
          </TabList>
          <TabPanels>
            <SafeTabPanel index={0}>
              <StackScriptSelectionList type="Account" />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <StackScriptSelectionList type="Community" />
            </SafeTabPanel>
          </TabPanels>
        </Tabs>
      </Paper>
      <Images />
    </Stack>
  );
};
