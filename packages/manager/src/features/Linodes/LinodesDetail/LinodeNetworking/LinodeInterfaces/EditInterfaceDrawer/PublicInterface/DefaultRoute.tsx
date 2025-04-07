import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import type {
  LinodeInterface,
  ModifyLinodeInterfacePayload,
} from '@linode/api-v4';

interface Props {
  linodeInterface: LinodeInterface;
}

export const DefaultRoute = (props: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ModifyLinodeInterfacePayload>();

  return (
    <Stack spacing={1.5}>
      <Typography variant="h3">Default Route</Typography>
      {errors.default_route?.message && (
        <Notice text={errors.default_route?.message} variant="error" />
      )}
      <Stack spacing={0}>
        <Controller
          render={({ field, fieldState }) => (
            <FormControl sx={{ mt: 0, pl: 0.5 }}>
              <FormControlLabel
                checked={field.value ?? false}
                control={<Checkbox />}
                disabled={props.linodeInterface.default_route.ipv4}
                label="Default IPv4 Route"
                onChange={field.onChange}
              />
              {fieldState.error?.message && (
                <FormHelperText
                  sx={(theme) => ({ color: theme.palette.error.dark, ml: 0 })}
                >
                  {fieldState.error?.message}
                </FormHelperText>
              )}
            </FormControl>
          )}
          control={control}
          name="default_route.ipv4"
        />
        <Controller
          render={({ field, fieldState }) => (
            <FormControl sx={{ mt: 0, pl: 0.5 }}>
              <FormControlLabel
                checked={field.value ?? false}
                control={<Checkbox />}
                disabled={props.linodeInterface.default_route.ipv6}
                label="Default IPv6 Route"
                onChange={field.onChange}
              />
              {fieldState.error?.message && (
                <FormHelperText
                  sx={(theme) => ({ color: theme.palette.error.dark, ml: 0 })}
                >
                  {fieldState.error?.message}
                </FormHelperText>
              )}
            </FormControl>
          )}
          control={control}
          name="default_route.ipv6"
        />
      </Stack>
    </Stack>
  );
};
