import { CloseIcon, IconButton, Notice, Radio, TextField } from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  index: number;
  onRemove: (index: number) => void;
}

export const PublicIPv4AddressRow = ({ index, onRemove }: Props) => {
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext<ModifyLinodeInterfacePayload>();

  return (
    <TableRow>
      {errors.public?.ipv4?.addresses?.[index]?.message && (
        <Notice
          text={errors.public?.ipv4?.addresses?.[index]?.message}
          variant="error"
        />
      )}
      <TableCell sx={{ py: 0.5, textAlign: 'center' }}>
        <Controller
          render={({ field, fieldState }) => (
            <Radio
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
            />
          )}
          control={control}
          name={`public.ipv4.addresses.${index}.primary`}
        />
      </TableCell>
      <TableCell sx={{ px: 0 }}>
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
      </TableCell>
      <TableCell>
        <IconButton onClick={() => onRemove(index)} sx={{ p: 1 }}>
          <CloseIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
