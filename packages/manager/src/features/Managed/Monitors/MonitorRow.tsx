import { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import TicketIcon from 'src/assets/icons/ticket.svg';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { ExtendedIssue } from 'src/queries/managed/types';

import ActionMenu from './MonitorActionMenu';
import { statusIconMap, statusTextMap } from './monitorMaps';

const useStyles = makeStyles((theme: Theme) => ({
  errorStatus: {
    color: theme.color.red,
  },
  icon: {
    '&:hover': {
      color: theme.color.red,
    },
    alignItems: 'center',
    transition: 'color 225ms ease-in-out',
  },
  label: {
    fontFamily: theme.font.bold,
    width: '30%',
  },
  monitorDescription: {
    paddingTop: theme.spacing(0.5),
  },
  monitorRow: {
    '&:before': {
      display: 'none',
    },
  },
}));

interface Props {
  issues: ExtendedIssue[];
  monitor: ManagedServiceMonitor;
  openDialog: (id: number, label: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
}

export const MonitorRow: React.FC<Props> = (props) => {
  const classes = useStyles();

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

  return (
    <TableRow
      ariaLabel={`Monitor ${monitor.label}`}
      className={classes.monitorRow}
      data-qa-monitor-cell={monitor.id}
      data-testid={'monitor-row'}
      key={monitor.id}
    >
      <TableCell className={classes.label} data-qa-monitor-label>
        <Grid alignItems="center" container spacing={2} wrap="nowrap">
          <Grid className={classes.icon} style={{ display: 'flex' }}>
            <Icon height={30} width={30} />
          </Grid>
          <Grid>{monitor.label}</Grid>
        </Grid>
      </TableCell>
      <TableCell data-qa-monitor-status>
        <Grid alignItems="center" container direction="row" spacing={1}>
          <Grid>
            <Typography
              className={
                monitor.status === 'problem' ? classes.errorStatus : ''
              }
            >
              {statusTextMap[monitor.status]}
            </Typography>
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
                <Link
                  className={classes.icon}
                  to={`/support/tickets/${issues[0].entity.id}`}
                >
                  <TicketIcon />
                </Link>
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
    </TableRow>
  );
};

export default MonitorRow;
