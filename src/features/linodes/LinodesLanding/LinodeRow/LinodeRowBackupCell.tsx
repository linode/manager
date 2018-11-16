import Backup from '@material-ui/icons/Backup';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';

type ClassNames =
  'icon'
  | 'noBackupText'
  | 'root'
  | 'wrapper'
  | 'backupLink';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  icon: {
    fontSize: 18,
    fill: theme.color.grey1,
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
  backupLink: {
    display: 'flex'
  }
});

interface Props {
  mostRecentBackup?: string;
  linodeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowBackupCell: React.StatelessComponent<CombinedProps> = (props) => {
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
              <Tooltip 
                title="Enable Backups"
                placement={'right'}
              >
                <a
                  aria-label={'Enable Backups'}
                  href={`/linodes/${linodeId}/backup`}
                  className={classes.backupLink}
                >
                  <Typography variant="caption" className={classes.noBackupText}>Never</Typography>
                  <Backup
                    className={`${classes.icon} backupIcon`}
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

export default styled(LinodeRowBackupCell);
