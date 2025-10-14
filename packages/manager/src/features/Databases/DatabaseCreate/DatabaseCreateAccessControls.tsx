import {
  FormControlLabel,
  Notice,
  Radio,
  RadioGroup,
  styled,
  Typography,
} from '@linode/ui';
import Box from '@mui/material/Box';
import { useState } from 'react';
import * as React from 'react';
import type { ChangeEvent } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { MultipleIPInput } from 'src/components/MultipleIPInput/MultipleIPInput';
import { enforceIPMasks } from 'src/features/Firewalls/FirewallDetail/Rules/FirewallRuleDrawer.utils';
import { ipV6FieldPlaceholder, validateIPs } from 'src/utilities/ipUtils';

import { ACCESS_CONTROLS_IP_VALIDATION_ERROR_TEXT } from '../constants';

import type { DatabaseCreateValues } from './DatabaseCreate';
import type { APIError } from '@linode/api-v4/lib/types';
import type { ExtendedIP } from 'src/utilities/ipUtils';

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
    <Box>
      <Typography variant={variant === 'networking' ? 'h3' : 'h2'}>
        Manage Access
      </Typography>
      <Typography>
        Add IPv6 (recommended) or IPv4 addresses or ranges that should be
        authorized to access this cluster.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/aiven-manage-database#ipv6-support">
          Learn more
        </Link>
        .
      </Typography>
      <Typography mt={1}>
        (Note: You can modify access controls after your database cluster is
        active.)
      </Typography>
      <Box>
        {errors &&
          errors.map((apiError: APIError) => (
            <Notice
              key={apiError.reason}
              text={apiError.reason}
              variant="error"
            />
          ))}
        <Controller
          control={control}
          name="allow_list"
          render={({ field }) => (
            <RadioGroup
              aria-label="type"
              name="type"
              onChange={(_: ChangeEvent, value: AccessOption) => {
                setAccessOption(value);
                if (value === 'none') {
                  field.onChange([{ address: '', error: '' }]);
                }
              }}
              value={accessOption}
            >
              <FormControlLabel
                control={<Radio />}
                data-qa-dbaas-radio="Specific"
                disabled={disabled}
                label="Specific Access (recommended)"
                value="specific"
              />
              <StyledMultipleIPInput
                buttonText={ips.length > 1 ? 'Add Another IP' : 'Add an IP'}
                disabled={accessOption === 'none' || disabled}
                ips={ips}
                onBlur={() => handleIPValidation(ips)}
                onChange={field.onChange}
                placeholder={ipV6FieldPlaceholder}
                title="Allowed IP Addresses or Ranges"
              />
              <FormControlLabel
                control={<Radio />}
                data-qa-dbaas-radio="None"
                disabled={disabled}
                label="No Access (Deny connections from all IP addresses)"
                value="none"
              />
            </RadioGroup>
          )}
        />
      </Box>
    </Box>
  );
};

const StyledMultipleIPInput = styled(MultipleIPInput, {
  label: 'StyledMultipleIPInput',
})(({ theme }) => ({
  marginLeft: theme.spacingFunction(32),
}));
