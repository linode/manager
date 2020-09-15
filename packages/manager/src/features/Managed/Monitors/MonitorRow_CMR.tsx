import { ManagedServiceMonitor } from '@linode/api-v4/lib/managed';
import * as React from 'react';
import { Link } from 'react-router-dom';
import TicketIcon from 'src/assets/icons/ticket.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

import ActionMenu from './MonitorActionMenu_CMR';
import { statusIconMap, statusTextMap } from './monitorMaps';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  label: {
    fontFamily: theme.font.bold,
    width: '30%'
  },
  icon: {
    alignItems: 'center',
    transition: 'color 225ms ease-in-out',
    '&:hover': {
      color: theme.color.red
    }
  },
  monitorDescription: {
    paddingTop: theme.spacing(1) / 2
  },
  monitorRow: {
    '&:before': {
      display: 'none'
    }
  },
  errorStatus: {
    color: theme.color.red
  },
  actionCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0
  }
}));

interface Props {
  monitor: ManagedServiceMonitor;
  issues: ExtendedIssue[];
  openDialog: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
}

type CombinedProps = Props;

export const MonitorRow: React.FunctionComponent<CombinedProps> = props => {
  const classes = useStyles();

  const {
    monitor,
    issues,
    openDialog,
    openHistoryDrawer,
    openMonitorDrawer
  } = props;

  const Icon = statusIconMap[monitor.status];

  // For now, only include a ticket icon in this view if the ticket is still open (per Jay).
  const openIssues = issues.filter(thisIssue => !thisIssue.dateClosed);

  return (
    <TableRow
      key={monitor.id}
      data-qa-monitor-cell={monitor.id}
      data-testid={'monitor-row'}
      className={classes.monitorRow}
      ariaLabel={`Monitor ${monitor.label}`}
    >
      <TableCell className={classes.label} data-qa-monitor-label>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className={classes.icon} style={{ display: 'flex' }}>
            <Icon height={30} width={30} />
          </Grid>
          <Grid item>{monitor.label}</Grid>
        </Grid>
      </TableCell>
      <TableCell data-qa-monitor-status>
        <Grid container item direction="row" alignItems="center">
          <Grid item>
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
                  to={`/support/tickets/${issues[0].entity.id}`}
                  className={classes.icon}
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
      <TableCell className={classes.actionCell}>
        <ActionMenu
          status={monitor.status}
          monitorID={monitor.id}
          openDialog={openDialog}
          openMonitorDrawer={openMonitorDrawer}
          openHistoryDrawer={openHistoryDrawer}
          label={monitor.label}
        />
      </TableCell>
    </TableRow>
  );
};

export default MonitorRow;
