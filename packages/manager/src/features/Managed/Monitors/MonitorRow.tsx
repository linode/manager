import { Tooltip, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import TicketIcon from 'src/assets/icons/ticket.svg';
import { TableCell } from 'src/components/TableCell';

import ActionMenu from './MonitorActionMenu';
import { statusIconMap, statusTextMap } from './monitorMaps';
import {
  StyledGrid,
  StyledLink,
  StyledTableCell,
  StyledTableRow,
  StyledTypography,
} from './MonitorRow.styles';

import type { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import type { ExtendedIssue } from 'src/queries/managed/types';

interface MonitorRowProps {
  issues: ExtendedIssue[];
  monitor: ManagedServiceMonitor;
  openDialog: (id: number, label: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
}

export const MonitorRow = (props: MonitorRowProps) => {
  const {
    issues,
    monitor,
    openDialog,
    openHistoryDrawer,
    openMonitorDrawer,
  } = props;

  const Icon = statusIconMap[monitor.status];

  // For now, only include a ticket icon in this view if the ticket is still open (per Jay).
  const openIssues = issues.filter((thisIssue) => !thisIssue.dateClosed);

  const ConditionalTypography =
    monitor.status === 'problem' ? StyledTypography : Typography;

  return (
    <StyledTableRow
      data-qa-monitor-cell={monitor.id}
      data-testid={'monitor-row'}
      key={monitor.id}
    >
      <StyledTableCell data-qa-monitor-label>
        <Grid
          container
          spacing={2}
          wrap="nowrap"
          sx={{
            alignItems: 'center',
          }}
        >
          <StyledGrid>
            <Icon height={30} width={30} />
          </StyledGrid>
          <Grid>{monitor.label}</Grid>
        </Grid>
      </StyledTableCell>
      <TableCell data-qa-monitor-status>
        <Grid
          container
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
          }}
        >
          <Grid>
            <ConditionalTypography>
              {statusTextMap[monitor.status]}
            </ConditionalTypography>
          </Grid>
          <Grid>
            {openIssues.length > 0 && (
              <Tooltip
                data-qa-open-ticket-tooltip
                enterTouchDelay={0}
                leaveTouchDelay={5000}
                placement={'top'}
                title={'See the open ticket associated with this incident'}
              >
                <StyledLink to={`/support/tickets/${issues[0].entity.id}`}>
                  <TicketIcon />
                </StyledLink>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </TableCell>
      <TableCell data-qa-monitor-resource>
        <Typography>{monitor.address}</Typography>
      </TableCell>
      <TableCell actionCell>
        <ActionMenu
          label={monitor.label}
          monitorID={monitor.id}
          openDialog={openDialog}
          openHistoryDrawer={openHistoryDrawer}
          openMonitorDrawer={openMonitorDrawer}
          status={monitor.status}
        />
      </TableCell>
    </StyledTableRow>
  );
};

export default MonitorRow;
