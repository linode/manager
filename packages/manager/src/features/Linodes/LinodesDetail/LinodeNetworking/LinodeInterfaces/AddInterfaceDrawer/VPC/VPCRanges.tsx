import {
  Box,
  CloseIcon,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCRanges = () => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vpc.ipv4.ranges',
  });

  return (
    <Stack spacing={1}>
      <Typography variant="h3">VPC IP Ranges</Typography>
      <Typography>
        Assign additional IPv4 address ranges that the VPC can use to reach
        services running on this Linode.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/assign-a-compute-instance-to-a-vpc">
          Learn more
        </Link>
        .
      </Typography>
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
                containerProps={{ sx: { flexGrow: 1 }}}
                errorText={fieldState.error?.message}
                hideLabel
                label={`IP Range ${index}`}
                noMarginTop
                onChange={field.onChange}
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
      <Box>
        <LinkButton onClick={() => append({ range: '' })}>Add Range</LinkButton>
      </Box>
    </Stack>
  );
};
