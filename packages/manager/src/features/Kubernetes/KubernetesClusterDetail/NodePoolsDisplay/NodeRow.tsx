import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { Typography } from 'src/components/Typography';
import { transitionText } from 'src/features/Linodes/transitions';
import { useInProgressEvents } from 'src/queries/events/events';

import NodeActionMenu from './NodeActionMenu';
import { StyledCopyTooltip, StyledTableRow } from './NodeTable.styles';

import type { APIError } from '@linode/api-v4/lib/types';

export interface NodeRow {
  instanceId?: number;
  instanceStatus?: string;
  ip?: string;
  label?: string;
  nodeId: string;
  nodeStatus: string;
}

interface NodeRowProps extends NodeRow {
  linodeError?: APIError[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  typeLabel: string;
}

export const NodeRow = React.memo((props: NodeRowProps) => {
  const {
    instanceId,
    instanceStatus,
    ip,
    label,
    linodeError,
    nodeId,
    nodeStatus,
    openRecycleNodeDialog,
    typeLabel,
  } = props;

  const { data: events } = useInProgressEvents();

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

  const displayIP = ip ?? '';

  return (
    <StyledTableRow data-qa-node-row={nodeId}>
      <TableCell>
        <Grid alignItems="center" container wrap="nowrap">
          <Grid>
            <Typography>
              {linodeLink ? (
                <Link to={linodeLink}>{displayLabel}</Link>
              ) : (
                displayLabel
              )}
            </Typography>
          </Grid>
        </Grid>
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
          <>
            <CopyTooltip copyableText text={displayIP} />
            <StyledCopyTooltip text={displayIP} />
          </>
        ) : null}
      </TableCell>
      <TableCell>
        <NodeActionMenu
          instanceLabel={label}
          nodeId={nodeId}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </TableCell>
    </StyledTableRow>
  );
});
