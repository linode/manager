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
import { VPC_AUTO_ASSIGN_IPV4_TOOLTIP } from 'src/features/VPCs/constants';

import type { CreateInterfaceFormValues } from '../utilities';

interface Props {
  index: number;
}

export const VPCIPv4Address = (props: Props) => {
  const { index } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateInterfaceFormValues>();

  const error = errors.vpc?.ipv4?.addresses?.[index]?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
      <Controller
        control={control}
        name={`vpc.ipv4.addresses.${index}.address`}
        render={({ field, fieldState }) => (
          <Stack rowGap={1}>
            <Stack direction="row">
              <FormControlLabel
                checked={field.value === 'auto'}
                control={<Checkbox />}
                label="Auto-assign VPC IPv4"
                onChange={(e, checked) => field.onChange(checked ? 'auto' : '')}
                sx={{ pl: 0.4, mr: 0 }}
              />
              <TooltipIcon status="info" text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP} />
            </Stack>
            {field.value !== 'auto' && (
              <TextField
                containerProps={{ sx: { mb: 1.5, mt: 1 } }}
                errorText={fieldState.error?.message}
                label="VPC IPv4"
                noMarginTop
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                value={field.value}
              />
            )}
          </Stack>
        )}
      />
    </Stack>
  );
};
