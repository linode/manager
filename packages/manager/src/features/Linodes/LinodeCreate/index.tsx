import { isEmpty } from '@linode/api-v4';
import {
  useCloneLinodeMutation,
  useCreateLinodeMutation,
  useMutateAccountAgreements,
  useProfile,
} from '@linode/queries';
import { CircleProgress, Notice, Stack, Typography } from '@linode/ui';
import { scrollErrorIntoView } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React, { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

import { DismissibleBanner } from 'src/components/DismissibleBanner/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import {
  getRestrictedResourceText,
  useVMHostMaintenanceEnabled,
} from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import {
  getLinodeCreateType,
  useGetLinodeCreateType,
} from 'src/features/Linodes/LinodeCreate/Tabs/utils/useGetLinodeCreateType';
import { useFlags } from 'src/hooks/useFlags';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { useTabs } from 'src/hooks/useTabs';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';
import {
  sendLinodeCreateFormInputEvent,
  sendLinodeCreateFormSubmitEvent,
} from 'src/utilities/analytics/formEventAnalytics';
import {
  useIsLinodeCloneFirewallEnabled,
  useIsLinodeInterfacesEnabled,
} from 'src/utilities/linodes';
import { sanitizeHTML } from 'src/utilities/sanitizeHTML';

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
import { UserData } from './UserData/UserData';
import {
  captureLinodeCreateAnalyticsEvent,
  defaultValues,
  EMPTY_ACLP_ALERTS,
  getLinodeCreatePayload,
  useHandleLinodeCreateAnalyticsFormError,
} from './utilities';
import { VLAN } from './VLAN/VLAN';
import { VPC } from './VPC/VPC';

import type {
  LinodeCreateFormContext,
  LinodeCreateFormValues,
} from './utilities';

export const LinodeCreate = () => {
  const location = useLocation();
  const search = useSearch({
    from: '/linodes/create',
  });
  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const { isLinodeInterfacesEnabled } = useIsLinodeInterfacesEnabled();
  const { data: profile } = useProfile();
  const { isLinodeCloneFirewallEnabled } = useIsLinodeCloneFirewallEnabled();
  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();
  const linodeCreateType = useGetLinodeCreateType();

  const { aclpServices, linodeCreateBanner } = useFlags();

  // In Create flow, alerts always default to 'legacy' mode
  const [isAclpAlertsModeCreateFlow, setIsAclpAlertsModeCreateFlow] =
    React.useState<boolean>(false);

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { isDualStackEnabled } = useVPCDualStack();

  const form = useForm<LinodeCreateFormValues, LinodeCreateFormContext>({
    context: { isLinodeInterfacesEnabled, profile, secureVMNoticesEnabled },
    defaultValues: () =>
      defaultValues(linodeCreateType, search, queryClient, {
        isLinodeInterfacesEnabled,
        isVMHostMaintenanceEnabled,
      }),
    mode: 'onBlur',
    resolver: getLinodeCreateResolver(linodeCreateType, queryClient),
    shouldFocusError: false, // We handle this ourselves with `scrollErrorIntoView`
  });

  const handleAlertsModeChange = React.useCallback(
    (isAclpMode: boolean) => {
      // Reset alerts to empty defaults when entering ACLP mode so that
      // previously selected alerts don't persist across mode toggles. While in
      // legacy mode the alerts field is ignored by the payload builder, so
      // there is no need to clear it when switching back to legacy mode.
      if (isAclpMode) {
        form.setValue('alerts', EMPTY_ACLP_ALERTS);
      }
      setIsAclpAlertsModeCreateFlow(isAclpMode);
    },
    [form]
  );

  const navigate = useNavigate();
  const { mutateAsync: createLinode } = useCreateLinodeMutation();
  const { mutateAsync: cloneLinode } = useCloneLinodeMutation();
  const { mutateAsync: updateAccountAgreements } = useMutateAccountAgreements();

  const { handleLinodeCreateAnalyticsFormError } =
    useHandleLinodeCreateAnalyticsFormError(linodeCreateType ?? 'OS');

  const { data: permissions } = usePermissions('account', ['create_linode']);

  const { tabs, handleTabChange, tabIndex } = useTabs([
    {
      title: 'OS',
      to: '/linodes/create/os',
    },
    {
      title: 'Quick Deploy Apps',
      to: '/linodes/create/marketplace',
    },
    {
      title: 'StackScripts',
      to: '/linodes/create/stackscripts',
    },
    {
      title: 'Images',
      to: '/linodes/create/images',
    },
    {
      title: 'Backups',
      to: '/linodes/create/backups',
    },
    {
      title: 'Clone Linode',
      to: '/linodes/create/clone',
    },
  ]);

  const onTabChange = (index: number) => {
    handleTabChange(index);

    if (index !== tabIndex) {
      const newTab = tabs[index];
      const newLinodeCreateType = getLinodeCreateType(newTab.to);
      // Get the default values for the new tab and reset the form
      defaultValues(newLinodeCreateType, search, queryClient, {
        isLinodeInterfacesEnabled,
        isVMHostMaintenanceEnabled,
      }).then(form.reset);
    }
  };

  const onSubmit: SubmitHandler<LinodeCreateFormValues> = async (values) => {
    const payload = getLinodeCreatePayload(values, {
      isDualStackEnabled,
      isShowingNewNetworkingUI: isLinodeInterfacesEnabled,
      isAclpAlertsEnabled: aclpServices?.linode?.alerts?.enabled,
      isAclpAlertsMode: isAclpAlertsModeCreateFlow,
    });

    try {
      const linode =
        linodeCreateType === 'Clone Linode'
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
        type: linodeCreateType ?? 'OS',
        values,
      });

      sendLinodeCreateFormSubmitEvent({
        createType: linodeCreateType ?? 'OS',
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

  if (location.pathname === '/linodes/create') {
    navigate({
      to: '/linodes/create/os',
    });
  }

  return (
    <FormProvider {...form}>
      <DocumentTitleSegment segment="Create a Linode" />
      {linodeCreateBanner?.enabled && (
        <DismissibleBanner
          preferenceKey="linode-create-banner"
          spacingBottom={8}
          variant="info"
          {...(linodeCreateBanner?.enabled && {
            'data-pendo-id': linodeCreateBanner?.pendo_id,
          })}
        >
          <Typography
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML({
                sanitizingTier: 'flexible',
                allowMoreAttrs: ['target'],
                text: linodeCreateBanner?.message ?? '',
              }),
            }}
          />
        </DismissibleBanner>
      )}
      <LandingHeader
        breadcrumbProps={{
          labelTitle: linodeCreateType,
        }}
        docsLabel="Getting Started"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started"
        onDocsClick={() =>
          sendLinodeCreateFormInputEvent({
            createType: linodeCreateType ?? 'OS',
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
          <Tabs index={tabIndex} onChange={onTabChange}>
            <TanStackTabLinkList tabs={tabs} />
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
              <Outlet />
            </TabPanels>
          </Tabs>
          <Plan />
          <Details />
          {linodeCreateType !== 'Clone Linode' && <Security />}
          {!isLinodeInterfacesEnabled &&
            linodeCreateType !== 'Clone Linode' && <VPC />}
          {!isLinodeInterfacesEnabled &&
            (linodeCreateType !== 'Clone Linode' ||
              isLinodeCloneFirewallEnabled) && <Firewall />}
          {!isLinodeInterfacesEnabled &&
            linodeCreateType !== 'Clone Linode' && <VLAN />}
          <UserData />
          {isLinodeInterfacesEnabled && linodeCreateType !== 'Clone Linode' && (
            <Networking />
          )}
          <AdditionalOptions
            isAclpAlertsMode={isAclpAlertsModeCreateFlow}
            onAlertsModeChange={handleAlertsModeChange}
          />
          <Addons />
          <EUAgreement />
          <Summary isAclpAlertsMode={isAclpAlertsModeCreateFlow} />
          <SMTP />
          {secureVMNoticesEnabled && <FirewallAuthorization />}
          <Actions isAclpAlertsMode={isAclpAlertsModeCreateFlow} />
        </Stack>
      </form>
    </FormProvider>
  );
};
