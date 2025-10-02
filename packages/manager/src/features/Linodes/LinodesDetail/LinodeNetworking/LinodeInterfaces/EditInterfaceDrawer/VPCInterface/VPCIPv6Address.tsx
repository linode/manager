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
import {
  VPC_AUTO_ASSIGN_IPV6_TOOLTIP,
  VPC_IPV6_INPUT_HELPER_TEXT,
} from 'src/features/VPCs/constants';

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
                label="Auto-assign VPC IPv6"
                onChange={(e, checked) =>
                  field.onChange(
                    checked ? 'auto' : linodeInterface.vpc?.ipv6?.slaac[0].range
                  )
                }
                sx={{ pl: 0.3, mr: 0 }}
              />
              <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV6_TOOLTIP} />
            </Stack>
            {field.value !== 'auto' && (
              <TextField
                errorText={fieldState.error?.message}
                helperText={VPC_IPV6_INPUT_HELPER_TEXT}
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
