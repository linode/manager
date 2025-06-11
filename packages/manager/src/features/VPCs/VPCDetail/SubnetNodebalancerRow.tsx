import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancerQuery,
  useNodeBalancersFirewallsQuery,
} from '@linode/queries';
import { Box, CircleProgress, Hidden } from '@linode/ui';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

interface Props {
  hover?: boolean;
  ipv4: string;
  nodeBalancerId: number;
}

export const SubnetNodeBalancerRow = ({
  nodeBalancerId,
  hover = false,
  ipv4,
}: Props) => {
  const {
    data: nodebalancer,
    error: nodebalancerError,
    isLoading: nodebalancerLoading,
  } = useNodeBalancerQuery(nodeBalancerId);
  const { data: attachedFirewallData } = useNodeBalancersFirewallsQuery(
    Number(nodeBalancerId)
  );
  const { data: configs } = useAllNodeBalancerConfigsQuery(
    Number(nodeBalancerId)
  );

  const firewallLabel = attachedFirewallData?.data[0]?.label;
  const firewallId = attachedFirewallData?.data[0]?.id;

  const down = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.down;
  }, 0); // add the downtime for each config together

  const up = configs?.reduce((acc: number, config) => {
    return acc + config.nodes_status.up;
  }, 0); // add the uptime for each config together

  if (nodebalancerLoading) {
    return (
      <TableRow hover={hover}>
        <TableCell colSpan={6} style={{ textAlign: 'center' }}>
          <CircleProgress size="sm" />
        </TableCell>
      </TableRow>
    );
  }

  if (nodebalancerError || !nodebalancer) {
    return (
      <TableRow data-testid="subnet-nodebalancer-row-error" hover={hover}>
        <TableCell colSpan={6} style={{ justifyItems: 'center' }}>
          <Box alignItems="center" display="flex">
            <ErrorOutline
              data-qa-error-icon
              sx={(theme) => ({ color: theme.color.red, marginRight: 1 })}
            />
            <Typography>
              There was an error loading{' '}
              <Link to={`/nodebalancers/${nodeBalancerId}/summary`}>
                Nodebalancer {nodeBalancerId}
              </Link>
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <Link
          className="secondaryLink"
          to={`/nodebalancers/${nodebalancer?.id}/summary`}
        >
          {nodebalancer?.label}
        </Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon aria-label="Nodebalancer status active" status="active" />
        {`${up} up, ${down} down`}
      </TableCell>
      <TableCell>{ipv4}</TableCell>
      <TableCell colSpan={2}>
        <Link
          accessibleAriaLabel={`Firewall ${firewallLabel}`}
          className="secondaryLink"
          to={`/firewalls/${firewallId}`}
        >
          {firewallLabel}
        </Link>
      </TableCell>
    </TableRow>
  );
};

export const SubnetNodebalancerTableRowHead = (
  <TableRow>
    <TableCell>NodeBalancer</TableCell>
    <TableCell>Backend Status</TableCell>
    <Hidden smDown>
      <TableCell>VPC IPv4 Range</TableCell>
    </Hidden>
    <Hidden smDown>
      <TableCell>Firewalls</TableCell>
    </Hidden>
    <TableCell />
  </TableRow>
);
