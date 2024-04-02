import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

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
import { Distributions } from './Tabs/Distributions';
import { Images } from './Tabs/Images';
import { UserData } from './UserData/UserData';
import {
  getLinodeCreatePayload,
  getTabIndex,
  tabs,
  useLinodeCreateQueryParams,
} from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';
import type { SubmitHandler } from 'react-hook-form';

export const LinodeCreatev2 = () => {
  const methods = useForm<CreateLinodeRequest>();
  const history = useHistory();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();

  const onSubmit: SubmitHandler<CreateLinodeRequest> = async (values) => {
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

  const { params, updateParams } = useLinodeCreateQueryParams();

  const currentTabIndex = getTabIndex(params.type);

  return (
    <FormProvider {...methods}>
      <LandingHeader
        docsLabel="Getting Started"
        docsLink="https://www.linode.com/docs/guides/platform/get-started/"
        title="Create"
      />
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Error />
        <Stack gap={3}>
          <Tabs
            index={currentTabIndex}
            onChange={(index) => updateParams({ type: tabs[index] })}
          >
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
              <SafeTabPanel index={1}>Marketplace</SafeTabPanel>
              <SafeTabPanel index={2}>StackScripts</SafeTabPanel>
              <SafeTabPanel index={3}>
                <Images />
              </SafeTabPanel>
              <SafeTabPanel index={4}>Bckups</SafeTabPanel>
              <SafeTabPanel index={5}>Clone Linode</SafeTabPanel>
            </TabPanels>
          </Tabs>
          <Region />
          <Plan />
          <Details />
          <Access />
          <Firewall />
          <UserData />
          <Addons />
          <Summary />
          <Actions />
        </Stack>
      </form>
    </FormProvider>
  );
};
