import { useSubnetQuery } from '@linode/queries';
import {
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPC_AUTO_ASSIGN_IPV6_TOOLTIP } from 'src/features/VPCs/constants';
import { generateVPCIPv6InputHelperText } from 'src/features/VPCs/utils';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCIPv6Address = () => {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<CreateInterfaceFormValues>();

  const { vpc } = getValues();
  const { data: subnet } = useSubnetQuery(
    vpc?.vpc_id ?? -1,
    vpc?.subnet_id ?? -1,
    Boolean(vpc?.vpc_id && vpc?.subnet_id)
  );

  const error = errors.vpc?.ipv6?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
      <Controller
        control={control}
        name="vpc.ipv6.slaac.0.range"
        render={({ field, fieldState }) => (
          <Stack rowGap={1}>
            <Stack direction="row">
              <FormControlLabel
                checked={field.value === 'auto'}
                control={<Checkbox />}
                label="Auto-assign VPC IPv6 address"
                onChange={(e, checked) => field.onChange(checked ? 'auto' : '')}
                sx={{ pl: 0.4, mr: 0 }}
              />
              <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV6_TOOLTIP} />
            </Stack>
            {field.value !== 'auto' && (
              <TextField
                errorText={fieldState.error?.message}
                helperText={generateVPCIPv6InputHelperText(
                  subnet?.ipv6?.[0].range ?? ''
                )}
                label="VPC IPv6"
                noMarginTop
                onChange={field.onChange}
                value={field.value}
              />
            )}
          </Stack>
        )}
      />
    </Stack>
  );
};
