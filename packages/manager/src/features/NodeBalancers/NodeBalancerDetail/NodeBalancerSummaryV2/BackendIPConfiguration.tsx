import { Box, Divider, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { useFlags } from 'src/hooks/useFlags';

import { StyledIPBox } from './FrontendConfiguration';

import type {
  NodeBalancer,
  NodeBalancerBackendConnectivity,
} from '@linode/api-v4';

interface BackendIPConfigProps {
  nodebalancer: NodeBalancer;
}

export const BackendIPConfiguration = ({
  nodebalancer,
}: BackendIPConfigProps) => {
  const theme = useTheme();
  const { premiumNodebalancer: isPremiumNodebalancerEnabled } = useFlags();

  const SUPPORTED_BACKEND_TYPES: Partial<
    Record<NodeBalancerBackendConnectivity, 'IPv4' | 'IPv6'>
  > = {
    ipv6: 'IPv6',
    legacy: 'IPv4',
  };

  const backendType = nodebalancer.backend_connectivity
    ? SUPPORTED_BACKEND_TYPES[nodebalancer.backend_connectivity]
    : undefined;

  if (!isPremiumNodebalancerEnabled || !backendType) {
    return null;
  }

  return (
    <Paper
      sx={(theme) => ({
        padding: `${theme.spacingFunction(24)}`,
      })}
    >
      <Stack spacing={2}>
        <Typography data-qa-title sx={{ mb: 2 }} variant="h2">
          Backend Configuration - {backendType}
        </Typography>
        <Stack
          direction="row"
          divider={<Divider flexItem orientation="vertical" />}
          spacing={1}
        >
          <Typography>
            <strong>Type:</strong>{' '}
            <span
              style={{
                wordBreak: 'break-word',
                marginLeft: theme.spacingFunction(8),
              }}
            >
              {backendType === 'IPv4' ? 'Private' : 'Public'}
            </span>
          </Typography>
        </Stack>

        {nodebalancer?.backend_ipv6_prefix && backendType === 'IPv6' && (
          <StyledIPBox>
            <Typography component="span" data-testid="vpc-ipv6-label">
              <strong>Backend IPv6 Prefix:</strong>
            </Typography>
            <Box>
              <IPAddress
                ips={[nodebalancer.backend_ipv6_prefix]}
                isHovered={true}
                showMore
              />
            </Box>
          </StyledIPBox>
        )}
      </Stack>
    </Paper>
  );
};
