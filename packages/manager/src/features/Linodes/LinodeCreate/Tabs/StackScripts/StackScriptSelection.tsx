import { Notice, Paper, Typography } from '@linode/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { useLinodeCreateQueryParams } from '../../utilities';
import { StackScriptSelectionList } from './StackScriptSelectionList';
import { getStackScriptTabIndex, tabs } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';

export const StackScriptSelection = () => {
  const { params, updateParams } = useLinodeCreateQueryParams();
  const { formState, reset } = useFormContext<CreateLinodeRequest>();

  const onTabChange = (index: number) => {
    // Update the "subtype" query param. (This switches between "Community" and "Account" tabs).
    updateParams({ stackScriptID: undefined, subtype: tabs[index] });
    // Reset the selected image, the selected StackScript, and the StackScript data when changing tabs.
    reset((prev) => ({
      ...prev,
      image: undefined,
      label: '', // @todo use generate here to retain region in label?
      stackscript_data: undefined,
      stackscript_id: undefined,
    }));
  };

  const error = formState.errors.stackscript_id?.message;

  return (
    <Paper>
      <Typography variant="h2">Create From:</Typography>
      {error && (
        <Notice spacingBottom={0} spacingTop={8} text={error} variant="error" />
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
  );
};
