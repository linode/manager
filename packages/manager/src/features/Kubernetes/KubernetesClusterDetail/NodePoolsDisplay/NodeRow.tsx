import styled from '@emotion/styled';
import {
  useLinodeIPsQuery,
  usePreferences,
  useTypeQuery,
} from '@linode/queries';
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
  type: string;
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
    type,
    shouldShowVpcIPAddressColumns,
  } = props;

  const { data: linodeType } = useTypeQuery(type);

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

  const labelText = label ?? linodeType?.label ?? type;

  const statusText =
    nodeStatus === 'not_ready'
      ? 'Provisioning'
      : transitionText(instanceStatus ?? '', instanceId ?? -1, recentEvent);

  const publicIPv4Text = ip ?? '';
  const vpcIpv4Text = vpcIpv4?.address ?? '';
  const vpcIpv6Text = vpcIpv6?.ipv6_addresses[0].slaac_address ?? '';

  return (
    <TableRow data-qa-node-row={nodeId}>
      <TableCell noWrap>
        {linodeLink ? <Link to={linodeLink}>{labelText}</Link> : labelText}
      </TableCell>
      <TableCell statusCell={!linodeError}>
        {linodeError ? (
          <Typography
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Negative,
            })}
          >
            Error retrieving status
          </Typography>
        ) : (
          <>
            <StatusIcon status={iconStatus} />
            {statusText}
          </>
        )}
      </TableCell>
      <TableCell noWrap>
        {linodeError ? (
          <Typography
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Negative,
            })}
          >
            Error retrieving IP
          </Typography>
        ) : publicIPv4Text.length > 0 ? (
          <Box alignItems="center" display="flex" gap={0.5}>
            <CopyTooltip
              copyableText
              masked={Boolean(maskSensitiveDataPreference)}
              maskedTextLength="ipv4"
              text={publicIPv4Text}
            />
            <StyledCopyTooltip text={publicIPv4Text} />
          </Box>
        ) : null}
      </TableCell>
      {shouldShowVpcIPAddressColumns && (
        <TableCell noWrap>
          {linodeError || ipsError ? (
            <Typography
              sx={(theme) => ({
                color: theme.tokens.alias.Content.Text.Negative,
              })}
            >
              Error retrieving IP
            </Typography>
          ) : vpcIpv4Text.length > 0 ? (
            <Box alignItems="center" display="flex" gap={0.5}>
              <CopyTooltip
                copyableText
                masked={Boolean(maskSensitiveDataPreference)}
                maskedTextLength="ipv4"
                text={vpcIpv4Text}
              />
              <StyledCopyTooltip text={vpcIpv4Text} />
            </Box>
          ) : null}
        </TableCell>
      )}
      {shouldShowVpcIPAddressColumns && (
        <TableCell noWrap>
          {linodeError || ipsError ? (
            <Typography
              sx={(theme) => ({
                color: theme.tokens.alias.Content.Text.Negative,
              })}
            >
              Error retrieving IP
            </Typography>
          ) : vpcIpv6Text.length > 0 ? (
            <Box alignItems="center" display="flex" gap={0.5}>
              <CopyTooltip
                copyableText
                masked={Boolean(maskSensitiveDataPreference)}
                maskedTextLength="ipv6"
                text={vpcIpv6Text}
              />
              <StyledCopyTooltip text={vpcIpv6Text} />
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
