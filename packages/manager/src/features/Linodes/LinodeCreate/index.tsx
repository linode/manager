import { isEmpty } from '@linode/api-v4';
import {
  useCloneLinodeMutation,
  useCreateLinodeMutation,
  useMutateAccountAgreements,
  useProfile,
} from '@linode/queries';
import { CircleProgress, Notice, Stack } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Tab } from 'src/components/Tabs/Tab';
import { TabList } from 'src/components/Tabs/TabList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import {
  getRestrictedResourceText,
  useVMHostMaintenanceEnabled,
} from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import {
  sendLinodeCreateFormInputEvent,
  sendLinodeCreateFormSubmitEvent,
} from 'src/utilities/analytics/formEventAnalytics';
import {
  useIsLinodeCloneFirewallEnabled,
  useIsLinodeInterfacesEnabled,
} from 'src/utilities/linodes';

import { Actions } from './Actions';
import { AdditionalOptions } from './AdditionalOptions/AdditionalOptions';
import { Addons } from './Addons/Addons';
import { Details } from './Details/Details';
import { LinodeCreateError } from './Error';
import { EUAgreement } from './EUAgreement';
import { Firewall } from './Firewall';
import { FirewallAuthorization } from './FirewallAuthorization';
import { Networking } from './Networking/Networking';
import { transformLegacyInterfaceErrorsToLinodeInterfaceErrors } from './Networking/utilities';
import { Plan } from './Plan';
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
  useHandleLinodeCreateAnalyticsFormError,
  useLinodeCreateQueryParams,
} from './utilities';
import { VLAN } from './VLAN/VLAN';
import { VPC } from './VPC/VPC';

import type {
  LinodeCreateFormContext,
  LinodeCreateFormValues,
} from './utilities';

export const LinodeCreate = () => {
  const { params, setParams } = useLinodeCreateQueryParams();
  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { data: profile } = useProfile();
  const { isLinodeCloneFirewallEnabled } = useIsLinodeCloneFirewallEnabled();
  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  const { aclpBetaServices } = useFlags();

  // In Create flow, alerts always default to 'legacy' mode
  const [isAclpAlertsBetaCreateFlow, setIsAclpAlertsBetaCreateFlow] =
    React.useState<boolean>(false);

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm<LinodeCreateFormValues, LinodeCreateFormContext>({
    context: { isLinodeInterfacesEnabled, profile, secureVMNoticesEnabled },
    defaultValues: () =>
      defaultValues(params, queryClient, {
        isLinodeInterfacesEnabled,
        isVMHostMaintenanceEnabled,
      }),
    mode: 'onBlur',
    resolver: getLinodeCreateResolver(params.type, queryClient),
    shouldFocusError: false, // We handle this ourselves with `scrollErrorIntoView`
  });

  const navigate = useNavigate();
  const { mutateAsync: createLinode } = useCreateLinodeMutation();
  const { mutateAsync: cloneLinode } = useCloneLinodeMutation();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const { handleLinodeCreateAnalyticsFormError } =
    useHandleLinodeCreateAnalyticsFormError(params.type ?? 'OS');

  const currentTabIndex = getTabIndex(params.type);

  const { permissions } = usePermissions('account', ['create_linode']);

  const onTabChange = (index: number) => {
    if (index !== currentTabIndex) {
      const newTab = tabs[index];

      const newParams = { type: newTab };

      // Update tab "type" query param. (This changes the selected tab)
      setParams(newParams);

      // Get the default values for the new tab and reset the form
      defaultValues(newParams, queryClient, {
        isLinodeInterfacesEnabled,
        isVMHostMaintenanceEnabled,
      }).then(form.reset);
    }
  };

  const onSubmit: SubmitHandler<LinodeCreateFormValues> = async (values) => {
    const payload = getLinodeCreatePayload(values, {
      isShowingNewNetworkingUI: isLinodeInterfacesEnabled,
      isAclpIntegration: aclpBetaServices?.linode?.alerts,
      isAclpAlertsPreferenceBeta: isAclpAlertsBetaCreateFlow,
    });

    try {
      const linode =
        params.type === 'Clone Linode'
          ? await cloneLinode({
              sourceLinodeId: values.linode?.id ?? -1,
              ...payload,
            })
          : await createLinode(payload);

      navigate({
        to: `/linodes/$linodeId`,
        params: { linodeId: linode.id },
        search: undefined,
      });

      enqueueSnackbar(`Your Linode ${linode.label} is being created.`, {
        variant: 'success',
      });

      captureLinodeCreateAnalyticsEvent({
        queryClient,
        secureVMNoticesEnabled,
        type: params.type ?? 'OS',
        values,
      });

      sendLinodeCreateFormSubmitEvent({
        createType: params.type ?? 'OS',
      });

      if (values.hasSignedEUAgreement) {
        updateAccountAgreements({
          eu_model: true,
          privacy_policy: true,
        });
      }
    } catch (errors) {
      if (isLinodeInterfacesEnabled) {
        transformLegacyInterfaceErrorsToLinodeInterfaceErrors(errors);
      }
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
      handleLinodeCreateAnalyticsFormError(form.formState.errors);
    }
    previousSubmitCount.current = form.formState.submitCount;
  }, [form.formState, handleLinodeCreateAnalyticsFormError]);

  if (form.formState.isLoading) {
    return <CircleProgress />;
  }

  return (
    <FormProvider {...form}>
      <DocumentTitleSegment segment="Create a Linode" />
      <LandingHeader
        docsLabel="Getting Started"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started"
        onDocsClick={() =>
          sendLinodeCreateFormInputEvent({
            createType: params.type ?? 'OS',
            interaction: 'click',
            label: 'Getting Started',
          })
        }
        spacingBottom={4}
        title="Create"
      />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <LinodeCreateError />
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
            {!permissions.create_linode && (
              <Notice
                sx={{ marginBottom: 2 }}
                text={getRestrictedResourceText({
                  action: 'create',
                  isSingular: false,
                  resourceType: 'Linodes',
                })}
                variant="error"
              />
            )}
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
          <Plan />
          <Details />
          {params.type !== 'Clone Linode' && <Security />}
          {!isLinodeInterfacesEnabled && params.type !== 'Clone Linode' && (
            <VPC />
          )}
          {!isLinodeInterfacesEnabled &&
            (params.type !== 'Clone Linode' ||
              isLinodeCloneFirewallEnabled) && <Firewall />}
          {!isLinodeInterfacesEnabled && params.type !== 'Clone Linode' && (
            <VLAN />
          )}
          <UserData />
          {isLinodeInterfacesEnabled && params.type !== 'Clone Linode' && (
            <Networking />
          )}
          <AdditionalOptions
            isAlertsBetaMode={isAclpAlertsBetaCreateFlow}
            onAlertsModeChange={setIsAclpAlertsBetaCreateFlow}
          />
          <Addons />
          <EUAgreement />
          <Summary isAlertsBetaMode={isAclpAlertsBetaCreateFlow} />
          <SMTP />
          {secureVMNoticesEnabled && <FirewallAuthorization />}
          <Actions isAlertsBetaMode={isAclpAlertsBetaCreateFlow} />
        </Stack>
      </form>
    </FormProvider>
  );
};
