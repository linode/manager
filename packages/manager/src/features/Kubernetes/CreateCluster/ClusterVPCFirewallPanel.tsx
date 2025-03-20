import { Stack, Typography } from '@linode/ui';
import React from 'react';

export const ClusterVPCFirewallPanel = () => {
  return (
    <Stack>
      <Typography variant="h3">VPC & Firewall</Typography>
      <Typography marginTop={1}>
        A VPC and firewall are automatically generated for LKE Enterprise
        customers.
      </Typography>
    </Stack>
  );
};
