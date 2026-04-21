import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancersFirewallsQuery,
  useRegionsQuery,
} from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import { convertMegabytesTo } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { Link } from 'src/components/Link';

import type { NodeBalancer } from '@linode/api-v4';

interface Props {
  nodebalancer: NodeBalancer;
}

export const NodeBalancerDetailBody = ({ nodebalancer }: Props) => {
  const { id } = useParams({
    from: '/nodebalancers/$id/summary',
  });
  const { data: configs } = useAllNodeBalancerConfigsQuery(Number(id));
  const { data: regions } = useRegionsQuery();
  const { data: attachedFirewallData } = useNodeBalancersFirewallsQuery(
    Number(id)
  );

  const configPorts = configs?.reduce((acc, config) => {
    return [...acc, { configId: config.id, port: config.port }];
  }, []);

  const regionLabel =
    regions?.find((region) => region.id === nodebalancer.region)?.label ??
    nodebalancer.region;
  const firewallLinkText = attachedFirewallData?.data[0]?.label;
  const firewallLinkID = attachedFirewallData?.data[0]?.id;
  const displayFirewallLink = !!attachedFirewallData?.data?.length;

  return (
    <Grid
      container
      spacing={3}
      sx={(theme) => ({
        padding: theme.spacingFunction(16),
      })}
    >
      <Grid
        size={{ xs: 12, sm: 4 }}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(24),
        })}
      >
        <Box>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            Type
          </Typography>
          <Typography>
            {nodebalancer.type === 'common' && 'Basic'}
            {nodebalancer.type === 'premium' && 'Premium'}
            {nodebalancer.type === 'premium_40gb' && 'Enterprise'}
          </Typography>
        </Box>
        <Box>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            Region
          </Typography>
          <Typography>{regionLabel}</Typography>
        </Box>
        <Box>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            NodeBalancer ID
          </Typography>
          <Typography>{nodebalancer.id}</Typography>
        </Box>
      </Grid>

      <Grid
        size={{ xs: 12, sm: 4 }}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacingFunction(24),
        })}
      >
        <Box>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            Configuration Ports
          </Typography>
          <Typography>
            {configPorts?.length === 0 && 'None'}
            {configPorts?.map(({ configId, port }, i) => (
              <React.Fragment key={configId}>
                <Link
                  accessibleAriaLabel={`Port ${port}`}
                  className="secondaryLink"
                  to={`/nodebalancers/${nodebalancer?.id}/configurations/${configId}`}
                >
                  {port}
                </Link>
                {i < configPorts?.length - 1 ? ', ' : ''}
              </React.Fragment>
            ))}
          </Typography>
        </Box>
        <Box>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            Hostname
          </Typography>
          <Typography>{nodebalancer.hostname}</Typography>
        </Box>
        <Box>
          <Typography sx={(theme) => ({ font: theme.font.bold })}>
            Transferred
          </Typography>
          <Typography>
            {convertMegabytesTo(nodebalancer.transfer.total)}
          </Typography>
        </Box>
      </Grid>

      {displayFirewallLink && (
        <Grid
          size={{ xs: 12, sm: 4 }}
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacingFunction(24),
          })}
        >
          <Box>
            <Typography sx={(theme) => ({ font: theme.font.bold })}>
              Firewall
            </Typography>
            <Typography data-qa-firewall variant="body1">
              <Link
                accessibleAriaLabel={`Firewall ${firewallLinkText}`}
                className="secondaryLink"
                to={`/firewalls/${firewallLinkID}`}
              >
                {firewallLinkText}
              </Link>
            </Typography>
          </Box>
        </Grid>
      )}
    </Grid>
  );
};
