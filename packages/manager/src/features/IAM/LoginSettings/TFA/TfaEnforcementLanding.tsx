import { toast } from '@akamai/cds-components/notification-toast';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Icon,
  NotificationBanner,
  Switch,
  Tooltip,
} from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import {
  useAllAccountUsersQuery,
  useAllTfaOptionalUsersQuery,
  useGetTfaEnforcementAccountSettingsQuery,
  useUpdateTfaEnforcementAccountSettingsMutation,
  useUpdateTfaOptionalUsersMutation,
} from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { useFlags } from 'src/hooks/useFlags';

import { useDiscardChanges } from '../../hooks/useDiscardChanges';
import { useIsIAMEnabled } from '../../hooks/useIsIAMEnabled';
import { usePermissions } from '../../hooks/usePermissions';
import { useTfaUserCounts } from '../../hooks/useTfaUserCounts';
import { Box } from '../../Shared/Box/Box';
import { CircleProgress } from '../../Shared/CircleProgress/CircleProgress';
import { IAM_LABEL, TFA_ENFORCEMENT_LINK } from '../../Shared/constants';
import { DiscardChangesModal } from '../../Shared/DiscardChangesModal/DiscardChangesModal';
import { DocsLink } from '../../Shared/DocsLink/DocsLink';
import { DocumentTitleSegment } from '../../Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from '../../Shared/ErrorState/ErrorState';
import { LandingHeader } from '../../Shared/LandingHeader/LandingHeader';
import { Paper } from '../../Shared/Paper/Paper';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';
import { AccountUsersTable } from './AccountUsersTable';
import { SummarySection } from './SummarySection';

import type { APIError, TfaOptionalUser, User } from '@linode/api-v4';

export interface TfaEnforcementFormValues {
  isAcknowledged: boolean;
  tfa_enforced: boolean;
  tfaOptionalUsers: string[];
}

export const TfaEnforcementLanding = () => {
  const navigate = useNavigate();
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();

  const { data: permissions, error: permissionsError } = usePermissions(
    'account',
    ['update_account_settings', 'update_tfa_optional_users']
  );

  const {
    data: tfaSettings,
    error: settingsError,
    isLoading,
  } = useGetTfaEnforcementAccountSettingsQuery();

  const { mutateAsync: updateTfaSettings } =
    useUpdateTfaEnforcementAccountSettingsMutation();

  const { mutateAsync: updateOptionalUsers } =
    useUpdateTfaOptionalUsersMutation();

  const {
    data: tfaOptionalUsers,
    isLoading: isOptionalUsersLoading,
    error: tfaOptionalUsersError,
  } = useAllTfaOptionalUsersQuery();

  const { data: allUsers } = useAllAccountUsersQuery(true);
  const allUsernames = React.useMemo(
    () => (allUsers ?? []).map((user: User) => user.username),
    [allUsers]
  );

  const tfaOptionalUsersOptions = React.useMemo(() => {
    return tfaOptionalUsers?.map((user: TfaOptionalUser) => user.username);
  }, [tfaOptionalUsers]);

  const form = useForm<TfaEnforcementFormValues>({
    // keepDirtyValues ensures that a background refetch of tfaSettings does not
    // silently reset fields the user has already touched (e.g. isAcknowledged).
    resetOptions: { keepDirtyValues: true },
    values: {
      isAcknowledged: false,
      tfa_enforced: tfaSettings?.tfa_enforced ?? false,
      tfaOptionalUsers: tfaOptionalUsersOptions ?? [],
    },
  });

  const {
    control,
    formState: { dirtyFields, errors, isSubmitting, isDirty },
    getValues,
    handleSubmit,
    reset,
    setError,
    watch,
  } = form;

  const isEnforced = watch('tfa_enforced');

  const { totalUsers } = useTfaUserCounts(isEnforced);

  const onSubmit = async (values: TfaEnforcementFormValues) => {
    try {
      const requests: Promise<unknown>[] = [
        updateTfaSettings({ tfa_enforced: values.tfa_enforced }),
      ];
      // Only update optional users when enforcement is on; when off, the list
      // is irrelevant and submitting stale data would be incorrect.
      if (values.tfa_enforced) {
        requests.push(
          updateOptionalUsers({ usernames: values.tfaOptionalUsers })
        );
      } else {
        // Enforcement off: all users become optional.
        requests.push(updateOptionalUsers({ usernames: allUsernames }));
      }
      await Promise.all(requests);
      toast.open({
        text: '2FA enforcement updated',
        type: 'success',
      });
      reset({ ...getValues(), isAcknowledged: false }, { keepDirty: false });
    } catch (err) {
      const apiErrors = err as APIError[];
      setError('root', {
        message: apiErrors[0]?.reason ?? 'An error occurred.',
      });
    }
  };

  const { handleCancelNavigation, handleProceedNavigation, status } =
    useDiscardChanges([
      !!dirtyFields.tfa_enforced,
      !!dirtyFields.tfaOptionalUsers,
    ]);

  const isDisabled =
    !permissions?.update_account_settings &&
    !permissions?.update_tfa_optional_users;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (settingsError || permissionsError) {
    return <ErrorState withPaper />;
  }

  return (
    <>
      <DocumentTitleSegment segment="2FA Enforcement" />
      <LandingHeader>
        <Breadcrumb>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/users' })}
          >
            {IAM_LABEL}
            {flags.iamNewBadge && isIAMEnabled ? <Badge type="new" /> : null}
          </BreadcrumbItem>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/settings' })}
          >
            Settings
          </BreadcrumbItem>
          <BreadcrumbItem>Manage 2FA Enforcement</BreadcrumbItem>
        </Breadcrumb>
        <DocsLink
          href={TFA_ENFORCEMENT_LINK}
          pendoId={IAM_TFA_ENFORCE_PENDO_IDS.docs}
        />
      </LandingHeader>

      {errors.root?.message && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text={errors.root.message}
          type="error"
        />
      )}

      {isDisabled && (
        <NotificationBanner
          style={{ marginBottom: Spacing.S16 }}
          text="You do not have permission to update 2FA enforcement settings."
          type="error"
        />
      )}

      <FormProvider {...form}>
        <DiscardChangesModal
          onClose={handleCancelNavigation}
          onDiscard={handleProceedNavigation}
          open={status === 'blocked'}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: Spacing.S24,
            marginTop: Spacing.S24,
          }}
        >
          <Box>
            <Controller
              control={control}
              name="tfa_enforced"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.enforce2FA}
                  disabled={!permissions?.update_account_settings}
                  onChange={(e) => {
                    field.onChange(e.detail as boolean);
                  }}
                  size="small"
                >
                  Enforce two-factor authentication on this account
                </Switch>
              )}
            />
            <p style={{ paddingLeft: Spacing.S48 }}>
              Turn this on to select which users must use 2FA to log in.
            </p>
          </Box>
          {isEnforced && (
            <Paper padding={Spacing.S24} paddingTop={Spacing.S16}>
              <h3
                style={{
                  font: Typography.Heading.S,
                  marginBottom: Spacing.S8,
                }}
              >
                Manage 2FA Users
              </h3>
              <p>
                Select the users required to log in with 2FA. For all other
                users, 2FA remains optional.
              </p>
              {isOptionalUsersLoading ? (
                <CircleProgress />
              ) : (
                <AccountUsersTable
                  disabled={!permissions?.update_tfa_optional_users}
                  tfaOptionalUsers={tfaOptionalUsersOptions}
                  tfaOptionalUsersError={tfaOptionalUsersError}
                  totalUsers={totalUsers}
                />
              )}
            </Paper>
          )}

          {(isEnforced || (tfaSettings?.tfa_enforced ?? false)) && (
            <SummarySection isEnforced={isEnforced} totalUsers={totalUsers} />
          )}

          <Box direction="row" style={{ justifyContent: 'flex-end' }}>
            <Tooltip
              disabled={!isDisabled}
              tooltipText="You do not have permission to edit 2FA enforcement settings."
            >
              <Button
                data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.updateTFAEnforcement}
                disabled={!isDirty || isDisabled}
                processing={isSubmitting}
                type="submit"
                variant="primary"
              >
                Save Changes
                {isDisabled ? <Icon icon="info-outline" size="m" /> : null}
              </Button>
            </Tooltip>
          </Box>
        </form>
      </FormProvider>
    </>
  );
};
