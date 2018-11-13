import { compose } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Backup from '@material-ui/icons/Backup';

import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
| 'itemTitle'
| 'header'
| 'icon'
| 'section'
| 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    width: '100%',
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
  },
  icon: {
    color: theme.color.blueDTwhite,
    margin: theme.spacing.unit,
    fontSize: 32,
  },
  itemTitle: {
    marginBottom: theme.spacing.unit,
    color: theme.color.blueDTwhite,
  },
  section: {
    padding: theme.spacing.unit * 3,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    background: theme.bg.offWhite,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing.unit}px !important`,
  },
});

interface Props {
  linodesWithoutBackups: number,
  openBackupDrawer: () => void,
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

const BackupsDashboardCard: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linodesWithoutBackups, openBackupDrawer } = props;

  return (
    <DashboardCard>
      <Paper className={[classes.section, classes.title].join(' ')} >
        <Backup className={classes.icon} />
        <Typography className={classes.header} variant="headline">
          Back Up Your Data and Keep it Safe
        </Typography>
      </Paper>
      <Link to="/account/settings">
        <Paper className={classes.section} >
          <Typography variant="subheading" className={classes.itemTitle} >
            Linode Backup Auto-Enrollment
          </Typography>
          <Typography variant="caption" >
            If you enable this global setting, new Linodes will be automatically enrolled
            in the Backups service.
          </Typography>
        </Paper>
      </Link>
      {/* Only show this section if the user has Linodes without backups */}
      {Boolean(linodesWithoutBackups) &&
        <Paper className={classes.section} onClick={openBackupDrawer} >
          <Typography variant="subheading" className={classes.itemTitle} >
            Enable Backups for Existing Linodes
          </Typography>
          <Typography variant="caption" >
            You currently have {linodesWithoutBackups} Linodes without backups.
            Enable backups to protect your data.
          </Typography>
        </Paper>
      }

    </DashboardCard>
  );
};

const styled = withStyles(styles, { withTheme: true });

const enhanced: any = compose(
  styled,
  withRouter,
)(BackupsDashboardCard)

export default enhanced;
