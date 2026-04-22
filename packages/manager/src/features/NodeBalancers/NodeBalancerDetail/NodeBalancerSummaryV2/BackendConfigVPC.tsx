import {
  useNodeBalancerVPCConfigsBetaQuery,
  useVPCQuery,
} from '@linode/queries';
import { Box, Divider, Paper, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useParams } from '@tanstack/react-router';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';

import { StyledIPBox } from './FrontendConfiguration';

export const BackendConfigurationVPC = () => {
  const theme = useTheme();

  const { id } = useParams({
    from: '/nodebalancers/$id/summary',
  });
  const { data: vpcConfig } = useNodeBalancerVPCConfigsBetaQuery(
    Number(id),
    true
  );
  // "/nodebalancers/:id/vpcs" returns both frontend and backend VPC configs,
  // but we only want to display the backend configs and
  // a nodebalancer can have only one backend VPC.
  const nbBackendVpcConfig =
    vpcConfig?.data.find((v) => v.purpose === 'backend') ?? null;

  const { data: vpcDetails } = useVPCQuery(
    Number(nbBackendVpcConfig?.vpc_id) || -1,
    Boolean(nbBackendVpcConfig?.vpc_id)
  );

  if (!nbBackendVpcConfig) {
    return null;
  }

  const subnets = vpcDetails?.subnets ?? [];

  const subnet = subnets.find((s) => s.id === nbBackendVpcConfig?.subnet_id);

  const subnetWithConfigData = {
    id: nbBackendVpcConfig?.subnet_id,
    label: subnet?.label ?? `Subnet ${nbBackendVpcConfig?.subnet_id}`,
    ipv4Range: nbBackendVpcConfig?.ipv4_range,
    ipv6Range: nbBackendVpcConfig?.ipv6_range,
  };

  return (
    <Paper
      sx={(theme) => ({
        padding: `${theme.spacingFunction(24)}`,
      })}
    >
      <Stack spacing={2}>
        <Typography data-qa-title sx={{ mb: 2 }} variant="h2">
          Backend Configuration - VPC
        </Typography>
        <Stack
          direction="row"
          divider={<Divider flexItem orientation="vertical" />}
          spacing={1}
        >
          <Typography>
            <strong>VPC:</strong>{' '}
            <React.Fragment key={nbBackendVpcConfig.id}>
              <Link
                accessibleAriaLabel={`VPC ${vpcDetails?.label}`}
                className="secondaryLink"
                style={{ marginLeft: theme.spacingFunction(8) }}
                to={`/vpcs/${nbBackendVpcConfig.vpc_id}`}
              >
                {vpcDetails?.label}
              </Link>
            </React.Fragment>
          </Typography>
          <Typography>
            <strong>Subnet:</strong>{' '}
            <span
              style={{
                wordBreak: 'break-word',
                marginLeft: theme.spacingFunction(8),
              }}
            >
              {`${subnetWithConfigData.label}`}
            </span>
          </Typography>
        </Stack>
        {subnetWithConfigData.ipv4Range && (
          <StyledIPBox>
            <Typography component="span" data-testid="vpc-ipv4-label">
              <strong>IPv4 Range:</strong>
            </Typography>
            <Box>
              <IPAddress
                ips={[subnetWithConfigData?.ipv4Range]}
                isHovered={true}
                showMore
              />
            </Box>
          </StyledIPBox>
        )}
        {subnetWithConfigData.ipv6Range && (
          <StyledIPBox>
            <Typography component="span" data-testid="vpc-ipv6-label">
              <strong>IPv6 Range:</strong>
            </Typography>
            <Box>
              <IPAddress
                ips={[subnetWithConfigData.ipv6Range]}
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
