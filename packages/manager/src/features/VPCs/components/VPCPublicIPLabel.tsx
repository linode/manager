import { Stack, TooltipIcon, Typography } from '@linode/ui';
import React from 'react';

/**
 * A shared component that is intended to be the label for the
 * VPC 1:1 NAT (public IP) checkbox.
 */
export const VPCPublicIPLabel = () => {
  return (
    <Stack alignItems="center" direction="row">
      <Typography>Assign a public IPv4 address for this Linode</Typography>
      <TooltipIcon
        status="help"
        text="Access the internet through the public IPv4 address using static 1:1 NAT."
      />
    </Stack>
  );
};
