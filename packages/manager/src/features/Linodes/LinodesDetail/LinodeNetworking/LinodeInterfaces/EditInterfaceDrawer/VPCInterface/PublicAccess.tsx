import {
  Checkbox,
  FormControlLabel,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import {
  PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP,
  PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP,
} from 'src/features/VPCs/constants';

import type { ModifyLinodeInterfacePayload } from '@linode/api-v4';

interface Props {
  showIPv6Content: boolean;
  userCannotAssignLinodes: boolean;
}

// This component is a copy of the other PublicAccess component except react-hook-form is used to manage state
export const PublicAccess = (props: Props) => {
  const { showIPv6Content, userCannotAssignLinodes } = props;
  const { control } = useFormContext<ModifyLinodeInterfacePayload>();

  return (
    <Stack>
      <Typography variant="h3">Public access</Typography>
      <Controller
        control={control}
        name="vpc.ipv4.addresses.0.nat_1_1_address"
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(e, checked) =>
                  field.onChange(checked ? 'auto' : null)
                }
              />
            }
            disabled={userCannotAssignLinodes}
            label={
              <Stack alignItems="center" direction="row" mt={0}>
                <Typography>Allow public IPv4 access (1:1 NAT)</Typography>
                <TooltipIcon
                  status="info"
                  text={PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP}
                />
              </Stack>
            }
            sx={{ pl: 0.3 }}
          />
        )}
      />
      {showIPv6Content && (
        <Controller
          control={control}
          name="vpc.ipv6.is_public"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value === true}
                  onChange={() => field.onChange(!field.value)}
                />
              }
              disabled={userCannotAssignLinodes}
              label={
                <Stack alignItems="center" direction="row">
                  <Typography>Allow public IPv6 access</Typography>
                  <TooltipIcon
                    status="info"
                    text={PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP}
                  />
                </Stack>
              }
              sx={{ pl: 0.3 }}
            />
          )}
        />
      )}
    </Stack>
  );
};
