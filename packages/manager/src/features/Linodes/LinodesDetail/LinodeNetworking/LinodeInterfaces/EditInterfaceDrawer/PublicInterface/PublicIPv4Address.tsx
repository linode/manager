import {
  Checkbox,
  CloseIcon,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Notice,
  Stack,
  TextField,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  index: number;
  onRemove: (index: number) => void;
}

export const PublicIPv4Address = ({ index, onRemove }: Props) => {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<ModifyLinodeInterfacePayload>();

  return (
    <Stack spacing={2}>
      {errors.public?.ipv4?.addresses?.[index]?.message && (
        <Notice
          text={errors.public?.ipv4?.addresses?.[index]?.message}
          variant="error"
        />
      )}
      <Stack spacing={1}>
        <Stack alignItems="flex-start" direction="row" spacing={0.5}>
          <Controller
            render={({ field, fieldState }) => (
              <TextField
                containerProps={{ sx: { flexGrow: 1 } }}
                errorText={fieldState.error?.message}
                hideLabel
                label={`IPv4 ${index}`}
                noMarginTop
                onChange={field.onChange}
                value={field.value}
              />
            )}
            control={control}
            name={`public.ipv4.addresses.${index}.address`}
          />
          <IconButton onClick={() => onRemove(index)} sx={{ p: 1 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Controller
            render={({ field, fieldState }) => (
              <FormControl sx={{ my: 0 }}>
                <FormControlLabel
                  onChange={(e, checked) => {
                    field.onChange(checked);
                    const numberOfAddresses =
                      getValues().public?.ipv4?.addresses?.length ?? 0;
                    for (let i = 0; i < numberOfAddresses; i++) {
                      if (i !== index) {
                        setValue(`public.ipv4.addresses.${i}.primary`, false);
                      }
                    }
                  }}
                  checked={field.value}
                  control={<Checkbox />}
                  label="Primary"
                  sx={{ pl: 0.5 }}
                />
                {fieldState.error?.message && (
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                )}
              </FormControl>
            )}
            control={control}
            name={`public.ipv4.addresses.${index}.primary`}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
