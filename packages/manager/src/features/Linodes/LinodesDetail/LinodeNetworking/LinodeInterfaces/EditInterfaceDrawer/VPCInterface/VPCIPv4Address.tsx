import { Checkbox, FormControlLabel, Stack, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

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

  return (
    <Controller
      control={control}
      name={`vpc.ipv4.addresses.${index}.address`}
      render={({ field, fieldState }) => (
        <Stack>
          <FormControlLabel
            checked={field.value === 'auto'}
            control={<Checkbox />}
            label="Auto-assign a VPC IPv4 Address"
            onChange={(e, checked) =>
              field.onChange(
                checked
                  ? 'auto'
                  : (linodeInterface.vpc?.ipv4.addresses[index].address ?? '')
              )
            }
          />
          {field.value !== 'auto' && (
            <TextField
              errorText={
                fieldState.error?.message ??
                errors.vpc?.ipv4?.addresses?.[index]?.message
              }
              label="VPC IPv4 Address" // @todo update this when we support many VPC IPv4s
              onChange={field.onChange}
              // eslint-disable-next-line sonarjs/no-hardcoded-ip
              placeholder="10.0.0.5"
              value={field.value}
            />
          )}
        </Stack>
      )}
    />
  );
};
