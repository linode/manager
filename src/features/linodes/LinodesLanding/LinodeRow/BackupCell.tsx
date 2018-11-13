import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Backup from '@material-ui/icons/Backup';

import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';

type ClassNames =
  'icon'
  | 'noBackupText'
  | 'root'
  | 'wrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  icon: {
    fontSize: 18,
    fill: theme.palette.primary.main,
  },
  noBackupText: {
    marginRight: '8px',
  },
  root: {
    width: '15%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  wrapper: {
    display: 'flex',
    alignContent: 'center',
  },
});

interface Props {
  mostRecentBackup?: string;
  linodeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BackupCell: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, mostRecentBackup, linodeId } = props;

  return (
    <TableCell parentColumn="Last Backup" className={classes.root}>
      {
        mostRecentBackup ?
          (
            <Typography variant="caption">
              <DateTimeDisplay value={mostRecentBackup} humanizeCutoff={"never"} />
            </Typography>
          )
          : (
            <div className={classes.wrapper}>
              <Typography variant="caption" className={classes.noBackupText}>Never</Typography>
              <Tooltip title="Enable Backups">
                <a
                  aria-label={'Enable Backups'}
                  href={`/linodes/${linodeId}/backup`}
                >
                  <Backup
                    className={`${classes.icon}`}
                  />
                </a>
              </Tooltip>
            </div>
          )
      }
    </TableCell>
  )
};

const styled = withStyles(styles);

export default styled(BackupCell);
