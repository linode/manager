import * as React from 'react';
import Disabled from 'src/assets/icons/monitor-disabled.svg';
import Bad from 'src/assets/icons/monitor-failed.svg';
import Good from 'src/assets/icons/monitor-ok.svg';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

import ActionMenu from './MonitorActionMenu';

type ClassNames =
  | 'root'
  | 'label'
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
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const statusIconMap: Record<Linode.MonitorStatus, any> = {
  ok: Good,
  problem: Bad,
  disabled: Disabled,
  pending: Good // @todo need an icon for this
};

export const statusTextMap: Record<Linode.MonitorStatus, string> = {
  ok: 'Verified',
  problem: 'Failed',
  pending: 'Pending',
  disabled: 'Disabled'
};

export const monitorRow: React.FunctionComponent<CombinedProps> = props => {
  const { classes, monitor } = props;
  const Icon = statusIconMap[monitor.status];
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
          <Grid item className="classes.icon">
            <Icon className="classes.icon" height={30} width={30} />
          </Grid>
          <Grid item>
            <Typography variant="h3">{monitor.label}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell parentColumn="Status" data-qa-monitor-status>
        <Typography
          className={monitor.status === 'problem' ? classes.errorStatus : ''}
        >
          {statusTextMap[monitor.status]}
        </Typography>
      </TableCell>
      <TableCell parentColumn="Resource" data-qa-monitor-resource>
        <Typography>{monitor.address}</Typography>
      </TableCell>
      <TableCell>
        <ActionMenu status={monitor.status} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(monitorRow);
