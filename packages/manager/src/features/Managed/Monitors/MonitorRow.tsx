import * as React from 'react';
import { Link } from 'react-router-dom';
import TicketIcon from 'src/assets/icons/ticket.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { ExtendedIssue } from 'src/store/managed/issues.actions';

import ActionMenu from './MonitorActionMenu';
import { statusIconMap, statusTextMap } from './monitorMaps';

type ClassNames =
  | 'root'
  | 'label'
  | 'icon'
  | 'monitorDescription'
  | 'monitorRow'
  | 'errorStatus';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    label: {
      width: '30%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      }
    },
    icon: {
      alignItems: 'center',
      marginLeft: theme.spacing(1),
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
    }
  });

interface Props {
  monitor: Linode.ManagedServiceMonitor;
  issues: ExtendedIssue[];
  openDialog: (id: number, label: string) => void;
  openMonitorDrawer: (id: number, mode: string) => void;
  openHistoryDrawer: (id: number, label: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const monitorRow: React.FunctionComponent<CombinedProps> = props => {
  const {
    classes,
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
    >
      <TableCell
        parentColumn="Monitor"
        className={classes.label}
        data-qa-monitor-label
      >
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className={classes.icon} style={{ display: 'flex' }}>
            <Icon height={30} width={30} />
          </Grid>
          <Grid item>
            <Typography variant="h3">{monitor.label}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Status" data-qa-monitor-status>
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
      <TableCell parentColumn="Resource" data-qa-monitor-resource>
        <Typography>{monitor.address}</Typography>
      </TableCell>
      <TableCell>
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

const styled = withStyles(styles);

export default styled(monitorRow);
