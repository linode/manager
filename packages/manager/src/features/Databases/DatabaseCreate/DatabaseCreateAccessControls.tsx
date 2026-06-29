import {
  NotificationBanner,
  RadioButton,
  RadioGroup,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { ipV6FieldPlaceholder, validateIPs } from '@akamai/compute-ui-core/api';
import { styled } from '@linode/ui';
import { useState } from 'react';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';

import { ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT } from '../constants';
import { enforceIPMasks } from '../utilities';

import type { DatabaseCreateValues } from './DatabaseCreate';
import type { ExtendedIP } from '@akamai/compute-ui-core/api';
import type { APIError } from '@linode/api-v4/lib/types';

export type AccessOption = 'none' | 'specific';
export type AccessVariant = 'networking' | 'standard';

export interface AccessProps {
  disabled?: boolean;
  errors?: APIError[];
  variant?: AccessVariant;
}

export const DatabaseCreateAccessControls = (props: AccessProps) => {
  const { disabled = false, errors, variant = 'standard' } = props;
  const [accessOption, setAccessOption] = useState<AccessOption>('specific');

  const handleIPValidation = (ips: ExtendedIP[]) => {
    const validatedIps = validateIPs(ips, {
      allowEmptyAddress: true,
      errorMessage: ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT,
    });
    const validatedIpsWithMasks = enforceIPMasks(validatedIps);
    if (validatedIpsWithMasks.some((ip) => ip.error)) {
      setValue('allow_list', validatedIpsWithMasks);
    } else {
      setValue(
        'allow_list',
        validatedIpsWithMasks.map((ip) => {
          delete ip.error;
          return {
            ...ip,
          };
        })
      );
    }
  };

  const { control, setValue } = useFormContext<DatabaseCreateValues>();
  const ips = useWatch({ control, name: 'allow_list' });

  return (
    <div>
      {variant === 'standard' ? (
        <h3 style={{ margin: 0 }}>Manage Access</h3>
      ) : (
        <h4 style={{ margin: 0 }}>Manage Access</h4>
      )}
      <p style={{ margin: 0 }}>
        Add IPv6 (recommended) or IPv4 addresses or ranges that should be
        authorized to access this cluster.{' '}
        <a
          aria-label="Learn more - link opens in a new tab"
          data-testid="external-link"
          href="https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#ipv6-support"
          rel="noopener noreferrer"
          target="_blank"
        >
          Learn more
        </a>
        .
      </p>
      <p style={{ marginBottom: Spacing.S8, marginTop: Spacing.S8 }}>
        (Note: You can modify access controls after your database cluster is
        active.)
      </p>
      <div>
        {errors &&
          errors.map((apiError: APIError) => (
            <NotificationBanner
              key={apiError.reason}
              style={{ marginBottom: Spacing.S16 }}
              text={apiError.reason}
              type="error"
            />
          ))}
        <Controller
          control={control}
          name="allow_list"
          render={({ field }) => (
            <RadioGroup
              aria-label="type"
              name="type"
              onChange={(e: CustomEvent) => {
                const value = e.detail.value as AccessOption;
                setAccessOption(value);
                if (value === 'none') {
                  field.onChange([{ address: '', error: '' }]);
                }
              }}
              value={accessOption}
            >
              <RadioButton
                data-qa-dbaas-radio="Specific"
                disabled={disabled}
                id="specific"
                value="specific"
              />
              <label htmlFor="specific">Specific Access (recommended)</label>
              <StyledMultipleIPInput
                buttonText={ips.length > 1 ? 'Add Another IP' : 'Add an IP'}
                disabled={accessOption === 'none' || disabled}
                ips={ips}
                onBlur={() => handleIPValidation(ips)}
                onChange={field.onChange}
                placeholder={ipV6FieldPlaceholder}
                title="Allowed IP Addresses or Ranges"
              />
              <RadioButton
                data-qa-dbaas-radio="None"
                disabled={disabled}
                id="none"
                value="none"
              />
              <label htmlFor="none">
                No Access (Deny connections from all IP addresses)
              </label>
            </RadioGroup>
          )}
        />
      </div>
    </div>
  );
};

const StyledMultipleIPInput = styled(MultipleIPInput, {
  label: 'StyledMultipleIPInput',
})(({ theme }) => ({
  marginLeft: theme.spacingFunction(32),
}));
