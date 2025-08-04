import styled from '@emotion/styled';
import { useLinodeIPsQuery, usePreferences } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { transitionText } from 'src/features/Linodes/transitions';
import { useInProgressEvents } from 'src/queries/events/events';

import { NodeActionMenu } from './NodeActionMenu';

import type { APIError, VPCIP } from '@linode/api-v4';

export interface NodeRow {
  instanceId?: number;
  instanceStatus?: string;
  ip?: string;
  label?: string;
  nodeId: string;
  nodeStatus: string;
  shouldShowVpcIPAddressColumns: boolean;
}

interface NodeRowProps extends NodeRow {
  isLkeClusterRestricted: boolean;
  linodeError?: APIError[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  typeLabel: string;
}

export const NodeRow = React.memo((props: NodeRowProps) => {
  const {
    instanceId,
    instanceStatus,
    ip,
    isLkeClusterRestricted,
    label,
    linodeError,
    nodeId,
    nodeStatus,
    openRecycleNodeDialog,
    typeLabel,
    shouldShowVpcIPAddressColumns,
  } = props;

  const { data: ips, error: ipsError } = useLinodeIPsQuery(
    instanceId ?? -1,
    Boolean(instanceId)
  );
  const { data: events } = useInProgressEvents();
  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
  );

  const vpcIpv4: VPCIP = ips?.ipv4?.vpc.find(
    (ip: VPCIP) => ip.address !== null
  );
  const vpcIpv6: VPCIP = ips?.ipv6?.vpc?.find(
    (ip: VPCIP) => ip.ipv6_addresses[0].slaac_address !== null
  );

  const recentEvent = events?.find(
    (event) =>
      event.entity?.id === instanceId && event.entity?.type === 'linode'
  );

  const linodeLink = instanceId ? `/linodes/${instanceId}` : undefined;

  const nodeReadyAndInstanceRunning =
    nodeStatus === 'ready' && instanceStatus === 'running';

  const iconStatus =
    nodeStatus === 'not_ready'
      ? 'other'
      : nodeReadyAndInstanceRunning
        ? 'active'
        : 'inactive';

  const displayLabel = label ?? typeLabel;

  const displayStatus =
    nodeStatus === 'not_ready'
      ? 'Provisioning'
      : transitionText(instanceStatus ?? '', instanceId ?? -1, recentEvent);

  const displayPublicIPv4 = ip ?? '';
  const displayVPCIPv4 = vpcIpv4?.address ?? '';
  const displayVPCIPv6 = vpcIpv6?.ipv6_addresses[0].slaac_address ?? '';

  return (
    <TableRow data-qa-node-row={nodeId}>
      <TableCell noWrap>
        {linodeLink ? (
          <Link to={linodeLink}>{displayLabel}</Link>
        ) : (
          displayLabel
        )}
      </TableCell>
      <TableCell statusCell={!linodeError}>
        {linodeError ? (
          <Typography
            sx={(theme) => ({
              color: theme.color.red,
            })}
          >
            Error retrieving status
          </Typography>
        ) : (
          <>
            <StatusIcon status={iconStatus} />
            {displayStatus}
          </>
        )}
      </TableCell>
      <TableCell noWrap>
        {linodeError ? (
          <Typography
            sx={(theme) => ({
              color: theme.color.red,
            })}
          >
            Error retrieving IP
          </Typography>
        ) : displayPublicIPv4.length > 0 ? (
          <Box alignItems="center" display="flex" gap={0.5}>
            <CopyTooltip
              copyableText
              masked={Boolean(maskSensitiveDataPreference)}
              maskedTextLength="ipv4"
              text={displayPublicIPv4}
            />
            <StyledCopyTooltip text={displayPublicIPv4} />
          </Box>
        ) : null}
      </TableCell>
      {shouldShowVpcIPAddressColumns && (
        <TableCell noWrap>
          {linodeError || ipsError ? (
            <Typography
              sx={(theme) => ({
                color: theme.color.red,
              })}
            >
              Error retrieving IP
            </Typography>
          ) : displayVPCIPv4.length > 0 ? (
            <Box alignItems="center" display="flex" gap={0.5}>
              <CopyTooltip
                copyableText
                masked={Boolean(maskSensitiveDataPreference)}
                maskedTextLength="ipv4"
                text={displayVPCIPv4}
              />
              <StyledCopyTooltip text={displayVPCIPv4} />
            </Box>
          ) : null}
        </TableCell>
      )}
      {shouldShowVpcIPAddressColumns && (
        <TableCell noWrap>
          {linodeError || ipsError ? (
            <Typography
              sx={(theme) => ({
                color: theme.color.red,
              })}
            >
              Error retrieving IP
            </Typography>
          ) : displayVPCIPv6.length > 0 ? (
            <Box alignItems="center" display="flex" gap={0.5}>
              <CopyTooltip
                copyableText
                masked={Boolean(maskSensitiveDataPreference)}
                maskedTextLength="ipv6"
                text={displayVPCIPv6}
              />
              <StyledCopyTooltip text={displayVPCIPv6} />
            </Box>
          ) : (
            '—'
          )}
        </TableCell>
      )}
      <TableCell actionCell>
        <NodeActionMenu
          instanceLabel={label}
          isLkeClusterRestricted={isLkeClusterRestricted}
          nodeId={nodeId}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </TableCell>
    </TableRow>
  );
});

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})({
  '& svg': {
    height: `12px`,
    width: `12px`,
  },
});
