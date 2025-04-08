import {
  IconButton,
  Notice,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';

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
              render={({ field, fieldState }) => (
                <TextField
                  errorText={fieldState.error?.message}
                  hideLabel
                  label={`IP Range ${index}`}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  placeholder="10.0.0.0/24"
                  sx={{ minWidth: 290 }}
                  value={field.value}
                />
              )}
              control={control}
              name={`linodeInterfaces.${interfaceIndex}.vpc.ipv4.ranges.${index}.range`}
            />
            <IconButton
              aria-label={`Remove IP Range ${index}`}
              onClick={() => remove(index)}
              sx={{ padding: 0.75 }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Stack alignItems="center" direction="row" spacing={1}>
        <LinkButton isDisabled={disabled} onClick={() => append({ range: '' })}>
          Add IPv4 Range
        </LinkButton>
        <TooltipIcon
          text={
            <Typography>
              Assign additional IPv4 address ranges that the VPC can use to
              reach services running on this Linode.{' '}
              <Link to="https://techdocs.akamai.com/cloud-computing/docs/assign-a-compute-instance-to-a-vpc">
                Learn more
              </Link>
              .
            </Typography>
          }
          status="help"
          sxTooltipIcon={{ p: 0.5 }}
        />
      </Stack>
    </Stack>
  );
};
