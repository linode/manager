import { isEmpty } from '@linode/api-v4';
import React, { useEffect, useRef } from 'react';
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
import {
  useCloneLinodeMutation,
  useCreateLinodeMutation,
} from 'src/queries/linodes/linodes';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { Security } from './Security';
import { Actions } from './Actions';
import { Addons } from './Addons/Addons';
import { Details } from './Details/Details';
import { Error } from './Error';
import { Firewall } from './Firewall';
import { Plan } from './Plan';
import { Region } from './Region';
import { linodeCreateResolvers } from './resolvers';
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
  tabs,
  useLinodeCreateQueryParams,
} from './utilities';
import { VLAN } from './VLAN';
import { VPC } from './VPC/VPC';

import type { SubmitHandler } from 'react-hook-form';

export const LinodeCreatev2 = () => {
  const { params, setParams } = useLinodeCreateQueryParams();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<LinodeCreateFormValues>({
    defaultValues,
    mode: 'onBlur',
    resolver: linodeCreateResolvers[params.type ?? 'Distributions'],
    shouldFocusError: false, // We handle this ourselves with `scrollErrorIntoView`
  });

  const history = useHistory();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();
  const { mutateAsync: cloneLinode } = useCloneLinodeMutation();

  const currentTabIndex = getTabIndex(params.type);

  const onTabChange = (index: number) => {
    const newTab = tabs[index];
    // Update tab "type" query param. (This changes the selected tab)
    setParams({ type: newTab });
    // Reset the form values
    form.reset(defaultValuesMap[newTab]);
  };

  const onSubmit: SubmitHandler<LinodeCreateFormValues> = async (values) => {
    const payload = getLinodeCreatePayload(values);

    try {
      const linode =
        params.type === 'Clone Linode'
          ? await cloneLinode({
              sourceLinodeId: values.linode?.id ?? -1,
              ...payload,
            })
          : await createLinode(payload);

      history.push(`/linodes/${linode.id}`);
    } catch (errors) {
      for (const error of errors) {
        if (error.field) {
          form.setError(error.field, { message: error.reason });
        } else {
          form.setError('root', { message: error.reason });
        }
      }
    }
  };

  const previousSubmitCount = useRef<number>(0);

  useEffect(() => {
    if (
      !isEmpty(form.formState.errors) &&
      form.formState.submitCount > previousSubmitCount.current
    ) {
      scrollErrorIntoView(undefined, { behavior: 'smooth' });
    }
    previousSubmitCount.current = form.formState.submitCount;
  }, [form.formState]);

  return (
    <FormProvider {...form}>
      <DocumentTitleSegment segment="Create a Linode" />
      <LandingHeader
        docsLabel="Getting Started"
        docsLink="https://www.linode.com/docs/guides/platform/get-started/"
        title="Create"
      />
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
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
          {params.type !== 'Clone Linode' && <Security />}
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
