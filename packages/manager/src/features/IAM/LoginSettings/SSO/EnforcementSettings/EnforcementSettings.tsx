import { toast } from '@akamai/cds-components/notification-toast';
import {
  Button,
  Checkbox,
  FormError,
  Icon,
  NotificationBanner,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import {
  useGetIdpConfigQuery,
  useGetIdpConfigsQuery,
  useGetIdpConfigUsersExcludedQuery,
  useGetIdpConfigUsersIncludedQuery,
  useUpdateIdpConfigMutation,
  useUpdateIdpConfigUsersExcludedMutation,
  useUpdateIdpConfigUsersIncludedMutation,
} from '@linode/queries';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { CircleProgress } from 'src/features/IAM/Shared/CircleProgress/CircleProgress';
import { Divider } from 'src/features/IAM/Shared/Divider/Divider';
import { ErrorState } from 'src/features/IAM/Shared/ErrorState/ErrorState';
import { Paper } from 'src/features/IAM/Shared/Paper/Paper';

import { Box } from '../../../Shared/Box/Box';
import { IAM_SSO_ENFORCE_PENDO_IDS } from '../../constants';
import { getSummaryStatus, hasNoValidCertificates } from '../utilities';
import { ActivationStatus } from './ActivationStatus';
import { ExcludedUsersPanel } from './ExcludedUsersPanel';
import { IncludedUsersPanel } from './IncludedUsersPanel';

import type { SummaryStatusConfig } from '../utilities';
import type { APIError, IdpUser } from '@linode/api-v4/lib/types';

export interface EnforcementSettingsFormValues {
  excludedUsers: string[];
  includedUsers: string[];
  isAcknowledged: boolean;
  ssoEnabled: boolean;
  ssoEnforced: boolean;
}

export const EnforcementSettings = () => {
  const { data: permissions, error: permissionsError } = usePermissions(
    'account',
    ['update_idp_config']
  );
  // TODO: check whether we need to fetch all IDP configs to find the relevant one
  // or if we can get the euuid from IDP configuration tab and pass it down
  const {
    data: idpConfigs,
    error: idpConfigsError,
    isLoading: idpConfigsLoading,
  } = useGetIdpConfigsQuery();

  const euuid =
    idpConfigs && idpConfigs?.results > 0 ? idpConfigs.data[0].id : null;

  const {
    data: idpConfig,
    error,
    isLoading,
  } = useGetIdpConfigQuery(euuid ?? '');

  // We need to disabled Activation Status toggles if there are no valid certificates ans sso is disabled.
  // If sso is enabled, no action needed.
  const isConfigInvalid = idpConfig ? hasNoValidCertificates(idpConfig) : false;

  const {
    mutateAsync: updateActivationStatus,
    isPending: isActivationStatusPending,
  } = useUpdateIdpConfigMutation(euuid ?? '');

  const {
    mutateAsync: updateIncludedUsers,
    isPending: isIncludedUsersPending,
  } = useUpdateIdpConfigUsersIncludedMutation(euuid ?? '');

  const {
    mutateAsync: updateExcludedUsers,
    isPending: isExcludedUsersPending,
  } = useUpdateIdpConfigUsersExcludedMutation(euuid ?? '');

  const {
    data: includedUsers,
    error: includedUsersError,
    isLoading: includedUsersLoading,
  } = useGetIdpConfigUsersIncludedQuery({
    euuid: euuid ?? '',
  });

  const includedUsersOptions = React.useMemo(() => {
    return includedUsers?.data.map((user: IdpUser) => user.label);
  }, [includedUsers]);

  const {
    data: excludedUsers,
    error: excludedUsersError,
    isLoading: excludedUsersLoading,
  } = useGetIdpConfigUsersExcludedQuery({
    euuid: euuid ?? '',
  });

  const excludedUsersOptions = React.useMemo(() => {
    return excludedUsers?.data.map((user: IdpUser) => user.label);
  }, [excludedUsers]);

  const form = useForm<EnforcementSettingsFormValues>({
    values: {
      ssoEnabled: idpConfig?.enabled ?? false,
      ssoEnforced: idpConfig?.enforce ?? false,
      isAcknowledged: false,
      includedUsers: includedUsersOptions ?? [],
      excludedUsers: excludedUsersOptions ?? [],
    },
  });

  const {
    formState: { isDirty, dirtyFields, errors, isSubmitting },
    handleSubmit,
    control,
    reset,
    setError,
    getValues,
    watch,
  } = form;

  const formSummaryConfig: SummaryStatusConfig = {
    enabled: watch('ssoEnabled'),
    enforce: watch('ssoEnforced'),
    included_users_count: watch('includedUsers').length,
    excluded_users_count: watch('excludedUsers').length,
  };

  // Determine if Activation Status has been modified to conditionally
  // require acknowledgment and call the right endpoint on submit
  const isActivationStatusDirty = !!(
    dirtyFields.ssoEnabled || dirtyFields.ssoEnforced
  );

  // Determine if Included Users has been modified to conditionally
  // call the right endpoint on submit
  const isIncludedUsersDirty = !!dirtyFields.includedUsers;

  // Determine if Excluded Users has been modified to conditionally
  // call the right endpoint on submit
  const isExcludedUsersDirty = !!dirtyFields.excludedUsers;

  const onSubmit = async (values: EnforcementSettingsFormValues) => {
    const mutations: Promise<unknown>[] = [];

    // Only update activation status if it has been modified
    if (isActivationStatusDirty) {
      mutations.push(
        updateActivationStatus({
          enabled: values.ssoEnabled,
          enforce: values.ssoEnforced,
        })
      );
    }

    // Only update included users if it has been modified
    if (isIncludedUsersDirty) {
      mutations.push(updateIncludedUsers({ usernames: values.includedUsers }));
    }

    // Only update excluded users if it has been modified
    if (isExcludedUsersDirty) {
      mutations.push(updateExcludedUsers({ usernames: values.excludedUsers }));
    }

    try {
      await Promise.all(mutations);
      toast.open({
        text: 'SSO settings updated successfully.',
        type: 'success',
      });
      reset({ ...getValues(), isAcknowledged: false }, { keepDirty: false });
    } catch (errors) {
      const apiErrors = errors as APIError[];
      setError('root', { message: apiErrors[0].reason });
    }
  };

  if (
    isLoading ||
    idpConfigsLoading ||
    includedUsersLoading ||
    excludedUsersLoading
  ) {
    return <CircleProgress />;
  }

  if (
    error ||
    idpConfigsError ||
    includedUsersError ||
    excludedUsersError ||
    permissionsError
  ) {
    return <ErrorState />;
  }

  return (
    <FormProvider {...form}>
      {errors.root?.message && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={errors.root?.message}
          type="error"
        />
      )}
      {!permissions?.update_idp_config && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text="You do not have permissions to update SSO enforcement settings."
          type="warning"
        />
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ gap: Spacing.S24, display: 'flex', flexDirection: 'column' }}
      >
        <Paper padding={Spacing.S24} paddingTop={Spacing.S24}>
          <ActivationStatus isConfigInvalid={isConfigInvalid} />
          <Divider spacingBottom={Spacing.S20} spacingTop={Spacing.S20} />
          <IncludedUsersPanel includedUsers={includedUsersOptions} />
          <Divider spacingBottom={Spacing.S20} spacingTop={Spacing.S20} />
          <ExcludedUsersPanel excludedUsers={excludedUsersOptions} />
        </Paper>

        <NotificationBanner type="info">
          <>
            <strong>Summary:</strong>{' '}
            {getSummaryStatus(formSummaryConfig, true)}
          </>
        </NotificationBanner>

        {isActivationStatusDirty && (
          <Controller
            control={control}
            name="isAcknowledged"
            render={({ field, fieldState }) => (
              <div>
                <Checkbox
                  checked={field.value}
                  data-pendo-id={IAM_SSO_ENFORCE_PENDO_IDS.consentChecked}
                  onChange={(e) => field.onChange(e.detail as boolean)}
                  required
                >
                  I understand that my changes will be applied immediately and
                  may affect the way users log in.
                </Checkbox>
                {Boolean(fieldState.error?.message) && (
                  <FormError slot="error" style={{ paddingLeft: Spacing.S32 }}>
                    {fieldState.error?.message}
                  </FormError>
                )}
              </div>
            )}
            rules={{
              validate: (value) =>
                value ||
                'You need to confirm that you understand the impact of applied changes.',
            }}
          />
        )}

        <Box direction="row" style={{ justifyContent: 'flex-end' }}>
          <Tooltip
            disabled={permissions?.update_idp_config}
            tooltipPlacement="bottom"
            tooltipText="You do not have permissions to update SSO enforcement settings."
          >
            <Button
              data-pendo-id={IAM_SSO_ENFORCE_PENDO_IDS.updateSSOEnforcement}
              disabled={!isDirty || !permissions?.update_idp_config}
              processing={
                isSubmitting ||
                isActivationStatusPending ||
                isIncludedUsersPending ||
                isExcludedUsersPending
              }
              type="submit"
              variant="primary"
            >
              Save Changes
              {!permissions?.update_idp_config && (
                <Icon icon="info-outline" size="s" />
              )}
            </Button>
          </Tooltip>
        </Box>
      </form>
    </FormProvider>
  );
};
