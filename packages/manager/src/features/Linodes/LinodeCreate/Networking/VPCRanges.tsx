import {
  CloseIcon,
  IconButton,
  LinkButton,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { VPCRangesDescription } from 'src/features/VPCs/components/VPCRangesDescription';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  disabled: boolean;
  interfaceIndex: number;
}

export const VPCRanges = ({ disabled, interfaceIndex }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<LinodeCreateFormValues>();

  const { append, fields, remove } = useFieldArray({
    control,
    name: `linodeInterfaces.${interfaceIndex}.vpc.ipv4.ranges`,
  });

  return (
    <Stack>
      <Stack spacing={1}>
        {errors?.linodeInterfaces?.[interfaceIndex]?.vpc?.ipv4?.ranges
          ?.message && (
          <Notice variant="error">
            {
              errors?.linodeInterfaces?.[interfaceIndex]?.vpc?.ipv4?.ranges
                ?.message
            }
          </Notice>
        )}
        {fields.map((field, index) => (
          <Stack
            alignItems="flex-start"
            direction="row"
            key={field.id}
            spacing={0.5}
          >
            <Controller
              control={control}
              name={`linodeInterfaces.${interfaceIndex}.vpc.ipv4.ranges.${index}.range`}
              render={({ field, fieldState }) => (
                <TextField
                  errorText={fieldState.error?.message}
                  hideLabel
                  inputRef={field.ref}
                  label={`IP Range ${index}`}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  // eslint-disable-next-line sonarjs/no-hardcoded-ip
                  placeholder="10.0.0.0/24"
                  sx={{ minWidth: 290 }}
                  value={field.value}
                />
              )}
            />
            <IconButton
              aria-label={`Remove IP Range ${index}`}
              onClick={() => remove(index)}
              sx={{ padding: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Stack alignItems="center" direction="row" spacing={1}>
        <LinkButton disabled={disabled} onClick={() => append({ range: '' })}>
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
