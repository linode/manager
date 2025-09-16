import { useSubnetQuery } from '@linode/queries';
import {
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Code } from 'src/components/Code/Code';
import { generateVPCIPv6InputHelperText } from 'src/features/VPCs/utils';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCIPv6Address = () => {
  const { control, getValues } = useFormContext<CreateInterfaceFormValues>();

  const { vpc } = getValues();
  const { data: subnet } = useSubnetQuery(
    vpc?.vpc_id ?? -1,
    vpc?.subnet_id ?? -1,
    Boolean(vpc?.vpc_id && vpc?.subnet_id)
  );

  return (
    <Controller
      control={control}
      name="vpc.ipv6.slaac.0.range"
      render={({ field, fieldState }) => (
        <Stack rowGap={1}>
          <Stack direction="row">
            <FormControlLabel
              checked={field.value === 'auto'}
              control={<Checkbox />}
              label="Auto-assign a VPC IPv6 Address"
              onChange={(e, checked) => field.onChange(checked ? 'auto' : '')}
              sx={{ pl: 0.4, mr: 0 }}
            />
            <TooltipIcon
              status="info"
              text={
                <Typography component="span">
                  Automatically assign an IPv6 address as a private IP address
                  for this Linode in the VPC. A <Code>/52</Code> IPv6 network
                  prefix is allocated for the VPC.
                </Typography>
              }
            />
          </Stack>
          {field.value !== 'auto' && (
            <TextField
              errorText={fieldState.error?.message}
              helperText={generateVPCIPv6InputHelperText(
                subnet?.ipv6?.[0].range ?? ''
              )}
              label="VPC IPv6 Address"
              noMarginTop
              onChange={field.onChange}
              value={field.value}
            />
          )}
        </Stack>
      )}
    />
  );
};
