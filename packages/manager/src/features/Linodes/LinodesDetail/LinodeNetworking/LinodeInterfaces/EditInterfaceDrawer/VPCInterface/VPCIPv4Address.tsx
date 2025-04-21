import {
  Checkbox,
  FormControlLabel,
  Notice,
  Stack,
  TextField,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { ErrorMessage } from 'src/components/ErrorMessage';
import { VPCPublicIPLabel } from 'src/features/VPCs/components/VPCPublicIPLabel';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  index: number;
  linodeInterface: LinodeInterface;
}

export const VPCIPv4Address = (props: Props) => {
  const { index, linodeInterface } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  const error = errors.vpc?.ipv4?.addresses?.[index]?.message;

  return (
    <Stack spacing={1}>
      {error && (
        <Notice variant="error">
          <ErrorMessage message={error} />
        </Notice>
      )}
      <Stack spacing={1.5}>
        <Controller
          control={control}
          name={`vpc.ipv4.addresses.${index}.address`}
          render={({ field, fieldState }) => (
            <Stack rowGap={1}>
              <FormControlLabel
                checked={field.value === 'auto'}
                control={<Checkbox />}
                label="Auto-assign a VPC IPv4 Address"
                onChange={(e, checked) =>
                  field.onChange(
                    checked
                      ? 'auto'
                      : (linodeInterface.vpc?.ipv4.addresses[index].address ??
                          '')
                  )
                }
                sx={{ pl: 0.3 }}
              />
              {field.value !== 'auto' && (
                <TextField
                  errorText={fieldState.error?.message}
                  label="VPC IPv4 Address"
                  noMarginTop
                  onChange={field.onChange}
                  // eslint-disable-next-line sonarjs/no-hardcoded-ip
                  placeholder="10.0.0.5"
                  value={field.value}
                />
              )}
            </Stack>
          )}
        />
        <Controller
          control={control}
          name={`vpc.ipv4.addresses.${index}.nat_1_1_address`}
          render={({ field }) => (
            <FormControlLabel
              checked={Boolean(field.value)}
              control={<Checkbox />}
              label={<VPCPublicIPLabel />}
              onChange={(e, checked) => field.onChange(checked ? 'auto' : null)}
              sx={{ ml: '-8px !important' }}
            />
          )}
        />
      </Stack>
    </Stack>
  );
};
