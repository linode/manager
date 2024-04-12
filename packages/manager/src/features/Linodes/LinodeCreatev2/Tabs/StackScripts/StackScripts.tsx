import React from 'react';
import { useFormContext } from 'react-hook-form';

import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { Typography } from 'src/components/Typography';

import { useLinodeCreateQueryParams } from '../../utilities';
import { StackScriptImages } from './StackScriptImages';
import { StackScriptSelectionList } from './StackScriptSelectionList';
import { getStackScriptTabIndex, tabs } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const StackScripts = () => {
  const { params, updateParams } = useLinodeCreateQueryParams();
  const { formState, reset } = useFormContext<CreateLinodeRequest>();

  const onTabChange = (index: number) => {
    // Update the "subtype" query param. (This switches between "Community" and "Account" tabs).
    updateParams({ stackScriptID: undefined, subtype: tabs[index] });
    // Reset the selected image, the selected StackScript, and the StackScript data when changing tabs.
    reset((prev) => ({
      ...prev,
      image: null,
      stackscript_data: null,
      stackscript_id: null,
    }));
  };

  return (
    <Stack spacing={3}>
      <Paper>
        <Typography variant="h2">Create From:</Typography>
        {formState.errors.stackscript_id && (
          <Notice
            spacingBottom={0}
            spacingTop={8}
            text={formState.errors.stackscript_id.message}
            variant="error"
          />
        )}
        <Tabs
          index={getStackScriptTabIndex(params.subtype)}
          onChange={onTabChange}
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
      <StackScriptImages />
    </Stack>
  );
};
