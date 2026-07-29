import { Badge, Icon, Tooltip } from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { convertMegabytesTo } from '@akamai/compute-ui-core/api';
import { useAllNodeBalancerConfigsQuery } from '@linode/queries';
import { Box, Hidden } from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { Skeleton } from 'src/components/Skeleton';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { IPAddress } from 'src/features/Linodes/LinodesLanding/IPAddress';
import { RegionIndicator } from 'src/features/Linodes/LinodesLanding/RegionIndicator';
import { useFlags } from 'src/hooks/useFlags';

import {
  getBackendStatusIndicator,
  useIsNodebalancerVPCEnabled,
} from '../utils';
import { NodeBalancerActionMenu } from './NodeBalancerActionMenu';
import { NodeBalancerVPC } from './NodeBalancerVPC';

import type { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';

export const NodeBalancerTableRow = (props: NodeBalancer) => {
  const { id, ipv4, label, region, transfer, type, backend_connectivity } =
    props;
  const { isNodebalancerVPCEnabled } = useIsNodebalancerVPCEnabled();
  const {
    aclpNbMetricsIntegration,
    premiumNodebalancer: isPremiumNodebalancerEnabled,
  } = useFlags();

  const { data: configs, isLoading: isConfigsLoading } =
    useAllNodeBalancerConfigsQuery(id);

  const isNodeBalancerPremium = type === 'premium';
  const hasNoConfig = !isConfigsLoading && (!configs || configs.length === 0);

  const nodesUp =
    configs?.reduce((result, config) => config.nodes_status.up + result, 0) ??
    0;
  const nodesDown =
    configs?.reduce((result, config) => config.nodes_status.down + result, 0) ??
    0;

  const backendConnectivity = React.useMemo(() => {
    switch (backend_connectivity) {
      case 'ipv6':
        return 'IPv6';
      case 'legacy':
        return 'IPv4';
      case 'vpc':
        return 'VPC';
      default:
        return '-';
    }
  }, [backend_connectivity]);

  return (
    <TableRow key={id}>
      <TableCell>
        <Link
          accessibleAriaLabel={label}
          pendoId="NodeBalancers Landing-NodeBalancer Details"
          to={`/nodebalancers/${id}`}
        >
          {label}
        </Link>

        {/* Show a "Premium" badge for premium nodebalancers */}
        {isPremiumNodebalancerEnabled && isNodeBalancerPremium && (
          <Badge style={{ marginLeft: Spacing.S8 }}>Premium</Badge>
        )}

        {/* Show tooltip for any type of nodebalancer that has no configuration */}
        {isPremiumNodebalancerEnabled && hasNoConfig && (
          <Tooltip
            data-testid="no-config-tooltip"
            style={{ marginLeft: Spacing.S8 }}
            tooltipPlacement="right"
            tooltipText="To serve traffic, add a port configuration and at least one backend node."
          >
            <Icon icon="info-outline" size="m" />
          </Tooltip>
        )}
      </TableCell>
      <Hidden smDown>
        <TableCell noWrap>
          {aclpNbMetricsIntegration ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <StatusIcon
                pulse={isConfigsLoading}
                status={getBackendStatusIndicator(nodesUp, nodesDown)}
              />
              <span>
                {isConfigsLoading
                  ? 'Loading'
                  : `${nodesUp} Up - ${nodesDown} Down`}
              </span>
            </Box>
          ) : (
            <span>{`${nodesUp} up - ${nodesDown} down`}</span>
          )}
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>{convertMegabytesTo(transfer.total)}</TableCell>
        <TableCell>
          {!configs ? <Skeleton /> : null}
          {configs?.length === 0 && 'None'}
          {configs?.map(({ id: configId, port }, i) => (
            <React.Fragment key={configId}>
              <Link
                accessibleAriaLabel={`NodeBalancer Port ${port}`}
                to={`/nodebalancers/${id}/configurations/${configId}`}
              >
                {port}
              </Link>
              {i < configs.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </TableCell>
      </Hidden>
      <TableCell>
        <IPAddress ips={[ipv4]} isHovered={true} showMore />
      </TableCell>
      <Hidden mdDown>
        <TableCell>{backendConnectivity}</TableCell>
      </Hidden>
      <Hidden smDown>
        <TableCell data-qa-region>
          <RegionIndicator region={region} />
        </TableCell>
      </Hidden>
      {isNodebalancerVPCEnabled && (
        <Hidden lgDown>
          <TableCell data-qa-vpc>
            <NodeBalancerVPC nodeBalancerId={id} />
          </TableCell>
        </Hidden>
      )}
      <TableCell actionCell>
        <NodeBalancerActionMenu nodeBalancerId={id} />
      </TableCell>
    </TableRow>
  );
};
