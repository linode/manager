import { useSubnetQuery } from '@linode/queries';
import {
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Code } from 'src/components/Code/Code';
import { ErrorMessage } from 'src/components/ErrorMessage';
import { generateVPCIPv6InputHelperText } from 'src/features/VPCs/utils';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  linodeInterface: LinodeInterface;
}

export const VPCIPv6Address = (props: Props) => {
  const { linodeInterface } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const { isDualStackEnabled } = useVPCDualStack();

  const { data: subnet } = useSubnetQuery(
    linodeInterface.vpc?.vpc_id ?? -1,
    linodeInterface.vpc?.subnet_id ?? -1,
    Boolean(
      isDualStackEnabled &&
        linodeInterface.vpc?.vpc_id &&
        linodeInterface.vpc?.subnet_id
    )
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
                onChange={(e, checked) =>
                  field.onChange(
                    checked ? 'auto' : linodeInterface.vpc?.ipv6?.slaac[0].range
                  )
                }
                sx={{ pl: 0.3, mr: 0 }}
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
