import Backup from '@material-ui/icons/Backup';
import * as classNames from 'classnames';
import { compose } from 'ramda';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DashboardCard from '../DashboardCard';

type ClassNames =
  | 'root'
  | 'itemTitle'
  | 'header'
  | 'icon'
  | 'section'
  | 'sectionLink'
  | 'title'
  | 'ctaLink';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    width: '100%'
  },
  header: {
    textAlign: 'center',
    fontSize: 18
  },
  icon: {
    color: theme.color.blueDTwhite,
    margin: theme.spacing(1),
    fontSize: 32
  },
  itemTitle: {
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main
  },
  section: {
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  sectionLink: {
    cursor: 'pointer'
  },
  title: {
    background: theme.bg.tableHeader,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing(1)}px !important`
  },
  ctaLink: {
    display: 'block'
  }
});

interface Props {
  accountBackups: boolean;
  linodesWithoutBackups: number;
  openBackupDrawer: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

export const BackupsDashboardCard: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    accountBackups,
    classes,
    linodesWithoutBackups,
    openBackupDrawer
  } = props;

  if (accountBackups && !linodesWithoutBackups) {
    return null;
  }

  return (
    <DashboardCard>
      <Paper
        className={classNames({
          [classes.section]: true,
          [classes.title]: true
        })}
      >
        <Backup className={classes.icon} />
        <Typography className={classes.header} variant="h1">
          Back Up Your Data and Keep it Safe
        </Typography>
      </Paper>
      {!accountBackups && (
        <Link
          to="/account/settings"
          data-qa-account-link
          className={classes.ctaLink}
        >
          <Paper
            className={classNames({
              [classes.section]: true,
              [classes.sectionLink]: true
            })}
          >
            <Typography variant="h3" className={classes.itemTitle}>
              Linode Backup Auto-Enrollment
            </Typography>
            <Typography variant="body1">
              If you enable this global setting, new Linodes will be
              automatically enrolled in the Backups service.
            </Typography>
          </Paper>
        </Link>
      )}
      {/* Only show this section if the user has Linodes without backups */}
      {Boolean(linodesWithoutBackups) && (
        <a
          onClick={openBackupDrawer}
          data-qa-backup-existing
          className={classes.ctaLink}
          href="javascript:;"
        >
          <Paper
            className={classNames({
              [classes.section]: true,
              [classes.sectionLink]: true
            })}
          >
            <Typography variant="h3" className={classes.itemTitle}>
              Enable Backups for Existing Linodes
            </Typography>
            <Typography variant="body1" data-qa-linodes-message>
              {`You currently have
                ${linodesWithoutBackups} ${
                linodesWithoutBackups > 1 ? 'Linodes' : 'Linode'
              }
                without backups. Enable backups to protect your data.`}
            </Typography>
          </Paper>
        </a>
      )}
    </DashboardCard>
  );
};

BackupsDashboardCard.displayName = 'BackupsDashboardCard';

const styled = withStyles(styles);

const enhanced: any = compose(
  styled,
  withRouter
)(BackupsDashboardCard);

export default enhanced;
