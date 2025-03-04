import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
} from '@linode/ui';
import React from 'react';
import { useController } from 'react-hook-form';

import type { CreateInterfaceFormValues } from './utilities';

export const InterfaceType = () => {
  const { field, fieldState } = useController<CreateInterfaceFormValues>({
    name: 'purpose',
  });

  return (
    <FormControl error={Boolean(fieldState.error)} sx={{ marginTop: 0 }}>
      <RadioGroup
        aria-describedby="interface-type-error"
        onChange={field.onChange}
        sx={{ my: `0 !important` }}
        value={field.value ?? null}
      >
        <FormControlLabel control={<Radio />} label="Public" value="public" />
        <FormControlLabel control={<Radio />} label="VPC" value="vpc" />
        <FormControlLabel control={<Radio />} label="VLAN" value="vlan" />
      </RadioGroup>
      {fieldState.error && (
        <FormHelperText
          sx={(theme) => ({
            color: `${theme.palette.error.dark} !important`,
            m: 0,
          })}
          id="interface-type-error"
        >
          {fieldState.error.message}
        </FormHelperText>
      )}
    </FormControl>
  );
};
