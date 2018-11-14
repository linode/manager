import * as classNames from 'classnames';
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
| 'sectionLink'
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
  sectionLink: {
    cursor: 'pointer',
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

export const BackupsDashboardCard: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, linodesWithoutBackups, openBackupDrawer } = props;

  return (
    <DashboardCard>
      <Paper className={classNames(
        {
          [classes.section]: true,
          [classes.title]: true
        }
      )}>
        <Backup className={classes.icon} />
        <Typography className={classes.header} variant="headline">
          Back Up Your Data and Keep it Safe
        </Typography>
      </Paper>
      <Link to="/account/settings" data-qa-account-link>
        <Paper className={classNames(
          {
            [classes.section]: true,
            [classes.sectionLink]: true
          }
          )}
        >
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
        <Paper
          onClick={openBackupDrawer}
          data-qa-backup-existing
          className={classNames(
            {
              [classes.section]: true,
              [classes.sectionLink]: true
            }
          )}
        >
          <Typography variant="subheading" className={classes.itemTitle} >
            Enable Backups for Existing Linodes
          </Typography>
          <Typography variant="caption" data-qa-linodes-message>
            {
              `You currently have
              ${linodesWithoutBackups} ${linodesWithoutBackups > 1 ? 'Linodes' : 'Linode'}
              without backups. Enable backups to protect your data.`
            }
          </Typography>
        </Paper>
      }
    </DashboardCard>
  );
};

BackupsDashboardCard.displayName = "BackupsDashboardCard";

const styled = withStyles(styles, { withTheme: true });

const enhanced: any = compose(
  styled,
  withRouter,
)(BackupsDashboardCard)

export default enhanced;
