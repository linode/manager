import {
  Checkbox,
  FormError,
  NotificationBanner,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { usePermissions } from '../../hooks/usePermissions';
import { IAM_TFA_ENFORCE_PENDO_IDS } from '../constants';

import type { TfaEnforcementFormValues } from './TfaEnforcementLanding';

interface Props {
  isEnforced: boolean;
  totalUsers: number;
}

export const SummarySection = ({ isEnforced, totalUsers }: Props) => {
  const {
    control,
    formState: { dirtyFields },
    watch,
  } = useFormContext<TfaEnforcementFormValues>();
  const { data: permissions } = usePermissions('account', [
    'update_account_settings',
    'update_tfa_optional_users',
  ]);

  const hasSettingsChanged =
    !!dirtyFields.tfa_enforced || !!dirtyFields.tfaOptionalUsers;

  // Watch tfaOptionalUsers to conditionally update the number of optional users in the summary section`
  const tfaOptionalUsers = watch('tfaOptionalUsers');

  const notEnforcedUsersCount = tfaOptionalUsers?.length ?? 0;

  const enforcedUsers = isEnforced
    ? Math.max(0, totalUsers - notEnforcedUsersCount)
    : 0;

  return (
    <>
      <NotificationBanner type="info">
        <>
          {isEnforced ? (
            <p
              style={{
                margin: `${Spacing.S4} 0 ${Spacing.S16}`,
              }}
            >
              <strong>Summary:</strong> 2FA will be enforced for{' '}
              <strong>
                {enforcedUsers} of {totalUsers} users
              </strong>
              {notEnforcedUsersCount === 0 && ' in this account.'}
              {notEnforcedUsersCount > 0 && (
                <>
                  . The remaining{' '}
                  <strong>
                    {notEnforcedUsersCount} user
                    {notEnforcedUsersCount !== 1 ? 's' : ''}
                  </strong>{' '}
                  can still log in using a password only, as 2FA remains
                  optional for them.
                </>
              )}
            </p>
          ) : (
            <p style={{ margin: `0 0 ${Spacing.S16}` }}>
              <strong>Summary:</strong> 2FA is no longer mandatory for this
              account.
            </p>
          )}
          <strong>What happens next?</strong>
          <ul style={{ margin: `${Spacing.S2} 0 0`, paddingLeft: Spacing.S20 }}>
            {isEnforced ? (
              <>
                <li>
                  <strong>Existing Users:</strong> Newly selected users will
                  receive an email with setup instructions. They must configure
                  2FA before they can log in again.
                </li>
                <li>
                  <strong>New Users:</strong> Any new users added to this
                  account going forward are automatically required to set up 2FA
                  before their first login.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Existing Users:</strong> Members who were previously
                  required to use 2FA can now log in using just their password.
                  2FA is now optional for them.
                </li>
                <li>
                  <strong>New Users:</strong> 2FA is completely optional for any
                  new users added to the account going forward.
                </li>
              </>
            )}
          </ul>
        </>
      </NotificationBanner>

      {hasSettingsChanged && (
        <Controller
          control={control}
          name="isAcknowledged"
          render={({ field, fieldState }) => (
            <div>
              <Checkbox
                checked={field.value}
                data-pendo-id={IAM_TFA_ENFORCE_PENDO_IDS.consentChecked}
                disabled={
                  !permissions?.update_account_settings &&
                  !permissions?.update_tfa_optional_users
                }
                onChange={(e) => field.onChange(e.detail as boolean)}
                required
              >
                {isEnforced
                  ? 'I understand that my changes apply immediately upon saving and block newly-selected users from logging in until they configure two-factor authentication.'
                  : 'I understand that my changes will be applied immediately.'}
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
              'You need to confirm that you understand the impact of these changes.',
          }}
        />
      )}
    </>
  );
};
