import { isEmpty } from '@linode/api-v4';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
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
import { useMutateAccountAgreements } from 'src/queries/account/agreements';
import {
  useCloneLinodeMutation,
  useCreateLinodeMutation,
} from 'src/queries/linodes/linodes';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { Actions } from './Actions';
import { Addons } from './Addons/Addons';
import { Details } from './Details/Details';
import { Error } from './Error';
import { EUAgreement } from './EUAgreement';
import { Firewall } from './Firewall';
import { Plan } from './Plan';
import { Region } from './Region';
import { getLinodeCreateResolver } from './resolvers';
import { Security } from './Security';
import { SMTP } from './SMTP';
import { Summary } from './Summary/Summary';
import { Backups } from './Tabs/Backups/Backups';
import { Clone } from './Tabs/Clone/Clone';
import { Images } from './Tabs/Images';
import { Marketplace } from './Tabs/Marketplace/Marketplace';
import { OperatingSystems } from './Tabs/OperatingSystems';
import { StackScripts } from './Tabs/StackScripts/StackScripts';
import { UserData } from './UserData/UserData';
import {
  captureLinodeCreateAnalyticsEvent,
  defaultValues,
  getLinodeCreatePayload,
  getTabIndex,
  tabs,
  useLinodeCreateQueryParams,
} from './utilities';
import { VLAN } from './VLAN';
import { VPC } from './VPC/VPC';

import type { LinodeCreateFormValues } from './utilities';
import type { SubmitHandler } from 'react-hook-form';

export const LinodeCreatev2 = () => {
  const { params, setParams } = useLinodeCreateQueryParams();

  const queryClient = useQueryClient();

  const form = useForm<LinodeCreateFormValues>({
    defaultValues: () => defaultValues(params, queryClient),
    mode: 'onBlur',
    resolver: getLinodeCreateResolver(params.type, queryClient),
    shouldFocusError: false, // We handle this ourselves with `scrollErrorIntoView`
  });

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();
  const { mutateAsync: cloneLinode } = useCloneLinodeMutation();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const currentTabIndex = getTabIndex(params.type);

  const onTabChange = (index: number) => {
    if (index !== currentTabIndex) {
      const newTab = tabs[index];
      defaultValues({ ...params, type: newTab }, queryClient).then((values) => {
        // Reset the form values
        form.reset(values);
        // Update tab "type" query param. (This changes the selected tab)
        setParams({ type: newTab });
      });
    }
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

      enqueueSnackbar(`Your Linode ${linode.label} is being created.`, {
        variant: 'success',
      });

      captureLinodeCreateAnalyticsEvent({
        queryClient,
        type: params.type ?? 'OS',
        values,
      });

      if (values.hasSignedEUAgreement) {
        updateAccountAgreements({
          eu_model: true,
          privacy_policy: true,
        });
      }
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Error />
        <Stack gap={3}>
          <Tabs index={currentTabIndex} onChange={onTabChange}>
            <TabList>
              <Tab>OS</Tab>
              <Tab>Marketplace</Tab>
              <Tab>StackScripts</Tab>
              <Tab>Images</Tab>
              <Tab>Backups</Tab>
              <Tab>Clone Linode</Tab>
            </TabList>
            <TabPanels>
              <SafeTabPanel index={0}>
                <OperatingSystems />
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
          <EUAgreement />
          <Summary />
          <SMTP />
          <Actions />
        </Stack>
      </form>
    </FormProvider>
  );
};
