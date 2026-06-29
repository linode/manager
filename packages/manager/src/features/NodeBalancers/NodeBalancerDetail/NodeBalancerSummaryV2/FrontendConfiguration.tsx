import { Badge } from '@akamai/cds-components/react/Badge';
import { useIPAddressQuery } from '@linode/queries';
import { Box, LinkButton, Paper, Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { ReserveIPDrawer } from 'src/features/ReservedIps/ReserveIPDrawer';
import { useIsReserveIpEnabled } from 'src/features/ReservedIps/utils';

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

  const { isReserveIpEnabled } = useIsReserveIpEnabled();

  const [isReserveIpDrawerOpen, setIsReserveIpDrawerOpen] =
    React.useState(false);

  const shouldEnableReserveIP =
    isReserveIpEnabled &&
    Boolean(nodebalancer?.ipv4) &&
    nodebalancer.frontend_address_type === 'public';

  const { data: ipAddressData } = useIPAddressQuery(
    nodebalancer?.ipv4 ?? '',
    shouldEnableReserveIP
  );
  const isIpReserved = ipAddressData?.reserved ?? false;

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
          <Box
            sx={() => ({
              alignItems: 'baseline',
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 1,
            })}
          >
            <IPAddress ips={[nodebalancer.ipv4]} isHovered={true} showMore />
            {shouldEnableReserveIP &&
              (isIpReserved ? (
                <Badge>Reserved</Badge>
              ) : (
                <LinkButton
                  aria-label={`Reserve IP address ${nodebalancer.ipv4}`}
                  data-pendo-id="NodeBalancers Details Frontend-Reserve IP Start Flow"
                  onClick={() => setIsReserveIpDrawerOpen(true)}
                  sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}
                >
                  Reserve IP
                </LinkButton>
              ))}
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
      {isReserveIpEnabled && (
        <ReserveIPDrawer
          ipAddress={ipAddressData}
          mode="reserve"
          onClose={() => setIsReserveIpDrawerOpen(false)}
          open={isReserveIpDrawerOpen}
          pendoIds={{
            cancel: 'NodeBalancers Details Reserve IP-Cancel',
            close: 'NodeBalancers Details Reserve IP-Close',
            submit:
              'NodeBalancers Details Reserve IP-Reserve IP Address End Flow',
          }}
        />
      )}
    </Paper>
  );
};

export const StyledIPBox = styled(Box, { label: 'StyledIPBox' })(
  ({ theme }) => ({
    alignItems: 'baseline',
    columnGap: `${theme.spacingFunction(8)}`,
    display: 'flex',
    flexShrink: 0,
    flexWrap: 'wrap',
  })
);
