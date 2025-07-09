import styled from '@emotion/styled';
import { usePreferences } from '@linode/queries';
import { Box, Typography } from '@linode/ui';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Link } from 'src/components/Link';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';

import { NodeActionMenu } from './NodeActionMenu';

import type { APIError } from '@linode/api-v4';

export interface NodeRow {
  instanceId?: number;
  instanceStatus?: string;
  ip?: string;
  label?: string;
  nodeId: string;
  nodeStatus: string;
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
  } = props;

  const { data: maskSensitiveDataPreference } = usePreferences(
    (preferences) => preferences?.maskSensitiveData
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
    nodeStatus === 'not_ready' ? 'Provisioning' : instanceStatus;

  const displayIP = ip ?? '';

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
        ) : displayIP.length > 0 ? (
          <Box alignItems="center" display="flex" gap={0.5}>
            <CopyTooltip
              copyableText
              masked={Boolean(maskSensitiveDataPreference)}
              maskedTextLength="ipv4"
              text={displayIP}
            />
            <StyledCopyTooltip text={displayIP} />
          </Box>
        ) : null}
      </TableCell>
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
