import {
  useAllNodeBalancerConfigsQuery,
  useNodeBalancerQuery,
  useNodeBalancersFirewallsQuery,
} from '@linode/queries';
import { Box, CircleProgress } from '@linode/ui';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Typography } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { APIError, Firewall, NodeBalancerConfig } from '@linode/api-v4';
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
  const {
    data: configs,
    isLoading: isConfigsLoading,
    error: configsError,
  } = useAllNodeBalancerConfigsQuery(Number(nodeBalancerId));
  const {
    data: attachedFirewallData,
    isLoading,
    error,
  } = useNodeBalancersFirewallsQuery(Number(nodeBalancerId));

  const getNodebalancerStatus = (
    data: NodeBalancerConfig[],
    loading: boolean,
    error?: APIError[]
  ): JSX.Element | string => {
    if (loading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error retrieving Status';
    }

    const down = data?.reduce((acc: number, config) => {
      return acc + config.nodes_status.down;
    }, 0);

    const up = data?.reduce((acc: number, config) => {
      return acc + config.nodes_status.up;
    }, 0);

    return (
      <>
        <StatusIcon aria-label="Nodebalancer status active" status="active" />
        {up} up, {down} down
      </>
    );
  };

  const getFirewallsCellString = (
    data: Firewall[],
    loading: boolean,
    error?: APIError[]
  ): JSX.Element | string => {
    if (loading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error retrieving Firewalls';
    }

    if (data.length === 0) {
      return 'None';
    }

    return getFirewallLink(data);
  };

  const getFirewallLink = (data: Firewall[]): JSX.Element | string => {
    const firewall = data[0];

    return (
      <Link
        className="link secondaryLink"
        data-testid="firewall-row-link"
        to={`/firewalls/${firewall.id}`}
      >
        {firewall.label}
      </Link>
    );
  };

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
        {getNodebalancerStatus(
          configs ?? [],
          isConfigsLoading,
          configsError ?? undefined
        )}
      </TableCell>
      <TableCell>{ipv4}</TableCell>
      <TableCell colSpan={2}>
        {getFirewallsCellString(
          attachedFirewallData?.data ?? [],
          isLoading,
          error ?? undefined
        )}
      </TableCell>
    </TableRow>
  );
};

export const SubnetNodebalancerTableRowHead = (
  <TableRow>
    <TableCell sx={{ width: '14%' }}>NodeBalancer</TableCell>
    <TableCell sx={{ width: '24.5%' }}>Backend Status</TableCell>
    <TableCell sx={{ width: '16.5%' }}>VPC IPv4 Range</TableCell>
    <TableCell>Firewalls</TableCell>
  </TableRow>
);
