import {
  useNodeBalancerQuery,
  useNodeBalancersFirewallsQuery,
  useNodeBalancerVPCConfigsBetaQuery,
} from '@linode/queries';
import { Box, CircleProgress, Typography } from '@linode/ui';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import type { APIError, Firewall, NodeBalancerVpcConfig } from '@linode/api-v4';

const LOADING_TEXT = 'Loading...';
interface Props {
  hover?: boolean;
  nodeBalancerId: number;
  subnetId: number;
}

export const SubnetNodeBalancerRow = ({
  nodeBalancerId,
  hover = false,
  subnetId,
}: Props) => {
  const {
    data: nodebalancer,
    error: nodebalancerError,
    isLoading: nodebalancerLoading,
  } = useNodeBalancerQuery(nodeBalancerId);
  const {
    data: attachedFirewallData,
    isLoading,
    error,
  } = useNodeBalancersFirewallsQuery(Number(nodeBalancerId));

  const {
    data: vpcConfigs,
    error: vpcConfigsError,
    isLoading: isVpcConfigsLoading,
  } = useNodeBalancerVPCConfigsBetaQuery(
    Number(nodeBalancerId),
    Boolean(nodeBalancerId)
  );

  const frontendVpcConfig = vpcConfigs?.data.find(
    (config) => config.purpose === 'frontend' && config.subnet_id === subnetId
  );

  const backendVpcConfig = vpcConfigs?.data.find(
    (config) => config.purpose === 'backend' && config.subnet_id === subnetId
  );

  const getVpcIpCellString = (
    data: NodeBalancerVpcConfig | undefined,
    ipProperty: 'ipv4_range' | 'ipv6_range',
    loading: boolean,
    error?: APIError[]
  ): React.JSX.Element | string => {
    if (loading) {
      return LOADING_TEXT;
    }

    if (error) {
      return 'Error retrieving IP';
    }

    if (!data || data.subnet_id !== subnetId) {
      return '—';
    }

    return data[ipProperty] ?? '—';
  };

  const getFirewallsCellString = (
    data: Firewall[],
    loading: boolean,
    error?: APIError[]
  ): React.JSX.Element | string => {
    if (loading) {
      return LOADING_TEXT;
    }

    if (error) {
      return 'Error retrieving Firewalls';
    }

    if (data.length === 0) {
      return 'None';
    }

    return getFirewallLink(data);
  };

  const getFirewallLink = (data: Firewall[]): React.JSX.Element | string => {
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
      <TableCell>
        {getVpcIpCellString(
          frontendVpcConfig,
          'ipv4_range',
          isVpcConfigsLoading,
          vpcConfigsError ?? undefined
        )}
      </TableCell>
      <TableCell>
        {getVpcIpCellString(
          frontendVpcConfig,
          'ipv6_range',
          isVpcConfigsLoading,
          vpcConfigsError ?? undefined
        )}
      </TableCell>
      <TableCell>
        {getVpcIpCellString(
          backendVpcConfig,
          'ipv4_range',
          isVpcConfigsLoading,
          vpcConfigsError ?? undefined
        )}
      </TableCell>
      <TableCell>
        {getVpcIpCellString(
          backendVpcConfig,
          'ipv6_range',
          isVpcConfigsLoading,
          vpcConfigsError ?? undefined
        )}
      </TableCell>
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
    <TableCell sx={{ width: '20%' }}>NodeBalancer</TableCell>
    <TableCell sx={{ width: '15%' }}>Frontend IPv4</TableCell>
    <TableCell sx={{ width: '20%' }}>Frontend IPv6</TableCell>
    <TableCell sx={{ width: '15%' }}>Backend IPv4 Ranges</TableCell>
    <TableCell sx={{ width: '20%' }}>Backend IPv6 Ranges</TableCell>
    <TableCell>Firewall</TableCell>
  </TableRow>
);
