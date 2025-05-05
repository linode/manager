import {
  CloseIcon,
  IconButton,
  LinkButton,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { VPCRangesDescription } from 'src/features/VPCs/components/VPCRangesDescription';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCRanges = () => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vpc.ipv4.ranges',
  });

  return (
    <Stack spacing={1}>
      {fields.map((field, index) => (
        <Stack
          alignItems="flex-start"
          direction="row"
          key={field.id}
          spacing={1}
        >
          <Controller
            control={control}
            name={`vpc.ipv4.ranges.${index}.range`}
            render={({ field, fieldState }) => (
              <TextField
                containerProps={{ sx: { flexGrow: 1 } }}
                errorText={fieldState.error?.message}
                hideLabel
                label={`IP Range ${index}`}
                noMarginTop
                onChange={field.onChange}
                // eslint-disable-next-line sonarjs/no-hardcoded-ip
                placeholder="10.0.0.0/24"
                value={field.value}
              />
            )}
          />
          <IconButton
            onClick={() => remove(index)}
            sx={{ p: 1 }}
            title="Remove"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      ))}
      <Stack direction="row" spacing={1}>
        <LinkButton onClick={() => append({ range: '' })}>
          Add IPv4 Range
        </LinkButton>
        <TooltipIcon
          status="help"
          sxTooltipIcon={{ p: 0.5 }}
          text={<VPCRangesDescription />}
        />
      </Stack>
    </Stack>
  );
};
