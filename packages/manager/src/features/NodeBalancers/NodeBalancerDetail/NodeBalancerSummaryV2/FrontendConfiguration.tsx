import { Box, Paper, Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';

import type { NodeBalancer } from '@linode/api-v4';
interface FrontendConfigurationProps {
  nodebalancer: NodeBalancer;
}

export const FrontendConfiguration = ({
  nodebalancer,
}: FrontendConfigurationProps) => {
  const theme = useTheme();
  let frontendAddressType = '';

  if (nodebalancer.frontend_address_type === 'public') {
    frontendAddressType = 'Public';
  } else if (nodebalancer.frontend_address_type === 'vpc') {
    frontendAddressType = 'VPC';
  }

  return (
    <Paper
      sx={(theme) => ({
        padding: `${theme.spacingFunction(24)}`,
      })}
    >
      <Stack spacing={2}>
        <Typography data-qa-title variant="h2">
          Frontend Configuration
        </Typography>

        <Box sx={{ flexShrink: 0 }}>
          <Typography>
            <strong>Type:</strong>
            <span style={{ marginLeft: theme.spacingFunction(8) }}>
              {frontendAddressType}
            </span>
          </Typography>
        </Box>
        <StyledIPBox>
          <Typography component="span" data-testid="ipv4-label">
            <strong>IPv4 Address:</strong>
          </Typography>
          <Box>
            <IPAddress ips={[nodebalancer.ipv4]} isHovered={true} showMore />
          </Box>
        </StyledIPBox>
        {nodebalancer.ipv6 && (
          <StyledIPBox>
            <Typography component="span" data-testid="ipv6-label">
              <strong>IPv6 Address:</strong>
            </Typography>
            <Box>
              <IPAddress ips={[nodebalancer?.ipv6]} isHovered={true} showMore />
            </Box>
          </StyledIPBox>
        )}
      </Stack>
    </Paper>
  );
};

export const StyledIPBox = styled(Box, { label: 'StyledIPBox' })(
  ({ theme }) => ({
    alignItems: 'center',
    columnGap: `${theme.spacingFunction(8)}`,
    display: 'flex',
    flexShrink: 0,
    flexWrap: 'wrap',
  })
);
