import { useGrants, useProfile, useVPCQuery } from '@linode/queries';
import {
  Checkbox,
  FormControlLabel,
  Stack,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import {
  PUBLIC_IPV4_ACCESS_CHECKBOX_TOOLTIP,
  PUBLIC_IPV6_ACCESS_CHECKBOX_TOOLTIP,
} from 'src/features/VPCs/constants';
import { useVPCDualStack } from 'src/hooks/useVPCDualStack';

import type { CreateInterfaceFormValues } from '../../AddInterfaceDrawer/utilities';

// This component is a copy of the other PublicAccess component except react-hook-form is used to manage state
export const PublicAccess = () => {
  const { control } = useFormContext<CreateInterfaceFormValues>();

  const vpcId = useWatch({
    control,
    name: 'vpc.vpc_id',
  });
  const { isDualStackEnabled } = useVPCDualStack();
  const { data: vpc } = useVPCQuery(vpcId, Boolean(vpcId));
  const isDualStackVPC = isDualStackEnabled && Boolean(vpc?.ipv6);

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const vpcPermissions = grants?.vpc.find((v) => v.id === vpcId);

  // @TODO VPC: this logic for vpc grants/perms appears a lot - commenting a todo here in case we want to move this logic to a parent component
  // there isn't a 'view VPC/Subnet' grant that does anything, so all VPCs get returned even for restricted users
  // with permissions set to 'None'. Therefore, we're treating those as read_only as well
  const userCannotAssignLinodes =
    Boolean(profile?.restricted) &&
    (vpcPermissions?.permissions === 'read_only' || grants?.vpc.length === 0);

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
      {isDualStackVPC && (
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
