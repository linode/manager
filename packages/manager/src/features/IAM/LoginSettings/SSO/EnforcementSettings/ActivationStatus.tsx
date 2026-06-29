import { Icon, Switch, Tooltip } from '@akamai/cds-components/react';
import { Spacing, Typography } from '@akamai/cds-tokens';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { usePermissions } from 'src/features/IAM/hooks/usePermissions';

import { IAM_SSO_ENFORCE_PENDO_IDS } from '../../constants';

import type { EnforcementSettingsFormValues } from './EnforcementSettings';

interface Props {
  isConfigInvalid: boolean;
}

export const ActivationStatus = ({ isConfigInvalid }: Props) => {
  const { control, setValue, watch } =
    useFormContext<EnforcementSettingsFormValues>();

  // Watch SSO enabled state to conditionally disable enforcement toggle and show tooltip
  const isSSOEnabled = watch('ssoEnabled');

  const { data: permissions } = usePermissions('account', [
    'update_idp_config',
  ]);

  return (
    <div>
      <h2
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
          font: Typography.Heading.S,
        }}
      >
        SSO Enforcement Settings
      </h2>
      <Controller
        control={control}
        name="ssoEnabled"
        render={({ field }) => (
          <Switch
            checked={field.value}
            data-pendo-id={IAM_SSO_ENFORCE_PENDO_IDS.enableSSO}
            disabled={
              !permissions?.update_idp_config ||
              (!isSSOEnabled && isConfigInvalid)
            }
            onChange={(e) => {
              field.onChange(e.detail);
              if (!e.detail) {
                setValue('ssoEnforced', false, { shouldDirty: true });
              }
            }}
            size="small"
          >
            <span
              style={{ display: 'flex', alignItems: 'center', gap: Spacing.S6 }}
            >
              Enable SSO
              {!isSSOEnabled && isConfigInvalid && (
                <Tooltip
                  key="sso-enforce-tooltip"
                  style={{ textAlign: 'left', whiteSpace: 'normal' }}
                  tooltipPlacement="bottom"
                  tooltipText="To enable SSO, the IDP configuration needs to have a valid certificate."
                >
                  <Icon icon="info-outline" size="m" />
                </Tooltip>
              )}
            </span>
          </Switch>
        )}
      />
      <p
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S12,
          paddingLeft: Spacing.S48,
          color:
            !permissions?.update_idp_config ||
            (!isSSOEnabled && isConfigInvalid)
              ? 'var(--token-alias-content-text-primary-disabled, light-dark(#a3a3ab, #83838c))'
              : undefined,
        }}
      >
        Activates SSO for this account. It only applies to users you explicitly
        select in SSO-Required Users. All others continue to log in normally
        until you enforce SSO for everyone.
      </p>
      <Controller
        control={control}
        name="ssoEnforced"
        render={({ field }) => (
          <Switch
            checked={field.value}
            data-pendo-id={IAM_SSO_ENFORCE_PENDO_IDS.enforceSSO}
            disabled={!permissions?.update_idp_config || !isSSOEnabled}
            onChange={(e) => field.onChange(e.detail)}
            size="small"
          >
            <span
              style={{ display: 'flex', alignItems: 'center', gap: Spacing.S6 }}
            >
              Enforce SSO
              {!isSSOEnabled && (
                <Tooltip
                  style={{ textAlign: 'left', whiteSpace: 'normal' }}
                  tooltipPlacement="bottom"
                  tooltipText="Enable SSO first to enforce it for all users."
                >
                  <Icon icon="info-outline" size="m" />
                </Tooltip>
              )}
            </span>
          </Switch>
        )}
      />
      <p
        style={{
          marginTop: Spacing.S0,
          marginBottom: Spacing.S0,
          paddingLeft: Spacing.S48,
          color: !isSSOEnabled
            ? 'var(--token-alias-content-text-primary-disabled, light-dark(#a3a3ab, #83838c))'
            : undefined,
        }}
      >
        Requires single-sign on for all users except those listed as SSO
        exceptions. Anyone listed in SSO-Required Users continues to log in
        through SSO without additional changes.
      </p>
    </div>
  );
};
