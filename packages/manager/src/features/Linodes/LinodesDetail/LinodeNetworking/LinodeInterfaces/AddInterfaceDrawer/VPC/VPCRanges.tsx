import { useVPCQuery } from '@linode/queries';
import {
  CloseIcon,
  IconButton,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import { LinkButton } from '@linode/ui';
import React from 'react';
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import {
  DualStackVPCRangesDescription,
  VPCRangesDescription,
} from 'src/features/VPCs/components/VPCRangesDescription';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';

import type { CreateInterfaceFormValues } from '../utilities';

export const VPCRanges = () => {
  const { control, setFocus, setValue } =
    useFormContext<CreateInterfaceFormValues>();

  const vpcId = useWatch({
    control,
    name: 'vpc.vpc_id',
  });
  const { isDualStackEnabled } = useVPCDualStack();
  const { data: vpc } = useVPCQuery(vpcId, Boolean(vpcId));
  const isDualStackVPC = isDualStackEnabled && Boolean(vpc?.ipv6);

  const {
    fields: iPv4Fields,
    remove: removeIPv4,
    append: appendIPv4,
  } = useFieldArray({
    control,
    name: 'vpc.ipv4.ranges',
  });

  const {
    fields: iPv6Fields,
    remove: removeIPv6,
    append: appendIPv6,
  } = useFieldArray({
    control,
    name: 'vpc.ipv6.ranges',
  });

  if (!isDualStackVPC) {
    setValue('vpc.ipv6', undefined);
  }

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1}>
        {!isDualStackVPC && (
          <Stack>
            <Typography variant="h3">Assign additional IPv4 ranges</Typography>
            <VPCRangesDescription />
          </Stack>
        )}
        {isDualStackVPC && (
          <Stack alignItems="center" direction="row" spacing={1}>
            <Typography variant="h3">Assign additional IP ranges</Typography>
            <TooltipIcon
              status="info"
              sxTooltipIcon={{ p: 0 }}
              text={<DualStackVPCRangesDescription />}
            />
          </Stack>
        )}
      </Stack>
      {iPv4Fields.map((field, index) => (
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
            onClick={() => {
              removeIPv4(index);

              const previousRangeIndex = index - 1;

              // If there is a previous range, focus it when the current one is removed
              if (previousRangeIndex >= 0) {
                setFocus(`vpc.ipv4.ranges.${previousRangeIndex}.range`);
              }
            }}
            sx={{ p: 1 }}
            title="Remove"
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      ))}
      <Stack direction="row">
        <LinkButton onClick={() => appendIPv4({ range: '' })}>
          Add IPv4 Range
        </LinkButton>
      </Stack>
      {isDualStackVPC &&
        iPv6Fields.map((field, index) => (
          <Stack
            alignItems="flex-start"
            direction="row"
            key={field.id}
            spacing={1}
          >
            <Controller
              control={control}
              name={`vpc.ipv6.ranges.${index}.range`}
              render={({ field, fieldState }) => (
                <TextField
                  containerProps={{ flexGrow: 1 }}
                  errorText={fieldState.error?.message}
                  hideLabel
                  inputRef={field.ref}
                  label={`VPC IPv6 Range ${index}`}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            <IconButton
              onClick={() => {
                removeIPv6(index);

                const previousRangeIndex = index - 1;

                // If there is a previous range, focus it when the current one is removed
                if (previousRangeIndex >= 0) {
                  setFocus(`vpc.ipv6.ranges.${previousRangeIndex}.range`);
                }
              }}
              sx={{ p: 1 }}
              title="Remove"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        ))}
      {isDualStackVPC && (
        <Stack direction="row">
          <LinkButton onClick={() => appendIPv6({ range: '' })}>
            Add IPv6 Range
          </LinkButton>
        </Stack>
      )}
    </Stack>
  );
};
