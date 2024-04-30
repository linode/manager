import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Stack } from 'src/components/Stack';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { useCreateLinodeMutation } from 'src/queries/linodes/linodes';

import { Access } from './Access';
import { Actions } from './Actions';
import { Addons } from './Addons/Addons';
import { Details } from './Details/Details';
import { Error } from './Error';
import { Firewall } from './Firewall';
import { Plan } from './Plan';
import { Region } from './Region';
import { Summary } from './Summary';
import { Backups } from './Tabs/Backups/Backups';
import { Clone } from './Tabs/Clone/Clone';
import { Distributions } from './Tabs/Distributions';
import { Images } from './Tabs/Images';
import { Marketplace } from './Tabs/Marketplace/Marketplace';
import { StackScripts } from './Tabs/StackScripts/StackScripts';
import { UserData } from './UserData/UserData';
import {
  LinodeCreateFormValues,
  defaultValues,
  defaultValuesMap,
  getLinodeCreatePayload,
  getTabIndex,
  resolver,
  tabs,
  useLinodeCreateQueryParams,
} from './utilities';
import { VLAN } from './VLAN';
import { VPC } from './VPC/VPC';

import type { SubmitHandler } from 'react-hook-form';

export const LinodeCreatev2 = () => {
  const methods = useForm<LinodeCreateFormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver,
  });

  const history = useHistory();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();

  const onSubmit: SubmitHandler<LinodeCreateFormValues> = async (values) => {
    const payload = getLinodeCreatePayload(values);
    alert(JSON.stringify(payload, null, 2));
    try {
      const linode = await createLinode(payload);

      history.push(`/linodes/${linode.id}`);
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          methods.setError(error.field, { message: error.reason });
        } else {
          methods.setError('root', { message: error.reason });
        }
      }
    }
  };

  const { params, setParams } = useLinodeCreateQueryParams();

  const currentTabIndex = getTabIndex(params.type);

  const onTabChange = (index: number) => {
    const newTab = tabs[index];
    // Update tab "type" query param. (This changes the selected tab)
    setParams({ type: newTab });
    // Reset the form values
    methods.reset(defaultValuesMap[newTab]);
  };

  return (
    <FormProvider {...methods}>
      <DocumentTitleSegment segment="Create a Linode" />
      <LandingHeader
        docsLabel="Getting Started"
        docsLink="https://www.linode.com/docs/guides/platform/get-started/"
        title="Create"
      />
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Error />
        <Stack gap={3}>
          <Tabs index={currentTabIndex} onChange={onTabChange}>
            <TabList>
              <Tab>Distributions</Tab>
              <Tab>Marketplace</Tab>
              <Tab>StackScripts</Tab>
              <Tab>Images</Tab>
              <Tab>Backups</Tab>
              <Tab>Clone Linode</Tab>
            </TabList>
            <TabPanels>
              <SafeTabPanel index={0}>
                <Distributions />
              </SafeTabPanel>
              <SafeTabPanel index={1}>
                <Marketplace />
              </SafeTabPanel>
              <SafeTabPanel index={2}>
                <StackScripts />
              </SafeTabPanel>
              <SafeTabPanel index={3}>
                <Images />
              </SafeTabPanel>
              <SafeTabPanel index={4}>
                <Backups />
              </SafeTabPanel>
              <SafeTabPanel index={5}>
                <Clone />
              </SafeTabPanel>
            </TabPanels>
          </Tabs>
          {params.type !== 'Backups' && <Region />}
          <Plan />
          <Details />
          {params.type !== 'Clone Linode' && <Access />}
          <VPC />
          <Firewall />
          {params.type !== 'Clone Linode' && <VLAN />}
          <UserData />
          <Addons />
          <Summary />
          <Actions />
        </Stack>
      </form>
    </FormProvider>
  );
};
